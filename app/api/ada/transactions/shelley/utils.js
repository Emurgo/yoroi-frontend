// @flow

import { RustModule } from '../../lib/cardanoCrypto/rustLoader';
import BigNumber from 'bignumber.js';
import {
  DECIMAL_PLACES_IN_ADA,
} from '../../../../config/numbersConfig';
import type {
  BaseSignRequest,
} from '../types';

export function getTxInputTotal(
  IOs: RustModule.WalletV3.InputOutput,
  shift: boolean
): BigNumber {
  let sum = new BigNumber(0);

  const inputs = IOs.inputs();
  for (let i = 0; i < inputs.size(); i++) {
    const input = inputs.get(i);
    const value = new BigNumber(input.value().to_str());
    sum = sum.plus(value);
  }
  if (shift) {
    return sum.shiftedBy(-DECIMAL_PLACES_IN_ADA);
  }
  return sum;
}

export function getTxOutputTotal(
  IOs: RustModule.WalletV3.InputOutput,
  shift: boolean
): BigNumber {
  let sum = new BigNumber(0);

  const outputs = IOs.outputs();
  for (let i = 0; i < outputs.size(); i++) {
    const output = outputs.get(i);
    const value = new BigNumber(output.value().to_str());
    sum = sum.plus(value);
  }
  if (shift) {
    return sum.shiftedBy(-DECIMAL_PLACES_IN_ADA);
  }
  return sum;
}

export function getShelleyTxFee(
  IOs: RustModule.WalletV3.InputOutput,
  shift: boolean,
): BigNumber {
  const out = getTxOutputTotal(IOs, false);
  const ins = getTxInputTotal(IOs, false);
  const result = ins.minus(out);
  if (shift) {
    return result.shiftedBy(-DECIMAL_PLACES_IN_ADA);
  }
  return result;
}

export function getShelleyTxReceivers(
  signRequest: BaseSignRequest<RustModule.WalletV3.InputOutput>,
  includeChange: boolean
): Array<string> {
  const receivers: Array<string> = [];

  const changeAddrs = new Set(signRequest.changeAddr.map(change => change.address));
  const outputs = signRequest.unsignedTx.outputs();
  for (let i = 0; i < outputs.size(); i++) {
    const output = outputs.get(i);
    const addr = Buffer.from(output.address().as_bytes()).toString('hex');
    if (!includeChange) {
      if (changeAddrs.has(addr)) {
        continue;
      }
    }
    receivers.push(addr);
  }
  return receivers;
}

export function shelleyTxEqual(
  req1: RustModule.WalletV3.InputOutput,
  req2: RustModule.WalletV3.InputOutput,
): boolean {
  const inputs1 = req1.inputs();
  const inputs2 = req2.inputs();
  if (inputs1.size() !== inputs2.size()) {
    return false;
  }

  const outputs1 = req1.outputs();
  const outputs2 = req2.outputs();
  if (outputs1.size() !== outputs2.size()) {
    return false;
  }

  for (let i = 0; i < inputs1.size(); i++) {
    const input1 = Buffer.from(inputs1.get(i).as_bytes()).toString('hex');
    const input2 = Buffer.from(inputs2.get(i).as_bytes()).toString('hex');
    if (input1 !== input2) {
      return false;
    }
  }
  for (let i = 0; i < outputs1.size(); i++) {
    const output1 = outputs1.get(i);
    const output2 = outputs2.get(i);

    if (output1.value().to_str() !== output2.value().to_str()) {
      return false;
    }
    const out1Addr = Buffer.from(output1.address().as_bytes()).toString('hex');
    const out2Addr = Buffer.from(output2.address().as_bytes()).toString('hex');
    if (out1Addr !== out2Addr) {
      return false;
    }
  }

  return true;
}
