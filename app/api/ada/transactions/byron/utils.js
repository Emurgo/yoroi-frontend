// @flow

import BigNumber from 'bignumber.js';
import type {
  BaseSignRequest,
} from '../types';
import { RustModule } from '../../lib/cardanoCrypto/rustLoader';
import { getAdaCurrencyMeta } from '../../currencyInfo';


export function coinToBigNumber(coin: RustModule.WalletV2.Coin): BigNumber {
  const ada = new BigNumber(coin.ada());
  const lovelacesPerAda = new BigNumber(10).pow(getAdaCurrencyMeta().decimalPlaces);
  const lovelace = ada.times(lovelacesPerAda).plus(coin.lovelace());
  return lovelace;
}

export function signRequestFee(
  signRequest: BaseSignRequest<RustModule.WalletV2.Transaction>,
  shift: boolean
): BigNumber {
  const inputTotal = signRequest.senderUtxos
    .map(utxo => new BigNumber(utxo.amount))
    .reduce((sum, val) => sum.plus(val), new BigNumber(0));

  const tx = signRequest.unsignedTx.to_json();
  const outputTotal = tx.outputs
    .map(val => new BigNumber(val.value))
    .reduce((sum, val) => sum.plus(val), new BigNumber(0));

  let result = inputTotal.minus(outputTotal);
  if (shift) {
    result = result.shiftedBy(-getAdaCurrencyMeta().decimalPlaces.toNumber());
  }
  return result;
}

export function signRequestTotalInput(
  signRequest: BaseSignRequest<any>,
  shift: boolean
): BigNumber {
  const inputTotal = signRequest.senderUtxos
    .map(utxo => new BigNumber(utxo.amount))
    .reduce((sum, val) => sum.plus(val), new BigNumber(0));

  const change = signRequest.changeAddr
    .map(val => new BigNumber(val.value || new BigNumber(0)))
    .reduce((sum, val) => sum.plus(val), new BigNumber(0));

  let result = inputTotal.minus(change);
  if (shift) {
    result = result.shiftedBy(-getAdaCurrencyMeta().decimalPlaces.toNumber());
  }
  return result;
}

export function signRequestReceivers(
  signRequest: BaseSignRequest<RustModule.WalletV2.Transaction>,
  includeChange: boolean
): Array<string> {
  const tx = signRequest.unsignedTx.to_json();
  let receivers = tx.outputs
    .map(val => val.address);

  if (!includeChange) {
    const changeAddrs = signRequest.changeAddr.map(change => change.address);
    receivers = receivers.filter(addr => !changeAddrs.includes(addr));
  }
  return receivers;
}

/**
 * Signing a tx is a destructive operation in Rust
 * We create a copy of the tx so the user can retry if they get the password wrong
 */
export function copySignRequest(
  signRequest: BaseSignRequest<RustModule.WalletV2.Transaction>
): BaseSignRequest<RustModule.WalletV2.Transaction> {
  return {
    changeAddr: signRequest.changeAddr,
    senderUtxos: signRequest.senderUtxos,
    unsignedTx: signRequest.unsignedTx.clone(),
    certificate: undefined,
  };
}

export function byronTxEqual(
  req1: RustModule.WalletV2.Transaction,
  req2: RustModule.WalletV2.Transaction,
): boolean {
  const tentativeTxJson = JSON.stringify(req1.to_json());
  const plannedTxJson = JSON.stringify(req2.to_json());

  return tentativeTxJson === plannedTxJson;
}
