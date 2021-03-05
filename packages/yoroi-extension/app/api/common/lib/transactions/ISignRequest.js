// @flow

import {
  MultiToken,
} from '../MultiToken';

export interface ISignRequest<T> {
  totalInput(): MultiToken;
  totalOutput(): MultiToken;
  fee(): MultiToken;
  uniqueSenderAddresses(): Array<string>;
  receivers(includeChange: boolean): Array<string>;
  isEqual(tx: ?mixed): boolean;
  self(): T;
}
