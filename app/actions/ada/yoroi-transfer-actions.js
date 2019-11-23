// @flow
import Action from '../lib/Action';
import PublicDeriverWithCachedMeta from '../../domain/PublicDeriverWithCachedMeta';
import type { TransferType } from '../../types/TransferTypes';

export default class YoroiTranferActions {
  startTransferFunds: Action<void> = new Action();
  startTransferPaperFunds: Action<void> = new Action();
  setupTransferFundsWithMnemonic: Action<{
    recoveryPhrase: string,
    publicDeriver: PublicDeriverWithCachedMeta,
  }> = new Action();
  setupTransferFundsWithPaperMnemonic: Action<{
    recoveryPhrase: string,
    paperPassword: string,
    publicDeriver: PublicDeriverWithCachedMeta,
  }> = new Action();
  checkAddresses: Action<{|
    publicDeriver: PublicDeriverWithCachedMeta,
    transferKind: TransferType,
  |}> = new Action();
  backToUninitialized: Action<void> = new Action();
  transferFunds: Action<{
    next: Function,
    publicDeriver: PublicDeriverWithCachedMeta,
    transferKind: TransferType,
  }> = new Action();
  cancelTransferFunds: Action<void> = new Action();
}
