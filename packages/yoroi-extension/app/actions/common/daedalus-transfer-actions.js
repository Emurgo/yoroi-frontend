// @flow
import { AsyncAction, Action } from '../lib/Action';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver/index';

export default class DaedalusTransferActions {
  startTransferFunds: Action<void> = new Action();
  startTransferPaperFunds: Action<void> = new Action();
  startTransferMasterKey: Action<void> = new Action();
  setupTransferFundsWithMnemonic: AsyncAction<{|
    recoveryPhrase: string,
    publicDeriver: PublicDeriver<>,
  |}> = new AsyncAction();
  setupTransferFundsWithMasterKey: AsyncAction<{|
    masterKey: string,
    publicDeriver: PublicDeriver<>,
  |}> = new AsyncAction();
  backToUninitialized: Action<void> = new Action();
  transferFunds: AsyncAction<{|
    next: () => Promise<void>,
    publicDeriver: PublicDeriver<>,
  |}> = new AsyncAction();
  cancelTransferFunds: Action<void> = new Action();
}
