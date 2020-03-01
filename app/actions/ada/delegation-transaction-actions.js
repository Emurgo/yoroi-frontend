// @flow
import { AsyncAction, Action } from '../lib/Action';
import type { PoolRequest } from '../../api/ada/lib/storage/bridge/delegationUtils';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver/index';

export default class DelegationTransactionActions {
  createTransaction: AsyncAction<{|
    publicDeriver: PublicDeriver<>,
    poolRequest: PoolRequest,
  |}> = new AsyncAction();
  signTransaction: AsyncAction<{|
    password: string,
    publicDeriver: PublicDeriver<>,
  |}> = new AsyncAction();
  complete: Action<PublicDeriver<>> = new Action();
  reset: Action<void> = new Action();
}
