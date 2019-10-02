// @flow
import { observable } from 'mobx';
import { sprintf } from 'sprintf-js';
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
import environment from '../../../environment';
import type {
  UploadExternalTxMemoRequest, DeleteExternalTxMemoRequest,
  DownloadExternalTxMemoRequest, GetMetadataExternalTxMemoRequest,
  FetchFolderExternalTxMemoRequest, CreateFolderExternalTxMemoRequest,
  UploadExternalTxMemoResponse, DeleteExternalTxMemoResponse,
  DownloadExternalTxMemoResponse, FetchFilenameExternalTxMemoResponse,
  GetMetadataExternalTxMemoResponse, FetchFolderExternalTxMemoResponse,
  CreateFolderExternalTxMemoResponse
} from '../types';
import {
  ExternalStorageList,
  ExternalStorageProviders
} from '../../../domain/ExternalStorage';


export default class DropboxApi {
  // eslint-disable-next-line max-len
  @observable authorizeUrl: string = ExternalStorageProviders[ExternalStorageList.DROPBOX].authorize_url;
  @observable folderPath: string = '/cardano/%s/transaction-memos';
  name: string = ExternalStorageProviders[ExternalStorageList.DROPBOX].name;
  memoExt: string = '.txt';
  errorMessage: string = '';
  errorCode: string = '';
  api: Dropbox;
  /* setup: Function;
  auth: Function;
  uploadFile: Function;
  uploadAndOverwriteFile: Function;
  deleteFile: Function; */

  constructor() {
    // $FlowFixMe
    this.setup = this.setup.bind(this);
    // $FlowFixMe
    this.auth = this.auth.bind(this);
    // $FlowFixMe
    this.setWallet = this.setWallet.bind(this);
    // $FlowFixMe
    this.getMetadata = this.getMetadata.bind(this);
    // $FlowFixMe
    this.fetchFolder = this.fetchFolder.bind(this);
    // $FlowFixMe
    this.createFolder = this.createFolder.bind(this);
    // $FlowFixMe
    this.fetchFilenames = this.fetchFilenames.bind(this);
    // $FlowFixMe
    this.uploadFile = this.uploadFile.bind(this);
    // $FlowFixMe
    this.uploadAndOverwriteFile = this.uploadAndOverwriteFile.bind(this);
    // $FlowFixMe
    this.deleteFile = this.deleteFile.bind(this);
    // $FlowFixMe
    this.downloadFile = this.downloadFile.bind(this);
  }

  setup() {
    this.authorizeUrl = sprintf(this.authorizeUrl, environment.baseUrl);
    this.folderPath = sprintf(this.folderPath, environment.NETWORK);
  }

  auth(token: string) {
    this.api = new Dropbox({
      clientId: DROPBOX_CLIENT_ID,
      accessToken: token,
      fetch,
    });
  }

  // Update folder path with wallet account plate id
  setWallet(numberPlateId: string) {
    if (numberPlateId !== '' && numberPlateId !== undefined) {
      this.folderPath = this.folderPath.concat('/').concat(numberPlateId);
    }
  }

  async revokeToken(): Promise<void> {
    return this.api.authTokenRevoke()
      .then(() => {
        Logger.debug('DropboxApi::revokeToken success');
        return true;
      })
      .catch((e) => {
        self.errorCode = e.status;
        self.errorMessage = 'An error ocurred while revoking the token';
        Logger.error('DropboxApi::revokeToken error: ' + stringifyError(e.error));
        return false;
      });
  }

  getError() {
    return sprintf('[%s] %s', this.errorCode, this.errorMessage);
  }

  async getMetadata(
    path: GetMetadataExternalTxMemoRequest
  ): Promise<GetMetadataExternalTxMemoResponse> {
    const self = this;
    const defaultResponse = { tag: '', lastUpdated: '' };
    return await this.api.filesGetMetadata({
      path,
    })
      .then((response) => {
        if (
          Object.prototype.hasOwnProperty.call(response, '.tag')
          && Object.prototype.hasOwnProperty.call(response, 'name')
        ) {
          return {
            tag: response['.tag'],
            lastUpdated: Object.prototype.hasOwnProperty.call(response, 'server_modified')
              ? moment(response.server_modified, 'YYYY-MM-DDTHH:mm:ssZ').toDate() : ''
          };
        }
        return defaultResponse;
      })
      .catch((e) => {
        self.errorCode = e.status;
        self.errorMessage = 'An error ocurred while fetching metadata';
        Logger.error('DropboxApi::getMetadata error: ' + stringifyError(e.error));
        return defaultResponse;
      });
  }

  async fetchFolder(
    folder: FetchFolderExternalTxMemoRequest
  ): Promise<FetchFolderExternalTxMemoResponse> {
    const fullPath = (folder !== '' && folder !== undefined)
      ? this.folderPath.concat('/').concat(folder) : this.folderPath;
    return await this.getMetadata(fullPath)
      .then(response => {
        return response.tag === 'folder';
      })
      .catch((e) => {
        self.errorCode = e.status;
        self.errorMessage = 'An error ocurred while fetching folder';
        Logger.error('DropboxApi::fetchFolder error: ' + stringifyError(e.error));
        return false;
      });
  }

  async createFolder(
    folder: CreateFolderExternalTxMemoRequest
  ): Promise<CreateFolderExternalTxMemoResponse> {
    const fullPath = (folder !== '' && folder !== undefined)
      ? this.folderPath.concat('/').concat(folder) : this.folderPath;
    return this.api.filesCreateFolderV2({
      path: fullPath,
    })
      .then(() => {
        Logger.debug('DropboxApi::createFolder success: ' + fullPath + ' created');
        return true;
      })
      .catch((e) => {
        self.errorCode = e.status;
        self.errorMessage = 'An error ocurred while creating the folder';
        Logger.error('DropboxApi::createFolder error: ' + stringifyError(e.error));
        return false;
      });
  }

  async fetchFilenames(): Promise<FetchFilenameExternalTxMemoResponse> {
    const self = this;
    return await this.api.filesListFolder({
      path: this.folderPath,
      include_deleted: true,
    })
      .then((response) => {
        return response.entries.map(entry => {
          if (
            Object.prototype.hasOwnProperty.call(entry, '.tag')
            && Object.prototype.hasOwnProperty.call(entry, 'name')
          ) {
            return {
              tx: entry.name.substr(0, entry.name.length - this.memoExt.length),
              deleted: entry['.tag'] === 'deleted',
              lastUpdated: Object.prototype.hasOwnProperty.call(entry, 'server_modified')
                ? moment(entry.server_modified, 'YYYY-MM-DDTHH:mm:ssZ').toDate() : ''
            };
          }
          return '';
        });
      })
      .catch((e) => {
        self.errorCode = e.status;
        self.errorMessage = 'An error ocurred while fetching filenames';
        Logger.error('DropboxApi::fetchFilenames error: ' + stringifyError(e.error));
      });
  }

  async uploadFile(
    request: UploadExternalTxMemoRequest
  ): Promise<UploadExternalTxMemoResponse> {
    const self = this;
    const txHash = request.memo.tx;
    const fullPath = this.folderPath.concat('/').concat(txHash).concat(this.memoExt);
    return this.api.filesUpload({
      path: fullPath,
      contents: request.memo.memo,
    })
      .then(() => {
        Logger.debug('DropboxApi::uploadFile success: ' + txHash + ' file uploaded');
        return true;
      })
      .catch((e) => {
        // Memo already exists for this trx, don't overwrite.
        // Wallet auto-sync should update with the correct version
        if (e.status === 409) {
          return false;
        }
        self.errorCode = e.status;
        self.errorMessage = 'An error ocurred while uploading the file';
        Logger.error('DropboxApi::uploadFile error: ' + stringifyError(e.error));
        return false;
      });
  }

  async uploadAndOverwriteFile(
    request: UploadExternalTxMemoRequest
  ): Promise<UploadExternalTxMemoResponse> {
    const self = this;
    const txHash = request.memo.tx;
    const fullPath = this.folderPath.concat('/').concat(txHash).concat(this.memoExt);
    return this.api.filesUpload({
      path: fullPath,
      contents: request.memo.memo,
      mode: 'overwrite'
    })
      .then(() => {
        Logger.debug('DropboxApi::uploadAndOverwriteFile success: ' + txHash + ' file uploaded');
        return true;
      })
      .catch((e) => {
        self.errorCode = e.status;
        self.errorMessage = 'An error ocurred while uploading the file';
        Logger.error('DropboxApi::uploadAndOverwrite error: ' + stringifyError(e.error));
        return false;
      });
  }

  async deleteFile(
    txHash: DeleteExternalTxMemoRequest
  ): Promise<DeleteExternalTxMemoResponse> {
    const fullPath = this.folderPath.concat('/').concat(txHash).concat(this.memoExt);
    return this.api.filesDelete({
      path: fullPath
    })
      .then(() => {
        Logger.debug('DropboxApi::deleteFile success: ' + txHash + ' file deleted');
        return true;
      })
      .catch((e) => {
        self.errorCode = e.status;
        self.errorMessage = 'An error ocurred while deleting the file';
        Logger.error('DropboxApi::deleteFile error: ' + stringifyError(e.error));
        return false;
      });
  }

  async downloadFile(
    txHash: DownloadExternalTxMemoRequest
  ): Promise<DownloadExternalTxMemoResponse> {
    const self = this;
    const defaultResponse = { content: '', lastUpdated: '' };
    const fullPath = this.folderPath.concat('/').concat(txHash).concat(this.memoExt);
    return this.api.filesDownload({
      path: fullPath
    })
      .then((response) => {
        Logger.debug('DropboxApi::downloadFile success: ' + txHash + ' file downloaded');
        return response.fileBlob.text()
          .then(content => {
            return {
              content: content.substr(0, MAX_MEMO_SIZE),
              lastUpdated: moment(response.server_modified, 'YYYY-MM-DDTHH:mm:ssZ').toDate()
            };
          })
          .catch((error) => {
            Logger.error('DropboxApi::downloadFile error while parsing the file: ' + stringifyError(error));
            return defaultResponse;
          });
      })
      .catch((e) => {
        self.errorCode = e.status;
        self.errorMessage = 'An error ocurred while downloading the file';
        Logger.error('DropboxApi::downloadFile error: ' + stringifyError(e.error));
        return defaultResponse;
      });
  }
}
