// @flow
import { AsyncAction, Action } from '../lib/Action';
import type { PoolRequest } from '../../api/ada/lib/storage/bridge/delegationUtils';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver/index';

export type SelectedPool = {|
  +name: null | string,
  +poolHash: string
|};

export default class DelegationTransactionActions {
  setPools: Action<Array<SelectedPool>> = new Action();
  createTransaction: AsyncAction<{|
    publicDeriver: PublicDeriver<>,
    poolRequest: PoolRequest,
  |}> = new AsyncAction();
  signTransaction: AsyncAction<{|
    password: string,
    publicDeriver: PublicDeriver<>,
  |}> = new AsyncAction();
  complete: Action<void> = new Action();
  reset: Action<void> = new Action();
}
