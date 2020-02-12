// @flow
import { AsyncAction, Action } from '../lib/Action';
import type { WalletWithCachedMeta } from '../../stores/toplevel/WalletStore';

export default class DaedalusTransferActions {
  startTransferFunds: Action<void> = new Action();
  startTransferPaperFunds: Action<void> = new Action();
  startTransferMasterKey: Action<void> = new Action();
  setupTransferFundsWithMnemonic: AsyncAction<{|
    recoveryPhrase: string,
    publicDeriver: WalletWithCachedMeta,
  |}> = new AsyncAction();
  setupTransferFundsWithMasterKey: AsyncAction<{|
    masterKey: string,
    publicDeriver: WalletWithCachedMeta,
  |}> = new AsyncAction();
  backToUninitialized: Action<void> = new Action();
  transferFunds: AsyncAction<{|
    next: () => Promise<void>,
    publicDeriver: WalletWithCachedMeta,
  |}> = new AsyncAction();
  cancelTransferFunds: Action<void> = new Action();
}
