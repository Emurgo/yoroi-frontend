// @flow

import type { TxMemoTableInsert } from '../../ada/lib/storage/database/memos/tables';
import type { TxMemoLookupKey } from '../../ada/lib/storage/bridge/memos';

// Upload
export type UploadExternalTxMemoRequest = {|
  memo: TxMemoTableInsert,
|};
export type UploadExternalTxMemoResponse = boolean;
export type UploadExternalTxMemoFunc = (
  request: UploadExternalTxMemoRequest
) => Promise<UploadExternalTxMemoResponse>;

// Delete
export type DeleteExternalTxMemoRequest = TxMemoLookupKey;
export type DeleteExternalTxMemoResponse = boolean;
export type DeleteExternalTxMemoFunc = (
  request: DeleteExternalTxMemoRequest
) => Promise<DeleteExternalTxMemoResponse>;

// Fetch Filenames
export type FetchFilenameExternalTxMemoRequest = {|
  walletId: string,
|};
export type FetchFilenameExternalTxMemoResponse = Array<{|
    tx: string,
    deleted: boolean,
    lastUpdated: Date
|}>;
export type FetchFilenameExternalTxMemoFunc = (
  request: FetchFilenameExternalTxMemoRequest
) => Promise<FetchFilenameExternalTxMemoResponse>;

// Fetch Folder (to check if exists)
export type FetchFolderExternalTxMemoRequest = {|
  walletId: void | string,
|};
export type FetchFolderExternalTxMemoResponse = boolean;
export type FetchFolderExternalTxMemoFunc = (
  request: FetchFolderExternalTxMemoRequest
) => Promise<FetchFolderExternalTxMemoResponse>;

// Create Folder
export type CreateFolderExternalTxMemoRequest = {|
  walletId: void | string,
|};
export type CreateFolderExternalTxMemoResponse = boolean;
export type CreateFolderExternalTxMemoFunc = (
  request: CreateFolderExternalTxMemoRequest
) => Promise<CreateFolderExternalTxMemoResponse>;

// Get Metadata
export type GetMetadataExternalTxMemoRequest = string;
export type GetMetadataExternalTxMemoResponse = {|
    tag: string,
    lastUpdated: Date
|};
export type GetMetadataExternalTxMemoFunc = (
  request: GetMetadataExternalTxMemoRequest
) => Promise<GetMetadataExternalTxMemoResponse>;

// Download
export type DownloadExternalTxMemoRequest = TxMemoLookupKey;
export type DownloadExternalTxMemoResponse = {|
  content: string,
  lastUpdated: Date
|};
export type DownloadExternalTxMemoFunc = (
  request: DownloadExternalTxMemoRequest
) => Promise<DownloadExternalTxMemoResponse>;

export interface IProvider {
  setup(body:void): void;

  revokeToken(body: void): Promise<void>;

  getDisplayName(body: void): string;

  /**
   * Fetch folder to check if exists
   */
  fetchFolder(body: FetchFolderExternalTxMemoRequest): Promise<FetchFolderExternalTxMemoResponse>;

  createFolder(body: CreateFolderExternalTxMemoRequest):
    Promise<CreateFolderExternalTxMemoResponse>;

  /**
   * Sync with external storage folder to catch up with changes (updated/deleted files)
   */
  fetchFilenames(body: FetchFilenameExternalTxMemoRequest):
    Promise<FetchFilenameExternalTxMemoResponse>;

  /**
   * Upload file without overwriting
   */
  uploadFile(body: UploadExternalTxMemoRequest): Promise<UploadExternalTxMemoResponse>;

  uploadAndOverwriteFile(body: UploadExternalTxMemoRequest): Promise<UploadExternalTxMemoResponse>;

  deleteFile(body: DeleteExternalTxMemoRequest): Promise<DeleteExternalTxMemoResponse>;

  downloadFile(body: DownloadExternalTxMemoRequest): Promise<DownloadExternalTxMemoResponse>;
}
