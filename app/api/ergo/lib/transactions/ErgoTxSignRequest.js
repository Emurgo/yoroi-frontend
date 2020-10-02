// @flow

import BigNumber from 'bignumber.js';
import { ISignRequest } from '../../../common/lib/transactions/ISignRequest';
import { getErgoCurrencyMeta } from '../../currencyInfo';
import { Transaction } from '@coinbarn/ergo-ts';
import type {
  Address, Value, Addressing,
} from '../../../ada/lib/storage/models/PublicDeriver/interfaces';
import type { ErgoAddressedUtxo } from './types';
import { encode } from 'bs58';

type NetworkSettingSnapshot = {|
  +FeeAddress: string,
|};

export class ErgoTxSignRequest implements ISignRequest<Transaction> {

  senderUtxos: Array<ErgoAddressedUtxo>;
  unsignedTx: Transaction;
  changeAddr: Array<{| ...Address, ...Value, ...Addressing |}>;
  networkSettingSnapshot: NetworkSettingSnapshot;

  constructor(signRequest: {|
    senderUtxos: Array<ErgoAddressedUtxo>,
    unsignedTx: Transaction,
    changeAddr: Array<{| ...Address, ...Value, ...Addressing |}>,
    networkSettingSnapshot: NetworkSettingSnapshot,
  |}) {
    this.senderUtxos = signRequest.senderUtxos;
    this.unsignedTx = signRequest.unsignedTx;
    this.changeAddr = signRequest.changeAddr;
    this.networkSettingSnapshot = signRequest.networkSettingSnapshot;

    // note: ergo-ts drops the value information from transaction inputs
    // so we manually re-add it
    for (const utxo of signRequest.senderUtxos) {
      const inputInTx = signRequest.unsignedTx.inputs.find(input => input.boxId === utxo.boxId);
      if (inputInTx == null) throw new Error(`Should never happen`);
      inputInTx.value = Number.parseInt(utxo.amount, 10);
      inputInTx.address = encode(Buffer.from(utxo.receiver, 'hex'));
    }
  }

  totalInput(shift: boolean): BigNumber {
    return getTxInputTotal(this.unsignedTx, this.changeAddr, shift);
  }

  totalOutput(shift: boolean): BigNumber {
    return getTxOutputTotal(this.unsignedTx, shift, this.networkSettingSnapshot.FeeAddress);
  }

  fee(shift: boolean): BigNumber {
    return getErgoTxFee(this.unsignedTx, shift, this.networkSettingSnapshot.FeeAddress);
  }

  uniqueSenderAddresses(): Array<string> {
    return Array.from(new Set(this.senderUtxos.map(utxo => utxo.receiver)));
  }

  receivers(includeChangeAndFee: boolean): Array<string> {
    const receivers: Array<string> = [];

    const changeAddrs = new Set(this.changeAddr.map(change => change.address));
    const outputs = this.unsignedTx.outputs;
    for (let i = 0; i < outputs.length; i++) {
      const output = outputs[i];
      const addr = Buffer.from(output.address.addrBytes).toString('hex');
      if (!includeChangeAndFee) {
        if (changeAddrs.has(addr)) {
          continue;
        }
      }
      if (!includeChangeAndFee) {
        if (addr === this.networkSettingSnapshot.FeeAddress) {
          continue;
        }
      }
      receivers.push(addr);
    }
    return receivers;
  }

  isEqual(tx: ?(mixed| Transaction)): boolean {
    if (tx == null) return false;
    if (!(tx instanceof Transaction)) {
      return false;
    }
    return ergoTxEqual(this.unsignedTx, tx);
  }

  self(): Transaction {
    return this.unsignedTx;
  }
}

export function getTxInputTotal(
  tx: Transaction,
  changeAddr: Array<{| ...Address, ...Value, ...Addressing |}>,
  shift: boolean
): BigNumber {
  let sum = new BigNumber(0);

  const inputs = tx.inputs;
  for (let i = 0; i < inputs.length; i++) {
    const input = inputs[i];
    const value = new BigNumber(input.value ?? 0);
    sum = sum.plus(value);
  }

  const change = changeAddr
    .map(val => new BigNumber(val.value || new BigNumber(0)))
    .reduce((changeSum, val) => changeSum.plus(val), new BigNumber(0));

  sum = sum.minus(change);
  if (shift) {
    return sum.shiftedBy(-getErgoCurrencyMeta().decimalPlaces.toNumber());
  }
  return sum;
}

export function getTxOutputTotal(
  tx: Transaction,
  shift: boolean,
  feeAddress: string,
): BigNumber {
  let sum = new BigNumber(0);

  for (const output of tx.outputs) {
    if (output.address.addrBytes.toString('hex') === feeAddress) {
      continue;
    }
    const value = new BigNumber(output.value);
    sum = sum.plus(value);
  }
  if (shift) {
    return sum.shiftedBy(-getErgoCurrencyMeta().decimalPlaces.toNumber());
  }
  return sum;
}

export function getErgoTxFee(
  tx: Transaction,
  shift: boolean,
  feeAddress: string,
): BigNumber {
  const feeBox = tx.outputs.find(output => (
    output.address.addrBytes.toString('hex') === feeAddress
  ));
  if (feeBox == null) {
    throw new Error(`${nameof(getErgoTxFee)} no fee output found for transaction`);
  }
  const result = new BigNumber(feeBox.value);
  if (shift) {
    return result.shiftedBy(-getErgoCurrencyMeta().decimalPlaces.toNumber());
  }
  return result;
}

export function ergoTxEqual(
  req1: Transaction,
  req2: Transaction,
): boolean {
  const inputs1 = req1.inputs;
  const inputs2 = req2.inputs;
  if (inputs1.length !== inputs2.length) {
    return false;
  }

  const outputs1 = req1.outputs;
  const outputs2 = req2.outputs;
  if (outputs1.length !== outputs2.length) {
    return false;
  }

  for (let i = 0; i < inputs1.length; i++) {
    if (inputs1[i].boxId !== inputs2[i].boxId) {
      return false;
    }
  }
  for (let i = 0; i < outputs1.length; i++) {
    if (outputs1[i].id !== outputs2[i].id) {
      return false;
    }
  }

  return true;
}
