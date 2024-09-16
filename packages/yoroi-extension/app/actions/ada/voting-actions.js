// @flow
import { AsyncAction, Action } from '../lib/Action';
import type { WalletState } from '../../../chrome/extension/background/types';

export default class VotingActions {
  generateCatalystKey: AsyncAction<void> = new AsyncAction();
  createTransaction: AsyncAction<null | string> = new AsyncAction();
  signTransaction: AsyncAction<{|
    password?: string,
    wallet: WalletState,
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
