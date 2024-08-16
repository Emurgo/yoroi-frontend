// @flow
import { Action, AsyncAction } from './lib/Action';
import type { SelectedExternalStorageProvider } from '../domain/ExternalStorage';
import WalletTransaction from '../domain/WalletTransaction';
import type { TxMemoTableUpsert, TxMemoPreLookupKey, TxMemoTablePreInsert } from '../api/ada/lib/storage/bridge/memos';
import type { WalletState } from '../../chrome/extension/background/types';

// ======= MEMOS ACTIONS =======

export default class MemosActions {
  updateExternalStorageProvider: AsyncAction<SelectedExternalStorageProvider> = new AsyncAction();
  unsetExternalStorageProvider: AsyncAction<void> = new AsyncAction();
  closeMemoDialog: Action<void> = new Action();
  selectTransaction: Action<{| tx: WalletTransaction |}> = new Action();
  saveTxMemo: AsyncAction<TxMemoTablePreInsert> = new AsyncAction();
  updateTxMemo: AsyncAction<TxMemoTableUpsert> = new AsyncAction();
  deleteTxMemo: AsyncAction<TxMemoPreLookupKey> = new AsyncAction();
  syncTxMemos: AsyncAction<WalletState> = new AsyncAction();
  downloadTxMemo: AsyncAction<TxMemoPreLookupKey> = new AsyncAction();
}
