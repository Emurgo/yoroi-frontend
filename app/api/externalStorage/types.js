// @flow
import type { TransactionMemo } from '../ada/adaTypes';

// UploadExternal
export type UploadExternalTxMemoRequest = {
  memos: Array<TransactionMemo>,
};
export type UploadExternalTxMemoResponse = boolean;
export type UploadExternalTxMemoFunc = (
  request: UploadExternalTxMemoRequest
) => Promise<UploadExternalTxMemoResponse>;

// DeleteExternal
export type DeleteExternalTxMemoRequest = {
  memos: Array<string>,
};
export type DeleteExternalTxMemoResponse = boolean;
export type DeleteExternalTxMemoFunc = (
  request: DeleteExternalTxMemoRequest
) => Promise<DeleteExternalTxMemoResponse>;

// DownloadExternal
export type DownloadExternalTxMemoRequest = {
  memos: Array<string>,
};
export type DownloadExternalTxMemoResponse = boolean;
export type DownloadExternalTxMemoFunc = (
  request: DownloadExternalTxMemoRequest
) => Promise<DownloadExternalTxMemoResponse>;

// SearchExternal
/*
export type DownloadExternalTxMemoRequest = {
  memos: Array<string>,
};
export type DownloadExternalTxMemoResponse = boolean;
export type DownloadExternalTxMemoFunc = (
  request: DownloadExternalTxMemoRequest
) => Promise<DownloadExternalTxMemoResponse>;
*/
