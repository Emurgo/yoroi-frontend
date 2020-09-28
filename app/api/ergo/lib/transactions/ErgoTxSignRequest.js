// @flow

import BigNumber from 'bignumber.js';
import { ISignRequest } from '../../../common/lib/transactions/ISignRequest';
import { getErgoCurrencyMeta } from '../../currencyInfo';
import { Transaction } from '@coinbarn/ergo-ts';
import type {
  Address, Value, Addressing,
} from '../../../ada/lib/storage/models/PublicDeriver/interfaces';
import type { ErgoAddressedUtxo } from './types';

export class ErgoTxSignRequest implements ISignRequest<Transaction> {

  senderUtxos: Array<ErgoAddressedUtxo>;
  unsignedTx: Transaction;
  changeAddr: Array<{| ...Address, ...Value, ...Addressing |}>;

  constructor(signRequest: {|
    senderUtxos: Array<ErgoAddressedUtxo>,
    unsignedTx: Transaction,
    changeAddr: Array<{| ...Address, ...Value, ...Addressing |}>,
  |}) {
    this.senderUtxos = signRequest.senderUtxos;
    this.unsignedTx = signRequest.unsignedTx;
    this.changeAddr = signRequest.changeAddr;
  }

  totalInput(shift: boolean): BigNumber {
    return getTxInputTotal(this.unsignedTx, shift);
  }

  totalOutput(shift: boolean): BigNumber {
    return getTxOutputTotal(this.unsignedTx, shift);
  }

  fee(shift: boolean): BigNumber {
    return getErgoTxFee(this.unsignedTx, shift);
  }

  uniqueSenderAddresses(): Array<string> {
    return Array.from(new Set(this.senderUtxos.map(utxo => utxo.receiver)));
  }

  receivers(includeChange: boolean): Array<string> {
    const receivers: Array<string> = [];

    const changeAddrs = new Set(this.changeAddr.map(change => change.address));
    const outputs = this.unsignedTx.outputs;
    for (let i = 0; i < outputs.length; i++) {
      const output = outputs[i];
      const addr = Buffer.from(output.address.addrBytes).toString('hex');
      if (!includeChange) {
        if (changeAddrs.has(addr)) {
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
  shift: boolean
): BigNumber {
  let sum = new BigNumber(0);

  const inputs = tx.inputs;
  for (let i = 0; i < inputs.length; i++) {
    const input = inputs[i];
    const value = new BigNumber(input.value ?? 0);
    sum = sum.plus(value);
  }
  if (shift) {
    return sum.shiftedBy(-getErgoCurrencyMeta().decimalPlaces.toNumber());
  }
  return sum;
}

export function getTxOutputTotal(
  tx: Transaction,
  shift: boolean
): BigNumber {
  let sum = new BigNumber(0);

  const outputs = tx.outputs;
  for (let i = 0; i < outputs.length; i++) {
    const output = outputs[i];
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
): BigNumber {
  const out = getTxOutputTotal(tx, false);
  const ins = getTxInputTotal(tx, false);
  const result = ins.minus(out);
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
