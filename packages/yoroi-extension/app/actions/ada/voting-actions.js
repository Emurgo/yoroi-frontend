// @flow
import { AsyncAction, Action } from '../lib/Action';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver/index';

export default class VotingActions {
  signTransaction: AsyncAction<{|
    password?: string,
    publicDeriver: PublicDeriver<>,
  |}> = new AsyncAction();
  cancel: Action<void> = new Action();
  finishDone: Action<void> = new Action();
  submitTransaction: Action<void> = new Action();
  submitTransactionError: Action<Error> = new Action();
  generatePlaceholderTransaction: AsyncAction<void> = new AsyncAction();
}
