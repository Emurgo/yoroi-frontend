// @flow
import Action from './lib/Action';
import type { SelectedExternalStorageProvider } from '../domain/ExternalStorage';
import WalletTransaction from '../domain/WalletTransaction';
import type { TransactionMemo } from '../api/ada/adaTypes';

// ======= MEMOS ACTIONS =======

export default class MemosActions {
  updateExternalStorageProvider: Action<SelectedExternalStorageProvider> = new Action();
  updateAccountNumberPlate: Action<string> = new Action();
  unsetExternalStorageProvider: Action<void> = new Action();
  closeAddMemoDialog: Action<void> = new Action();
  closeEditMemoDialog: Action<void> = new Action();
  goBackDeleteMemoDialog: Action<void> = new Action();
  closeDeleteMemoDialog: Action<void> = new Action();
  closeConnectExternalStorageDialog: Action<void> = new Action();
  selectTransaction: Action<{ tx: WalletTransaction }> = new Action();
  saveTxMemo: Action<TransactionMemo> = new Action();
  updateTxMemo: Action<TransactionMemo> = new Action();
  deleteTxMemo: Action<string> = new Action();
  syncTxMemos: Action<void> = new Action();
  downloadTxMemo: Action<string> = new Action();
}
