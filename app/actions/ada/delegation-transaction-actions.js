// @flow
import { AsyncAction, Action } from '../lib/Action';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver/index';

export default class DelegationTransactionActions {
  setPools: Action<Array<string | void>> = new Action();
  createTransaction: AsyncAction<{|
    publicDeriver: PublicDeriver<>,
    poolRequest: string | void,
  |}> = new AsyncAction();
  signTransaction: AsyncAction<{|
    password: string,
    publicDeriver: PublicDeriver<>,
  |}> = new AsyncAction();
  complete: Action<void> = new Action();
  reset: Action<void> = new Action();
}
