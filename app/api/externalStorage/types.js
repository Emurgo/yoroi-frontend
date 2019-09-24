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

// Fetch Folder (to check if exists)
export type FetchFolderExternalTxMemoRequest = string;
export type FetchFolderExternalTxMemoResponse = boolean;
export type FetchFolderExternalTxMemoFunc = (
  request: FetchFolderExternalTxMemoRequest
) => Promise<FetchFolderExternalTxMemoResponse>;

// Create Folder
export type CreateFolderExternalTxMemoRequest = string;
export type CreateFolderExternalTxMemoResponse = boolean;
export type CreateFolderExternalTxMemoFunc = (
  request: CreateFolderExternalTxMemoRequest
) => Promise<CreateFolderExternalTxMemoResponse>;

// Get Metadata
export type GetMetadataExternalTxMemoRequest = string;
export type GetMetadataExternalTxMemoResponse = {
    tag: string,
    lastUpdated: Date
};
export type GetMetadataExternalTxMemoFunc = (
  request: GetMetadataExternalTxMemoRequest
) => Promise<GetMetadataExternalTxMemoResponse>;

// Download
export type DownloadExternalTxMemoRequest = string;
export type DownloadExternalTxMemoResponse = {
    content: string,
    lastUpdated: Date
};
export type DownloadExternalTxMemoFunc = (
  request: DownloadExternalTxMemoRequest
) => Promise<DownloadExternalTxMemoResponse>;
