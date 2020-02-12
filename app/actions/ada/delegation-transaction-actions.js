// @flow
import { AsyncAction, Action } from '../lib/Action';
import type { WalletWithCachedMeta } from '../../stores/toplevel/WalletStore';
import type { PoolRequest } from '../../api/ada/lib/storage/bridge/delegationUtils';

export default class DelegationTransactionActions {
  createTransaction: AsyncAction<{|
    publicDeriver: WalletWithCachedMeta,
    poolRequest: PoolRequest,
  |}> = new AsyncAction();
  signTransaction: AsyncAction<{|
    password: string,
    publicDeriver: WalletWithCachedMeta,
  |}> = new AsyncAction();
  complete: Action<WalletWithCachedMeta> = new Action();
  reset: Action<void> = new Action();
}
