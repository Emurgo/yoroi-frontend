// @flow

import BigNumber from 'bignumber.js';
import { RustModule } from '../../../ada/lib/cardanoCrypto/rustLoader';

export interface ISignRequest<T> {
  totalInput(shift: boolean): BigNumber;
  totalOutput(shift: boolean): BigNumber;
  fee(shift: boolean): BigNumber;
  uniqueSenderAddresses(): Array<string>;
  receivers(includeChange: boolean): Array<string>;
  isEqual(tx: ?mixed): boolean;
  self(): T;
}
