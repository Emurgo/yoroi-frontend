// @flow
import type { TransactionMemo } from '../ada/adaTypes';

// Upload
export type UploadExternalTxMemoRequest = {
  memo: TransactionMemo,
};
export type UploadExternalTxMemoResponse = boolean;
export type UploadExternalTxMemoFunc = (
  request: UploadExternalTxMemoRequest
) => Promise<UploadExternalTxMemoResponse>;

// Delete
export type DeleteExternalTxMemoRequest = string;
export type DeleteExternalTxMemoResponse = boolean;
export type DeleteExternalTxMemoFunc = (
  request: DeleteExternalTxMemoRequest
) => Promise<DeleteExternalTxMemoResponse>;

// Fetch Filenames
export type FetchFilenameExternalTxMemoRequest = void;
export type FetchFilenameExternalTxMemoResponse = Array<{
    tx: string,
    deleted: boolean,
    lastUpdated: Date
}>;
export type FetchFilenameExternalTxMemoFunc = (
  request: FetchFilenameExternalTxMemoRequest
) => Promise<FetchFilenameExternalTxMemoResponse>;

// Download
export type DownloadExternalTxMemoRequest = string;
export type DownloadExternalTxMemoResponse = {
    content: string,
    lastUpdated: Date
};
export type DownloadExternalTxMemoFunc = (
  request: DownloadExternalTxMemoRequest
) => Promise<DownloadExternalTxMemoResponse>;
