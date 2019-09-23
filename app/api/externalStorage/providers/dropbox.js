// @flow
import { observable } from 'mobx';
import { sprintf } from 'sprintf-js';
import { Dropbox } from 'dropbox';
import moment from 'moment';
import { DROPBOX_CLIENT_ID } from '../../../config/externalStorage';
import type { TransactionMemo } from '../../ada/adaTypes';
import {
  Logger,
  stringifyError
} from '../../../utils/logging';
import {
  GenericApiError,
} from '../../common';
import environment from '../../../environment';
import type {
  UploadExternalTxMemoRequest, DeleteExternalTxMemoRequest,
  DownloadExternalTxMemoRequest, GetFileMetadaExternalTxMemoRequest,
  FetchFilenameExternalTxMemoRequest,
  UploadExternalTxMemoResponse, DeleteExternalTxMemoResponse,
  DownloadExternalTxMemoResponse, GetFileMetadaExternalTxMemoResponse,
  FetchFilenameExternalTxMemoResponse,
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
  /*setup: Function;
  auth: Function;
  uploadFile: Function;
  uploadAndOverwriteFile: Function;
  deleteFile: Function;*/

  constructor() {
    // $FlowFixMe
    this.setup = this.setup.bind(this);
    // $FlowFixMe
    this.auth = this.auth.bind(this);
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

  async revokeToken(): Promise<void> {
    return this.api.authTokenRevoke()
      .then((response) => {
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

  async fetchFilenames(
    request: FetchFilenameExternalTxMemoRequest
  ): Promise<FetchFilenameExternalTxMemoResponse> {
    const self = this;
    return await this.api.filesListFolder({
      path: this.folderPath,
      include_deleted: true,
    })
      .then((response) => {
        return response.entries.map(entry => {
          if(entry.hasOwnProperty('.tag') && entry.hasOwnProperty('name')) {
            return {
              tx: entry.name.substr(0, entry.name.length-this.memoExt.length),
              deleted: entry['.tag'] === 'deleted',
              lastUpdated: entry.hasOwnProperty('server_modified') ?
                moment(entry.server_modified, "YYYY-MM-DDTHH:mm:ssZ").toDate() : ''
            }
          }
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
      .then((response) => {
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
      .then((response) => {
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
      .then((response) => {
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
              content,
              lastUpdated: moment(response.server_modified, "YYYY-MM-DDTHH:mm:ssZ").toDate()
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
