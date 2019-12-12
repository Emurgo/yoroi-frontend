// @flow
import Action from '../lib/Action';

export type PoolRequest =
  void |
  {| id: string |} |
  Array<{|
    id: string,
    part: number,
  |}>;

export default class DelegationTransactionActions {
  createTransaction: Action<PoolRequest> = new Action();
  signTransaction: Action<{| password: string |}> = new Action();
  reset: Action<void> = new Action();
}
