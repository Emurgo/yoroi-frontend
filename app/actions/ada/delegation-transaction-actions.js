// @flow
import { AsyncAction, Action } from '../lib/Action';
import PublicDeriverWithCachedMeta from '../../domain/PublicDeriverWithCachedMeta';
import type { PoolRequest } from '../../api/ada/lib/storage/bridge/delegationUtils';

export default class DelegationTransactionActions {
  createTransaction: AsyncAction<{|
    publicDeriver: PublicDeriverWithCachedMeta,
    poolRequest: PoolRequest,
  |}> = new AsyncAction();
  signTransaction: AsyncAction<{|
    password: string,
    publicDeriver: PublicDeriverWithCachedMeta,
  |}> = new AsyncAction();
  complete: Action<PublicDeriverWithCachedMeta> = new Action();
  reset: Action<void> = new Action();
}
