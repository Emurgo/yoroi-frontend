// @flow
import { observable } from 'mobx';
import { sprintf } from 'sprintf-js';
import { Dropbox } from 'dropbox';
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
  DownloadExternalTxMemoRequest,
  UploadExternalTxMemoResponse, DeleteExternalTxMemoResponse,
  DownloadExternalTxMemoResponse
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
    this.uploadFile = this.uploadFile.bind(this);
    // $FlowFixMe
    this.uploadAndOverwriteFile = this.uploadAndOverwriteFile.bind(this);
    // $FlowFixMe
    this.deleteFile = this.deleteFile.bind(this);
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
    try {
      this.api.authTokenRevoke()
        .then((response) => {
          Logger.info('DropboxApi::revokeToken success');
        })
        .catch((error) => {
          self.errorCode = error.status;
          self.errorMessage = 'An error ocurred when revoking the token';
        });
    } catch (error) {
      Logger.error('DropboxApi::revokeToken error: ' + stringifyError(error));
      throw new GenericApiError();
    }
  }

  getError() {
    return sprintf('[%s] %s', this.errorCode, this.errorMessage);
  }

  async uploadFile(
    request: UploadExternalTxMemoRequest
  ): Promise<UploadExternalTxMemoResponse> {
    const self = this;
    try {
      const txHash = request.memo.tx;
      const fullPath = this.folderPath.concat('/').concat(txHash).concat(this.memoExt);
      this.api.filesUpload({
        path: fullPath,
        contents: request.memo.memo,
      })
        .then((response) => {
          Logger.info('DropboxApi::uploadFile success: ' + txHash + ' file uploaded');
          return true;
        })
        .catch((error) => {
          if (error.status === 409) {
            console.log('file already exists');
            // TODO: download existing memo and update in local db
          }
          self.errorCode = error.status;
          self.errorMessage = 'An error ocurred when uploading the file';
          return false;
        });
    } catch (error) {
      Logger.error('DropboxApi::uploadFile error: ' + stringifyError(error));
      throw new GenericApiError();
    }
    return false;
  }

  async uploadAndOverwriteFile(
    request: UploadExternalTxMemoRequest
  ): Promise<UploadExternalTxMemoResponse> {
    const self = this;
    try {
      const txHash = request.memo.tx;
      const fullPath = this.folderPath.concat('/').concat(txHash).concat(this.memoExt);
      this.api.filesUpload({
        path: fullPath,
        contents: request.memo.memo,
        mode: 'overwrite'
      })
        .then((response) => {
          Logger.info('DropboxApi::uploadAndOverwriteFile success: ' + txHash + ' file uploaded');
          return true;
        })
        .catch((error) => {
          self.errorCode = error.status;
          self.errorMessage = 'An error ocurred when uploading the file';
          return false;
        });
    } catch (error) {
      Logger.error('DropboxApi::uploadAndOverwrite error: ' + stringifyError(error));
      throw new GenericApiError();
    }
    return false;
  }

  async deleteFile(
    txHash: string
  ): Promise<DeleteExternalTxMemoResponse> {
    const fullPath = this.folderPath.concat('/').concat(txHash).concat(this.memoExt);
    try {
      this.api.filesDelete({
        path: fullPath
      })
        .then((response) => {
          Logger.info('DropboxApi::deleteFile success: ' + txHash + ' file deleted');
          return true;
        })
        .catch((error) => {
          self.errorCode = error.status;
          self.errorMessage = 'An error ocurred when deleting the file';
          return false;
        });
    } catch (error) {
      Logger.error('DropboxApi::deleteFile error: ' + stringifyError(error));
      throw new GenericApiError();
    }
    return false;
  }

  async downloadFile(
    request: DownloadExternalTxMemoRequest
  ): Promise<DownloadExternalTxMemoResponse> {
    const self = this;
    try {
      const txHash = request.memo;
      const fullPath = this.folderPath.concat('/').concat(txHash).concat(this.memoExt);
      this.api.filesDownload({
        fullPath
      })
        .then((response) => {
          Logger.info('DropboxApi::downloadFile success: ' + txHash + ' file downloaded');
          return true;
        })
        .catch((error) => {
          self.errorCode = error.status;
          self.errorMessage = 'An error ocurred when downloading the file';
          return false;
        });
    } catch (error) {
      Logger.error('DropboxApi::downloadFile error: ' + stringifyError(error));
      throw new GenericApiError();
    }
    return false;
  }

  /*
  async searchFile(
    request: SearchExternalTxMemoRequest
  ): Promise<SearchExternalTxMemoResponse> {
    const self = this;
    const memos: Array<string> = request.memos;
    try {
      for (let i = 0; i < memos.length; i++) {
        const txHash = memos[i];
        const fullPath = this.folderPath.concat('/').concat(txHash).concat(this.memoExt);
        this.api.filesSearch({
          fullPath
        })
          .then((response) => {
            Logger.info('DropboxApi::searchFile success: ' + txHash + ' file found');
            return true;
          })
          .catch((error) => {
            self.errorCode = error.status;
            self.errorMessage = 'An error ocurred when searching the file';
            return false;
          });
      }
    } catch (error) {
      Logger.error('DropboxApi::searchFile error: ' + stringifyError(error));
      throw new GenericApiError();
    }
    return false;
  }*/
}
