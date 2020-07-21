// @flow

import BigNumber from 'bignumber.js';
import type { BaseSignRequest } from '../../../ada/transactions/types';

export interface ISignRequest<T> {
  totalInput(shift: boolean): BigNumber;
  totalOutput(shift: boolean): BigNumber;
  fee(shift: boolean): BigNumber;
  uniqueSenderAddresses(): Array<string>;
  receivers(includeChange: boolean): Array<string>;
  copy(): ISignRequest<T>;
  isEqual(tx: ?mixed): boolean;

  self(): BaseSignRequest<T>;
}
