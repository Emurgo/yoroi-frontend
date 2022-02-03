// @flow
import {
  MultiToken,
} from '../api/common/lib/MultiToken';

type TimestampedAmount = {|
  timestamp: number,
  amount: MultiToken,
|};

export type UnconfirmedAmount = {|
  incoming: Array<TimestampedAmount>,
  outgoing: Array<TimestampedAmount>,
|};
