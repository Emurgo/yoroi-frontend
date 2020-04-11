// @flow
import { Action, AsyncAction } from './lib/Action';
import type { SelectedExternalStorageProvider } from '../domain/ExternalStorage';
import WalletTransaction from '../domain/WalletTransaction';
import type { TxMemoPreLookupKey, TxMemoTablePreInsert } from '../api/ada/lib/storage/bridge/memos';
import { PublicDeriver } from '../api/ada/lib/storage/models/PublicDeriver/index';

// ======= MEMOS ACTIONS =======

export default class MemosActions {
  updateExternalStorageProvider: AsyncAction<SelectedExternalStorageProvider> = new AsyncAction();
  unsetExternalStorageProvider: AsyncAction<void> = new AsyncAction();
  closeAddMemoDialog: Action<void> = new Action();
  closeEditMemoDialog: Action<void> = new Action();
  goBackDeleteMemoDialog: Action<void> = new Action();
  closeDeleteMemoDialog: Action<void> = new Action();
  closeConnectExternalStorageDialog: Action<void> = new Action();
  selectTransaction: Action<{| tx: WalletTransaction |}> = new Action();
  saveTxMemo: AsyncAction<TxMemoTablePreInsert> = new AsyncAction();
  updateTxMemo: AsyncAction<TxMemoTablePreInsert> = new AsyncAction();
  deleteTxMemo: AsyncAction<TxMemoPreLookupKey> = new AsyncAction();
  syncTxMemos: AsyncAction<PublicDeriver<>> = new AsyncAction();
  downloadTxMemo: AsyncAction<TxMemoPreLookupKey> = new AsyncAction();
}
