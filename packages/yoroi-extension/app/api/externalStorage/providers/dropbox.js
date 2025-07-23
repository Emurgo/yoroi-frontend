// @flow
import { observable, runInAction } from 'mobx';
import { Dropbox } from 'dropbox';
import moment from 'moment';
import {
  DROPBOX_CLIENT_ID,
  MAX_MEMO_SIZE
} from '../../../config/externalStorageConfig';
import {
  Logger,
  stringifyError
} from '../../../utils/logging';
import { ROUTES } from '../../../routes-config';
import environment from '../../../environment';
import type {
  IProvider,
  UploadExternalTxMemoRequest, DeleteExternalTxMemoRequest,
  DownloadExternalTxMemoRequest, GetMetadataExternalTxMemoRequest,
  FetchFolderExternalTxMemoRequest, CreateFolderExternalTxMemoRequest,
  UploadExternalTxMemoResponse, DeleteExternalTxMemoResponse,
  DownloadExternalTxMemoResponse,
  FetchFilenameExternalTxMemoRequest, FetchFilenameExternalTxMemoResponse,
  GetMetadataExternalTxMemoResponse, FetchFolderExternalTxMemoResponse,
  CreateFolderExternalTxMemoResponse
} from './IProvider.types';

export default class DropboxApi implements IProvider {
  authorizeUrl: string = `https://www.dropbox.com/oauth2/authorize?client_id=${DROPBOX_CLIENT_ID}&response_type=token&redirect_uri=${ROUTES.ROOT}#/`;
  baseFolderPath: string = `/cardano/${environment.getNetworkName()}/transaction-memos`;
  memoExt: string = '.txt';
  @observable errorMessage: string = '';
  @observable errorCode: string = '';
  api: Dropbox;

  constructor() {
    this.setup = this.setup.bind(this);
    this.auth = this.auth.bind(this);
    this.getDisplayName = this.getDisplayName.bind(this);
    this.revokeToken = this.revokeToken.bind(this);
    this.getError = this.getError.bind(this);
    this.getMetadata = this.getMetadata.bind(this);
    this.fetchFolder = this.fetchFolder.bind(this);
    this.createFolder = this.createFolder.bind(this);
    this.fetchFilenames = this.fetchFilenames.bind(this);
    this.uploadFile = this.uploadFile.bind(this);
    this.uploadAndOverwriteFile = this.uploadAndOverwriteFile.bind(this);
    this.deleteFile = this.deleteFile.bind(this);
    this.downloadFile = this.downloadFile.bind(this);
  }

  /*:: auth: string => void; */
  auth(token: string): void {
    this.api = new Dropbox({
      clientId: DROPBOX_CLIENT_ID,
      accessToken: token,
      fetch,
    });
  }

  /*:: setup: void => void; */
  setup(): void {
  }

  /*:: getDisplayName: void => string; */
  getDisplayName(): string {
    return 'Dropbox';
  }

  /*:: revokeToken: void => Promise<void>; */
  async revokeToken(): Promise<void> {
    return this.api.authTokenRevoke()
      .then((result) => {
        Logger.debug('DropboxApi::revokeToken success');
        return result;
      })
      .catch((e) => {
        runInAction(() => {
          self.errorCode = e.status;
          self.errorMessage = 'An error ocurred while revoking the token';
        });
        Logger.error('DropboxApi::revokeToken error: ' + stringifyError(e.error));
        throw e;
      });
  }

  /*:: getError: void => string; */
  getError(): string {
    return `[${this.errorCode}] ${this.errorMessage}`;
  }

  // TODO: do we need this function?
  /*:: getMetadata:
    GetMetadataExternalTxMemoRequest => Promise<GetMetadataExternalTxMemoResponse>; */
  async getMetadata(
    path: GetMetadataExternalTxMemoRequest
  ): Promise<GetMetadataExternalTxMemoResponse> {
    const self = this;
    return await this.api.filesGetMetadata({
      path,
    })
      .then((response) => {
        if (
          !Object.prototype.hasOwnProperty.call(response, '.tag')
          || !Object.prototype.hasOwnProperty.call(response, 'name')
        ) {
          throw new Error('Should never happen');
        }
        return {
          tag: response['.tag'],
          lastUpdated: Object.prototype.hasOwnProperty.call(response, 'server_modified')
            // $FlowFixMe[incompatible-use]
            && response.server_modified != null
            ? moment(response.server_modified, 'YYYY-MM-DDTHH:mm:ssZ').toDate()
            : new Date(0)
        };
      })
      .catch((e) => {
        runInAction(() => {
          self.errorCode = e.status;
          self.errorMessage = 'An error ocurred while fetching metadata';
        });
        Logger.error('DropboxApi::getMetadata error: ' + stringifyError(e.error));
        throw e;
      });
  }

  /*:: fetchFolder:
    FetchFolderExternalTxMemoRequest => Promise<FetchFolderExternalTxMemoResponse>; */
  async fetchFolder(
    request: FetchFolderExternalTxMemoRequest
  ): Promise<FetchFolderExternalTxMemoResponse> {
    const { walletId } = request;
    const fullPath = walletId != null
      ? this.baseFolderPath.concat('/').concat(walletId)
      : this.baseFolderPath;
    return await this.getMetadata(fullPath)
      .then(response => {
        return response.tag === 'folder';
      })
      .catch((e) => {
        runInAction(() => {
          self.errorCode = e.status;
          self.errorMessage = 'An error ocurred while fetching folder';
        });
        Logger.error('DropboxApi::fetchFolder error: ' + stringifyError(e.error));
        throw e;
      });
  }

  /*:: createFolder:
    CreateFolderExternalTxMemoRequest => Promise<CreateFolderExternalTxMemoResponse>; */
  async createFolder(
    request: CreateFolderExternalTxMemoRequest
  ): Promise<CreateFolderExternalTxMemoResponse> {
    const { walletId } = request;
    const fullPath = walletId != null
      ? this.baseFolderPath.concat('/').concat(walletId)
      : this.baseFolderPath;
    return this.api.filesCreateFolderV2({
      path: fullPath,
    })
      .then(() => {
        Logger.debug('DropboxApi::createFolder success: ' + fullPath + ' created');
        return true;
      })
      .catch((e) => {
        runInAction(() => {
          self.errorCode = e.status;
          self.errorMessage = 'An error ocurred while creating the folder';
        });
        Logger.error('DropboxApi::createFolder error: ' + stringifyError(e.error));
        throw e;
      });
  }

  /*:: fetchFilenames:
    FetchFilenameExternalTxMemoRequest => Promise<FetchFilenameExternalTxMemoResponse>; */
  async fetchFilenames(
    request: FetchFilenameExternalTxMemoRequest
  ): Promise<FetchFilenameExternalTxMemoResponse> {
    const self = this;

    // TODO: call list_folder/continue with the returned ListFolderResult.cursor
    // to retrieve more entries
    return await this.api.filesListFolder({
      path: `${this.baseFolderPath}/${request.walletId}`,
      include_deleted: true,
    })
      .then((response) => {
        return response.entries
          .filter(entry => (
            Object.prototype.hasOwnProperty.call(entry, '.tag')
            && Object.prototype.hasOwnProperty.call(entry, 'name')
          ))
          .map(entry => {
            return {
              tx: entry.name.substr(0, entry.name.length - this.memoExt.length),
              deleted: entry['.tag'] === 'deleted',
              lastUpdated: Object.prototype.hasOwnProperty.call(entry, 'server_modified')
                // $FlowFixMe[incompatible-use]
                && entry.server_modified != null
                ? moment(entry.server_modified, 'YYYY-MM-DDTHH:mm:ssZ').toDate()
                : new Date(0),
            };
          });
      })
      .catch((e) => {
        runInAction(() => {
          self.errorCode = e.status;
          self.errorMessage = 'An error ocurred while fetching filenames';
        });
        Logger.error('DropboxApi::fetchFilenames error: ' + stringifyError(e.error));
        throw e;
      });
  }

  /*:: uploadFile:
    UploadExternalTxMemoRequest => Promise<UploadExternalTxMemoResponse>; */
  async uploadFile(
    request: UploadExternalTxMemoRequest
  ): Promise<UploadExternalTxMemoResponse> {
    const self = this;
    const txHash = request.memo.TransactionHash;
    const fullPath = `${this.baseFolderPath}/${request.memo.WalletId}/${request.memo.TransactionHash}${this.memoExt}`;
    return this.api.filesUpload({
      path: fullPath,
      contents: request.memo.Content,
    })
      .then(() => {
        Logger.debug('DropboxApi::uploadFile success: ' + txHash + ' file uploaded');
        return true;
      })
      .catch((e) => {
        // Memo already exists for this tx, don't overwrite.
        // Wallet auto-sync should update with the correct version
        if (e.status === 409) {
          return false;
        }
        runInAction(() => {
          self.errorCode = e.status;
          self.errorMessage = 'An error ocurred while uploading the file';
        });
        Logger.error('DropboxApi::uploadFile error: ' + stringifyError(e.error));
        throw e;
      });
  }

  /*:: uploadAndOverwriteFile:
    UploadExternalTxMemoRequest => Promise<UploadExternalTxMemoResponse>; */
  async uploadAndOverwriteFile(
    request: UploadExternalTxMemoRequest
  ): Promise<UploadExternalTxMemoResponse> {
    const self = this;
    const txHash = request.memo.TransactionHash;
    const fullPath = `${this.baseFolderPath}/${request.memo.WalletId}/${request.memo.TransactionHash}${this.memoExt}`;
    return this.api.filesUpload({
      path: fullPath,
      contents: request.memo.Content,
      mode: ('overwrite': any) // type definition is wrong
    })
      .then(() => {
        Logger.debug('DropboxApi::uploadAndOverwriteFile success: ' + txHash + ' file uploaded');
        return true;
      })
      .catch((e) => {
        runInAction(() => {
          self.errorCode = e.status;
          self.errorMessage = 'An error ocurred while uploading the file';
        });
        Logger.error('DropboxApi::uploadAndOverwrite error: ' + stringifyError(e.error));
        throw e;
      });
  }

  /*:: deleteFile: DeleteExternalTxMemoRequest => Promise<DeleteExternalTxMemoResponse>; */
  async deleteFile(
    request: DeleteExternalTxMemoRequest
  ): Promise<DeleteExternalTxMemoResponse> {
    const fullPath = `${this.baseFolderPath}/${request.walletId}/${request.txHash}${this.memoExt}`;
    // TODO: deprecated
    return this.api.filesDelete({
      path: fullPath
    })
      .then(() => {
        Logger.debug('DropboxApi::deleteFile success: ' + request.txHash + ' file deleted');
        return true;
      })
      .catch((e) => {
        runInAction(() => {
          self.errorCode = e.status;
          self.errorMessage = 'An error ocurred while deleting the file';
        });
        Logger.error('DropboxApi::deleteFile error: ' + stringifyError(e.error));
        throw e;
      });
  }

  /*:: downloadFile: DownloadExternalTxMemoRequest => Promise<DownloadExternalTxMemoResponse>; */
  async downloadFile(
    request: DownloadExternalTxMemoRequest
  ): Promise<DownloadExternalTxMemoResponse> {
    const self = this;
    const fullPath = `${this.baseFolderPath}/${request.walletId}/${request.txHash}${this.memoExt}`;
    return this.api.filesDownload({
      path: fullPath
    })
      .then((response) => {
        Logger.debug('DropboxApi::downloadFile success: ' + request.txHash + ' file downloaded');
        if (!response.fileBlob) {
          throw new Error('No fileBlob');
        }
        return response.fileBlob.text()
          .then(content => {
            return {
              content: content.substr(0, MAX_MEMO_SIZE),
              lastUpdated: moment(response.server_modified, 'YYYY-MM-DDTHH:mm:ssZ').toDate()
            };
          })
          .catch((error) => {
            Logger.error('DropboxApi::downloadFile error while parsing the file: ' + stringifyError(error));
            throw new Error('Unknown dropbox content error');
          });
      })
      .catch((e) => {
        runInAction(() => {
          self.errorCode = e.status || '';
          self.errorMessage = 'An error ocurred while downloading the file';
        });
        Logger.error('DropboxApi::downloadFile error: ' + stringifyError(e.error));
        throw e;
      });
  }
}
