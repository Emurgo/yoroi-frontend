// @flow
import BigNumber from 'bignumber.js';
import {
  MultiToken,
} from '../api/common/lib/MultiToken';

export type UnconfirmedAmount = {|
  total: MultiToken,
  incoming: MultiToken,
  outgoing: MultiToken,
  incomingInSelectedCurrency: ?BigNumber,
  outgoingInSelectedCurrency: ?BigNumber,
|};
