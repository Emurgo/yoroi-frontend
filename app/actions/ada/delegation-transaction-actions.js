// @flow
import { AsyncAction, Action } from '../lib/Action';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver/index';

export default class DelegationTransactionActions {
  setPools: AsyncAction<Array<string>> = new AsyncAction();
  createTransaction: AsyncAction<{|
    publicDeriver: PublicDeriver<>,
    poolRequest: string | void,
  |}> = new AsyncAction();
  signTransaction: AsyncAction<{|
    password?: string,
    publicDeriver: PublicDeriver<>,
  |}> = new AsyncAction();
  complete: Action<void> = new Action();
  reset: Action<{| justTransaction: boolean |}> = new Action();
}
