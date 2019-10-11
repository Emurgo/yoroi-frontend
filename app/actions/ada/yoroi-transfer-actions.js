// @flow
import Action from '../lib/Action';
import PublicDeriverWithCachedMeta from '../../domain/PublicDeriverWithCachedMeta';

export default class YoroiTranferActions {
  startTransferFunds: Action<void> = new Action();
  setupTransferFundsWithMnemonic: Action<{
    recoveryPhrase: string,
    publicDeriver: PublicDeriverWithCachedMeta,
  }> = new Action();
  backToUninitialized: Action<void> = new Action();
  transferFunds: Action<{
    next: Function,
    publicDeriver: PublicDeriverWithCachedMeta,
  }> = new Action();
  cancelTransferFunds: Action<void> = new Action();
}
