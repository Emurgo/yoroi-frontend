// @flow
import Action from '../lib/Action';
import PublicDeriverWithCachedMeta from '../../domain/PublicDeriverWithCachedMeta';

export default class DaedalusTranferActions {
  startTransferFunds: Action<void> = new Action();
  startTransferPaperFunds: Action<void> = new Action();
  startTransferMasterKey: Action<void> = new Action();
  setupTransferFundsWithMnemonic: Action<{
    recoveryPhrase: string,
  }> = new Action();
  setupTransferFundsWithMasterKey: Action<{
    masterKey: string,
  }> = new Action();
  backToUninitialized: Action<void> = new Action();
  transferFunds: Action<{
    next: Function,
    publicDeriver: PublicDeriverWithCachedMeta,
  }> = new Action();
  cancelTransferFunds: Action<void> = new Action();
}
