// @flow
import { AsyncAction, Action } from '../lib/Action';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver/index';

export default class VotingActions {
  generateCatalystKey: AsyncAction<void> = new AsyncAction();
  createTransaction: AsyncAction<null | string> = new AsyncAction();
  signTransaction: AsyncAction<{|
    password?: string,
    publicDeriver: PublicDeriver<>,
  |}> = new AsyncAction();
  cancel: Action<void> = new Action();
  submitGenerate: Action<void> = new Action();
  goBackToGenerate: Action<void> = new Action();
  submitConfirm: AsyncAction<void> = new AsyncAction();
  submitConfirmError: Action<void> = new Action();
  submitRegister: Action<void> = new Action();
  submitRegisterError: Action<Error> = new Action();
  goBackToRegister: Action<void> = new Action();
  finishQRCode: Action<void> = new Action();
  submitTransaction: Action<void> = new Action();
  submitTransactionError: Action<Error> = new Action();
}
