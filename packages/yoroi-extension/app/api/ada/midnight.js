// @flow

import { CoreAddressTypes } from './lib/storage/database/primitives/enums';
import { addressHexToBech32 } from './lib/cardanoCrypto/utils';
import { getPublicDeriverById } from '../../../chrome/extension/background/handlers/yoroi/utils';
import { walletSignData, encodeHardwareWalletSignResult } from './index';
import { getNetworkById } from './lib/storage/database/prepackaged/networks';
import { MessageAddressFieldType, AddressType } from '@cardano-foundation/ledgerjs-hw-app-cardano';
import { LedgerConnect } from '../../utils/hwConnectHandler';
import type { WalletState } from '../../../chrome/extension/background/types';

const TC_HASH = '6bf2adf825baa496729e2eac1e895ebc77973744bce67f44276bf6006f5c21de863ed121e11828d8fc0241773191e26dc1134803a681a9a98ba0ae812553db24';
// remember to change chrome/constants.js
const CHECK_ENDPOINT = 'https://proof-staging.provtree-midnight.com';
const CLAIM_ENDPOINT = 'https://preprod.gd.midnighttge.io/claims/cardano';

type AddressClaimData = {|
  addrHex: string,
  addrBech32: string,
  path: Array<number>,
  value: number,
|};

export async function getAllocatedAddresses(wallet: WalletState): Promise<Array<AddressClaimData>> {
  const result = [];

  for (const addr of wallet.allAddressesByType[CoreAddressTypes.CARDANO_BASE]) {
    const addrBech32 = addressHexToBech32(addr.address);
    const resp = await fetch(`${CHECK_ENDPOINT}/check/cardano/${addrBech32}`);
    let value;
    if (resp.ok) {
      const respBody = await resp.json();
      value = respBody.value;
      if (typeof value !== 'number') {
        value = 0;
      }
    } else {
      value = 0;
    }
    if (value !== 0) {
      result.push({
        addrHex: addr.address,
        addrBech32,
        path: addr.addressing.path,
        value
      });
    }
    // seems Cardano airdrop is based on stake address and we only need to claim one base address
    break;
  }
  return result;
}

export async function checkClaimForAddress(addrBech32: string): Promise<boolean> {
  const resp = await fetch(`${CLAIM_ENDPOINT}?address=${addrBech32}`);
  if (!resp.ok) {
    return false;
  }
  const data = await resp.json();
  /* schema:
    [
      {
        "address": "addr_test1qqx9dx3hhsrtt8p6m7ar076zl6pfj9lnudkplmd69g87yzrekjkpkn09av5l63z6kpr3akd0ueh84czwycjzwzvenweq0zkfsc",
        "amount": 98,
        "blockchain": "cardano",
        "claim_id": "66639426-d98f-05c7-6703-42844ebeaa82",
        "confirmation_blocks": null,
        "dest_address": "addr_test1qzwzfc8cf4zd0xjheaq2fa49grn7hrjreyd80ycmzekvx5krpexes637f06zpytw2584z9x4554lzegr735jdaeuc9gqg476re",
        "failure": null,
        "leaf_index": 39237108,
        "status": "queued",
        "transaction_id": null
      }
    ]
  */
  if (Array.isArray(data) && data.length === 1 && (data[0].status === 'queued' || data[0].status === 'confirmed')) {
    return true;
  }
  return false;
}

export function getClaimMessage(value: number, destAddrBech32: string): string {
  return 'STAR ' + String(value) + ' to ' + destAddrBech32 + ' ' + TC_HASH;
}

export async function claimForAddress(
  wallet: WalletState,
  addrClaimData: AddressClaimData,
  destAddrBech32: string,
  password: string, // only for mnemonic wallet
  locale: string, // only for Ledger
): Promise<void> {
  const  payload = Buffer.from(
    getClaimMessage(addrClaimData.value, destAddrBech32),
    'ascii'
  ).toString('hex');
  let signResult;
  let publicKey;
  if (wallet.type === 'mnemonic') {
    const publicDeriver = await getPublicDeriverById(wallet.publicDeriverId);
    signResult  = await walletSignData(
      publicDeriver,
      password,
      wallet.stakingAddress,
      payload,
    );
    publicKey = signResult.pubKey;
  } else if (wallet.type === 'ledger') {
    const ledgerConnect = new LedgerConnect({ locale });
    const network = getNetworkById(wallet.networkId);
    const config = network.BaseConfig[0];
    const hashPayload = true;
    const { signatureHex, signingPublicKeyHex, addressFieldHex } = await ledgerConnect.signMessage({
      serial: null,
      params: {
        preferHexDisplay: false,
        messageHex: payload,
        signingPath: wallet.stakingAddressing.addressing.path,
        hashPayload,
        addressFieldType: MessageAddressFieldType.ADDRESS,
        address: {
          type: AddressType.REWARD_KEY,
          params: {
            stakingPath: wallet.stakingAddressing.addressing.path,
          },
        },
        network: {
          protocolMagic: config.ByronNetworkId,
          networkId: Number(config.ChainNetworkId),
        },
      },
    });
    signResult = await encodeHardwareWalletSignResult(
      addressFieldHex,
      signatureHex,
      payload,
      signingPublicKeyHex,
      false,
    );
    publicKey = signingPublicKeyHex
  } else {
    throw new Error('unsupported wallet type');
  }
  const params = {
    address: addressHexToBech32(wallet.stakingAddress),
    amount: addrClaimData.value,
    cose_sign1: signResult.signature,
    dest_address: destAddrBech32,
    public_key: publicKey,
  };
  const resp = await fetch(
    CLAIM_ENDPOINT,
    {
      method: 'POST',
      body: JSON.stringify([params]),
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  if (!resp.ok) {
    let errorMessage = '';
    try {
      const respBody = await resp.json();
      errorMessage = respBody[0].error.message;
    } catch {}
    throw new Error(`Error ${resp.status} response: ${errorMessage}`);
  }
}
