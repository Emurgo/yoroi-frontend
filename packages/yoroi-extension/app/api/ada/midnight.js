// @flow

import { CoreAddressTypes } from './lib/storage/database/primitives/enums';
import { addressHexToBech32 } from './lib/cardanoCrypto/utils';
import { getPublicDeriverById } from '../../../chrome/extension/background/handlers/yoroi/utils';
import { walletSignData, encodeHardwareWalletSignResult } from './index';
import { getNetworkById } from './lib/storage/database/prepackaged/networks';
import { MessageAddressFieldType, AddressType } from '@cardano-foundation/ledgerjs-hw-app-cardano';
import { LedgerConnect } from '../../utils/hwConnectHandler';
import type { WalletState } from '../../../chrome/extension/background/types';
import { wrapWithFrame } from '../../stores/lib/TrezorWrapper';
import { CardanoDerivationType } from 'trezor-connect-flow';

const TC_HASH = '31a6bab50a84b8439adcfb786bb2020f6807e6e8fda629b424110fc7bb1c6b8b';

type AddressClaimData = {|
  addrHex: string,
  addrBech32: string,
  path: Array<number>,
  value: number,
|};

export async function getAllocatedAddresses(checkEndpoint: string, wallet: WalletState): Promise<Array<AddressClaimData>> {
  const result = [];

  for (const addr of wallet.allAddressesByType[CoreAddressTypes.CARDANO_BASE]) {
    const addrBech32 = addressHexToBech32(addr.address);
    const resp = await fetch(`${checkEndpoint}/check/cardano/${addrBech32}`);
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
        value,
      });
    }
    // seems Cardano airdrop is based on stake address and we only need to claim one base address
    break;
  }
  return result;
}

export async function checkClaimForAddress(claimEndpoint: string, addrBech32: string): Promise<boolean> {
  const resp = await fetch(`${claimEndpoint}/claims/cardano?address=${addrBech32}`);
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
  return Array.isArray(data) && data.length === 1 && (data[0].status === 'queued' || data[0].status === 'confirmed');
}

export function getClaimMessage(value: number, destAddrBech32: string): string {
  return 'STAR ' + String(value) + ' to ' + destAddrBech32 + ' ' + TC_HASH;
}

type ClaimParams = {|
  address: string,
  amount: number,
  cose_sign1: string,
  dest_address: string,
  public_key: string,
|};

export async function signClaim(
  wallet: WalletState,
  addrClaimData: AddressClaimData,
  destAddrBech32: string,
  password: string, // only for mnemonic wallet
  locale: string // only for Ledger
): Promise<ClaimParams> {
  const payload = Buffer.from(getClaimMessage(addrClaimData.value, destAddrBech32), 'ascii').toString('hex');
  const network = getNetworkById(wallet.networkId);
  const config = network.BaseConfig[0];

  let signResult;
  let publicKey;
  if (wallet.type === 'mnemonic') {
    const publicDeriver = await getPublicDeriverById(wallet.publicDeriverId);
    signResult = await walletSignData(publicDeriver, password, wallet.stakingAddress, payload);
    publicKey = signResult.pubKey;
  } else if (wallet.type === 'ledger') {
    const ledgerConnect = new LedgerConnect({ locale });
    const hashPayload = false;
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
    signResult = await encodeHardwareWalletSignResult(addressFieldHex, signatureHex, payload, signingPublicKeyHex, false);
    publicKey = signingPublicKeyHex;
  } else if (wallet.type === 'trezor') {
    const resp = await wrapWithFrame(trezor =>
      trezor.cardanoSignMessage({
        path: [...wallet.stakingAddressing.addressing.path],
        payload,
        preferHexDisplay: false,
        derivationType: CardanoDerivationType.ICARUS_TREZOR,
        protocolMagic: config.ByronNetworkId,
        networkId: Number(config.ChainNetworkId),
      })
    );
    if (!resp.success) {
      // todo: handle insufficient firmware version
      throw new Error(`Trezor signing error: ${resp.payload.error} (code=${String(resp.payload.code)})`);
    }
    const {
      signature,
      pubKey,
      headers: {
        protected: { address },
      },
    } = resp.payload;
    signResult = await encodeHardwareWalletSignResult(address, signature, payload, pubKey, false);
    publicKey = pubKey;
  } else {
    throw new Error('unsupported wallet type');
  }
  return {
    address: addressHexToBech32(wallet.stakingAddress),
    amount: addrClaimData.value,
    cose_sign1: signResult.signature,
    dest_address: destAddrBech32,
    public_key: publicKey,
  };
}

export async function makeClaim(claimEndpoint: string, params: ClaimParams): Promise<{| claimId: string |}> {
  const resp = await fetch(`${claimEndpoint}/claims/cardano`, {
    method: 'POST',
    body: JSON.stringify([params]),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!resp.ok) {
    let errorMessage = '';
    try {
      const respBody = await resp.json();
      errorMessage = respBody[0].error.message;
    } catch {
      errorMessage = 'response is not JSON';
    }
    throw new Error(`Error ${resp.status} response: ${errorMessage}`);
  }
  const respBody = await resp.json();
  return { claimId: respBody[0].claim_id };
}

type ScanResult =
  | {|
      success: true,
      destAddr: string,
      claimId: string,
      amount: number,
    |}
  | {|
      success: false,
      error: string,
    |};
export async function scanForOriginalDestAddress(
  claimEndpoint: string,
  unusedAddr: string,
  usedAddrs: Array<string>
): Promise<ScanResult | null> {
  for (let addr of [unusedAddr, ...usedAddrs]) {
    const resp = await fetch(`${claimEndpoint}/claims/${addr}`);
    if (!resp.ok) {
      return {
        success: false,
        error: 'failed to fetch the destination address due to network error',
      };
    }
    const json = await resp.json();
    if (json.length === 1) {
      return {
        success: true,
        destAddr: addr,
        claimId: json[0].claim_id,
        amount: json[0].amount,
      };
    }
  }
  return null;
}
