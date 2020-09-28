// @flow

import BigNumber from 'bignumber.js';

export interface ISignRequest<T> {
  totalInput(shift: boolean): BigNumber;
  totalOutput(shift: boolean): BigNumber;
  fee(shift: boolean): BigNumber;
  uniqueSenderAddresses(): Array<string>;
  receivers(includeChange: boolean): Array<string>;
  isEqual(tx: ?mixed): boolean;

  self(): T;
}
