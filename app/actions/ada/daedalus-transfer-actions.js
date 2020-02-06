// @flow
import { AsyncAction, Action } from '../lib/Action';
import PublicDeriverWithCachedMeta from '../../domain/PublicDeriverWithCachedMeta';

export default class DaedalusTransferActions {
  startTransferFunds: Action<void> = new Action();
  startTransferPaperFunds: Action<void> = new Action();
  startTransferMasterKey: Action<void> = new Action();
  setupTransferFundsWithMnemonic: AsyncAction<{|
    recoveryPhrase: string,
    publicDeriver: PublicDeriverWithCachedMeta,
  |}> = new AsyncAction();
  setupTransferFundsWithMasterKey: AsyncAction<{|
    masterKey: string,
    publicDeriver: PublicDeriverWithCachedMeta,
  |}> = new AsyncAction();
  backToUninitialized: Action<void> = new Action();
  transferFunds: AsyncAction<{|
    next: () => Promise<void>,
    publicDeriver: PublicDeriverWithCachedMeta,
  |}> = new AsyncAction();
  cancelTransferFunds: Action<void> = new Action();
}
