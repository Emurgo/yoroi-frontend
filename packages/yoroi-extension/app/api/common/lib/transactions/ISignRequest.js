// @flow

import { MultiToken } from '../MultiToken';
import type { TxDataOutput, TxDataInput } from '../../types';

export interface ISignRequest<T> {
  inputs(): Array<TxDataInput>;
  totalInput(): MultiToken;
  outputs(): Array<TxDataOutput>;
  totalOutput(): MultiToken;
  fee(): MultiToken;
  uniqueSenderAddresses(): Array<string>;
  receivers(includeChange: boolean): Array<string>;
  isEqual(tx: ?mixed): boolean;
  self(): T;
  +size?: () => {| full: number, outputs: number[] |};
}
