// @flow
import { AsyncAction, Action } from '../lib/Action';

export type PoolRequest =
  void |
  {| id: string |} |
  Array<{|
    id: string,
    part: number,
  |}>;

export default class DelegationTransactionActions {
  createTransaction: AsyncAction<PoolRequest> = new AsyncAction();
  signTransaction: AsyncAction<{| password: string |}> = new AsyncAction();
  complete: AsyncAction<void> = new AsyncAction();
  reset: Action<void> = new Action();
}
