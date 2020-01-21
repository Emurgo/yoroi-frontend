// @flow
import { AsyncAction, Action } from '../lib/Action';
import PublicDeriverWithCachedMeta from '../../domain/PublicDeriverWithCachedMeta';
import type { PoolRequest } from '../../api/ada/lib/storage/bridge/delegationUtils';

export default class DelegationTransactionActions {
  createTransaction: AsyncAction<{|
    publicDeriver: PublicDeriverWithCachedMeta,
    poolRequest: PoolRequest,
  |}> = new AsyncAction();
  signTransaction: AsyncAction<{| password: string |}> = new AsyncAction();
  complete: AsyncAction<void> = new AsyncAction();
  reset: Action<void> = new Action();
}
