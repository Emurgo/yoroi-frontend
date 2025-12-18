// @flow

import { CoreAddressTypes } from './lib/storage/database/primitives/enums';
import { addressHexToBech32 } from './lib/cardanoCrypto/utils';
import { getPublicDeriverById } from '../../../chrome/extension/background/handlers/yoroi/utils';
import AdaApi, { walletSignData, encodeHardwareWalletSignResult } from './index';
import { getNetworkById } from './lib/storage/database/prepackaged/networks';
import { MessageAddressFieldType, AddressType } from '@cardano-foundation/ledgerjs-hw-app-cardano';
import { LedgerConnect } from '../../utils/hwConnectHandler';
import type { WalletState } from '../../../chrome/extension/background/types';
import { wrapWithFrame } from '../../stores/lib/TrezorWrapper';
import { CardanoDerivationType } from 'trezor-connect-flow';
import LocalStorageApi, { loadSubmittedTransactions } from '../localStorage';
import BigNumber from 'bignumber.js';
import { forceNonNull } from '../../coreUtils.js';
import { getProtocolParameters } from '../thunk';
import type { HaskellShelleyTxSignRequest } from './transactions/shelley/HaskellShelleyTxSignRequest';
import { asAddressedUtxo } from './transactions/utils';
import { NotEnoughMoneyToSendError } from '../common/errors';
import { cardanoUtxoHexFromRemoteFormat } from './transactions/utils';

const localStorageApi = new LocalStorageApi();

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

export async function checkClaimForAddress(claimEndpoint: string, addrBech32: string): Promise<number> {
  const resp = await fetch(`${claimEndpoint}/claims/cardano?address=${addrBech32}`);
  if (!resp.ok) {
    return 0;
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
    return data[0].amount;
  }
  return 0;
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

export async function scanForOriginalDestAddress(
  claimEndpoint: string,
  wallet: WalletState
): Promise<null | {| address: string, amount: string |}> {
  const airdropClaims = await localStorageApi.getAirdropClaimResults();
  const currentWalletClaim = airdropClaims.find(r => r.publicDeriverId === wallet.publicDeriverId);
  if (currentWalletClaim) {
    return { address: currentWalletClaim.destAddr, amount: String(currentWalletClaim.amount) };
  }
  const usedAddrs = wallet.allAddresses.utxoAddresses
    .filter(a => a.address.Type === CoreAddressTypes.CARDANO_BASE && a.address.IsUsed)
    .sort((addr1, addr2) => addr2.path[4] - addr1.path[4])
    .map(addr => addressHexToBech32(addr.address.Hash));
  const unusedAddr1 = addressHexToBech32(
    forceNonNull(
      wallet.allAddresses.utxoAddresses.find(a => a.address.Type === CoreAddressTypes.CARDANO_BASE && !a.address.IsUsed)
    ).address.Hash
  );

  for (let addr of [unusedAddr1, ...usedAddrs]) {
    const resp = await fetch(`${claimEndpoint}/claims/${addr}`);
    if (!resp.ok) {
      continue;
    }
    const json = await resp.json();
    if (json.length === 1) {
      airdropClaims.push({
        publicDeriverId: wallet.publicDeriverId,
        destAddr: addr,
        claimId: json[0].claim_id,
        amount: json[0].amount,
      });
      await localStorageApi.saveAirdropClaimResults(airdropClaims);

      return {
        address: addr,
        amount: json[0].amount,
      };
    }
  }
  return null;
}

type ThawData = Object;

export async function scanAddressesForThaws(
  thawEndpoint: string,
  wallet: WalletState,
  callback: (data: {| address: string, schedule: ThawData |}) => boolean
): Promise<void> {
  const usedAddrs = wallet.allAddresses.utxoAddresses
    .filter(a => a.address.Type === CoreAddressTypes.CARDANO_BASE && a.address.IsUsed)
    .sort((addr1, addr2) => addr2.path[4] - addr1.path[4])
    .map(addr => addressHexToBech32(addr.address.Hash));

  const unusedAddr1 = addressHexToBech32(
    forceNonNull(
      wallet.allAddresses.utxoAddresses.find(a => a.address.Type === CoreAddressTypes.CARDANO_BASE && !a.address.IsUsed)
    ).address.Hash
  );
  for (let address of [unusedAddr1, ...usedAddrs]) {
    const schedule = await getThawScheduleOfAddress(thawEndpoint, address);
    if (schedule) {
      const shouldContinue = callback({ address, schedule });
      if (!shouldContinue) {
        break;
      }
    }
  }
}

const MAX_PER_UTXO_SURPLUS = new BigNumber('2000000');
const MAX_COLLATERAL_COUNT: number = 3;
const COLLATERAL_AMOUNT = '2000000';
// by observation, 2000000 may not work
const FUNDING_AMOUNT = '3000000';

async function pickCollateralUtxos(
  wallet: WalletState
): Promise<?{| utxosToUse: Array<string>, fundingUtxo: string, fundingUtxoAddr: string, |}> {
  const required = new BigNumber(COLLATERAL_AMOUNT);
  const submittedTxs = (await loadSubmittedTransactions()) || [];
  const adaApi = new AdaApi();
  const maxViableUtxoAmount = required.plus(MAX_PER_UTXO_SURPLUS);
  const utxos = wallet.utxos.map(utxo => ({
    utxo_id: `${utxo.output.Transaction.Hash}${utxo.output.UtxoTransactionOutput.OutputIndex}`,
    tx_hash: utxo.output.Transaction.Hash,
    tx_index: utxo.output.UtxoTransactionOutput.OutputIndex,
    receiver: utxo.address,
    amount: forceNonNull(utxo.output.tokens.find(token => token.Token.Identifier === '')).TokenList.Amount,
    assets: utxo.output.tokens
      .filter(token => token.Token.Identifier !== '')
      .map(token => ({
        amount: token.TokenList.Amount,
        assetId: token.Token.Identifier.split('.')[1],
        policyId: token.Token.Identifier.split('.')[0],
        name: token.Token.Metadata.assetName,
      })),
    addressing: utxo.addressing,
  }));
  let utxosToConsider = (
    await adaApi._addressedUtxosWithSubmittedTxs(utxos, wallet.publicDeriverId, wallet.allUtxoAddresses, submittedTxs)
  ).filter(utxo => utxo.assets.length === 0);
  utxosToConsider.sort((utxo1, utxo2) => new BigNumber(utxo1.amount).comparedTo(utxo2.amount));
  let fundingUtxo = null;
  let fundingUtxoAddr = null;
  for (let i = 0; i < utxosToConsider.length; i++) {
    const utxo = utxosToConsider[i];
    if (new BigNumber(utxo.amount).gte(FUNDING_AMOUNT)) {
      fundingUtxo = cardanoUtxoHexFromRemoteFormat(utxo);
      fundingUtxoAddr = addressHexToBech32(utxo.receiver);
      utxosToConsider.splice(i, 1);
      break;
    }
  }
  if (!fundingUtxo || !fundingUtxoAddr) {
    return null;
  }
  utxosToConsider = utxosToConsider.filter(utxo => new BigNumber(utxo.amount).lt(maxViableUtxoAmount));
  const utxosToUse = [];
  let sum = new BigNumber('0');
  let enough = false;
  for (const utxo of utxosToConsider) {
    utxosToUse.push(utxo);
    sum = sum.plus(utxo.amount);
    while (utxosToUse.length > MAX_COLLATERAL_COUNT || sum.minus(utxosToUse[0].amount).gte(required)) {
      // Removing the first (hence the smallest) utxo from the list
      const removedUtxo = utxosToUse.shift();
      sum = sum.minus(removedUtxo.amount);
    }
    if (sum.gte(required)) {
      enough = true;
      break;
    }
  }
  if (enough) {
    for (;;) {
      const smallestUtxo = utxosToUse[0];
      const potentialSum = sum.minus(smallestUtxo.amount);
      if (potentialSum.gte(required)) {
        // First utxo can be removed and still will be enough.
        utxosToUse.shift();
        sum = potentialSum;
      } else {
        break;
      }
    }
    return { utxosToUse: utxosToUse.map(cardanoUtxoHexFromRemoteFormat), fundingUtxo, fundingUtxoAddr };
  }

  return null;
}

async function createReorgTransaction(wallet: WalletState): Promise<HaskellShelleyTxSignRequest> {
  const addressedUtxos = asAddressedUtxo(wallet.utxos);
  const submittedTxs = wallet.submittedTransactions;
  const firstExternalAddress = wallet.externalAddressesByType[CoreAddressTypes.CARDANO_BASE][0];
  const protocolParameters = await getProtocolParameters(wallet);

  const { unsignedTx } = await new AdaApi()._createReorgTx(
    getNetworkById(wallet.networkId),
    wallet.balance.getDefaults(),
    wallet.publicDeriverId,
    wallet.allUtxoAddresses,
    wallet.receiveAddress,
    [],
    COLLATERAL_AMOUNT,
    addressedUtxos,
    submittedTxs,
    firstExternalAddress.address,
    protocolParameters
  );
  return unsignedTx;
}

type GetCollateralUtxosResponse =
  | {|
      state: 'exist',
      collateralUtxos: Array<string>,
      fundingUtxo: string,
      fundingUtxoAddr: string,
    |}
  | {|
      state: 'need-reorg',
      signRequest: HaskellShelleyTxSignRequest,
    |}
  | {|
      state: 'not-enough',
    |}
  | {|
      state: 'error',
      message: string,
    |};

export async function getCollateralUtxos(wallet: WalletState): Promise<GetCollateralUtxosResponse> {
  const getCollateralUtxosResult = await pickCollateralUtxos(wallet);
  if (getCollateralUtxosResult) {
    return {
      state: 'exist',
      collateralUtxos: getCollateralUtxosResult.utxosToUse,
      fundingUtxo: getCollateralUtxosResult.fundingUtxo,
      fundingUtxoAddr: getCollateralUtxosResult.fundingUtxoAddr,
    };
  }
  try {
    const signRequest = await createReorgTransaction(wallet);
    return {
      state: 'need-reorg',
      signRequest,
    };
    // after submitting this tx, calling `getCollateralUtxos` again, `pickCollateralUtxos` should succeed
  } catch (error) {
    if (error instanceof NotEnoughMoneyToSendError) {
      return {
        state: 'not-enough',
      };
    }
    return {
      state: 'error',
      message: error.message,
    };
  }
}

async function getThawScheduleOfAddress(thawEndpoint: string, addr: string): Promise<null | ThawData> {
  try {
    const resp = await fetch(`${thawEndpoint}/thaws/${addr}/schedule`);
    if (!resp.ok) {
      throw new Error('http error');
    }
    const data = await resp.json();
    return data;
  } catch {
    return null;
  }
}

export async function getRedemptionTransaction(
  destAddr: string,
  thawEndpoint: string,
  changeAddr: string,
  collateralUtxos: Array<string>,
  fundingUtxos: Array<string>
): Promise<Object> {
  const resp = await fetch(`${thawEndpoint}/thaws/${destAddr}/transactions/build`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(
      {
        change_address: changeAddr,
        collateral_utxos: collateralUtxos,
        funding_utxos: fundingUtxos,
      },
    ),
  });
  if (!resp.ok) {
    throw new Error('error when querying the redemption transaction building endpoint');
  }
  const respBody = await resp.json();
  return {
    redeemedAmount: respBody.redeemed_amount,
    requireThawingExtraSignature: respBody.require_thawing_extra_signature,
    transaction: respBody.transaction,
    transactionId: respBody.transactionId,
  };
}
