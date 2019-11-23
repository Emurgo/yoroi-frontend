// @flow

import { RustModule } from '../../lib/cardanoCrypto/rustLoader';
import BigNumber from 'bignumber.js';

export function getTxInputTotal(
  IOs: RustModule.WalletV3.InputOutput,
): BigNumber {
  let sum = new BigNumber(0);

  const inputs = IOs.inputs();
  for (let i = 0; i < inputs.size(); i++) {
    const input = inputs.get(i);
    const value = new BigNumber(input.value().to_str());
    sum = sum.plus(value);
  }
  return sum;
}

export function getTxOutputTotal(
  IOs: RustModule.WalletV3.InputOutput,
): BigNumber {
  let sum = new BigNumber(0);

  const outputs = IOs.outputs();
  for (let i = 0; i < outputs.size(); i++) {
    const output = outputs.get(i);
    const value = new BigNumber(output.value().to_str());
    sum = sum.plus(value);
  }
  return sum;
}

export function getFee(
  IOs: RustModule.WalletV3.InputOutput,
): BigNumber {
  const out = getTxOutputTotal(IOs);
  const ins = getTxInputTotal(IOs);
  return ins.minus(out);
}
