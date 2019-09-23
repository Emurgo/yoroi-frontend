// @flow
import {
  Logger,
  stringifyError,
} from '../../utils/logging';
import {
  GenericApiError,
} from '../common';
import DropboxApi from './providers/dropbox';
import type {
  UploadExternalTxMemoRequest, DeleteExternalTxMemoRequest,
  DownloadExternalTxMemoRequest, FetchFilenameExternalTxMemoRequest,
  UploadExternalTxMemoResponse, DeleteExternalTxMemoResponse,
  DownloadExternalTxMemoResponse, FetchFilenameExternalTxMemoResponse,
} from './types';
import { ExternalStorageList, ExternalStorageProviders } from '../../domain/ExternalStorage';
import type { SelectedExternalStorageProvider } from '../../domain/ExternalStorage';


// Each provider may have a different class. The main class will call
// all basic methods but the provider could have a specific one that
// can be invoked by calling directly to the provider
const providers = {
  [ExternalStorageList.DROPBOX]: new DropboxApi(),
  // [ExternalStorageList.GOOGLE_DRIVE]: new GoogleDriveApi(),
};
export type ProvidersType = $Values<typeof providers>;

// Main class
export default class ExternalStorageApi {

  getProviders = (): { [key: string]: ProvidersType } => providers;
  selectedProvider: ProvidersType;
  // setSelectedProvider: Function;

  constructor() {
    // $FlowFixMe
    this.setSelectedProvider = this.setSelectedProvider.bind(this);
    // $FlowFixMe
    this.setup = this.setup.bind(this);
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
    // $FlowFixMe
    this.revokeToken = this.revokeToken.bind(this);
  }

  // Setup all available providers. Usually a setup should involve
  // configuring/parsing so the provider is ready to be selected
  // as external storage
  setup() {
    // eslint-disable-next-line
    for (const key in ExternalStorageProviders) {
      providers[key].setup();
    }
  }

  // Set the selected provider (saved in local storage) so from now on
  // all methods of this main class call the provider subclass directly
  async setSelectedProvider(
    selected: SelectedExternalStorageProvider
  ): Promise<void> {
    this.selectedProvider = providers[selected.provider];
    try {
      this.selectedProvider.auth(selected.token);
    } catch (error) {
      Logger.error('ExternalStorageApi::setSelectedProvider error: ' + stringifyError(error));
      throw new GenericApiError();
    }
  }

  // Revoke current token
  async revokeToken(): Promise<void> {
    try {
      this.selectedProvider.revokeToken();
    } catch (error) {
      Logger.error('ExternalStorageApi::revokeToken error: ' + stringifyError(error));
      throw new GenericApiError();
    }
  }

  // Get metadata. It's an easy and quick way to check if a file exists
  /*async getFileMetadata(
    request: GetFileMetadataExternalTxMemoRequest
  ): Promise<GetFileMetadataExternalTxMemoResponse> {
    try {
      return this.selectedProvider.getFileMetadata(request);
    } catch (error) {
      Logger.error('ExternalStorageApi::getFileMetadada error: ' + stringifyError(error));
      throw new GenericApiError();
    }
  }*/

  // Sync with external storage folder to catch up with changes (updated/deleted files)
  async fetchFilenames(
    request: FetchFilenameExternalTxMemoRequest
  ): Promise<FetchFilenameExternalTxMemoResponse> {
    try {
      return this.selectedProvider.fetchFilenames();
    } catch (error) {
      Logger.error('ExternalStorageApi::fetchFilenames error: ' + stringifyError(error));
      throw new GenericApiError();
    }
  }

  // Upload file without overwriting. Adding a new memo should not overwrite in case of conflict
  async uploadFile(
    request: UploadExternalTxMemoRequest
  ): Promise<UploadExternalTxMemoResponse> {
    try {
      return this.selectedProvider.uploadFile(request);
    } catch (error) {
      Logger.error('ExternalStorageApi::uploadFile error: ' + stringifyError(error));
      throw new GenericApiError();
    }
  }

  // Upload file and overwrite. This is for updating an existing memo.
  async uploadAndOverwriteFile(
    request: UploadExternalTxMemoRequest
  ): Promise<UploadExternalTxMemoResponse> {
    try {
      return this.selectedProvider.uploadAndOverwriteFile(request);
    } catch (error) {
      Logger.error('ExternalStorageApi::uploadAndOverwriteFile error: ' + stringifyError(error));
      throw new GenericApiError();
    }
  }

  // Delete file
  async deleteFile(
    request: DeleteExternalTxMemoRequest
  ): Promise<DeleteExternalTxMemoResponse> {
    try {
      return this.selectedProvider.deleteFile(request);
    } catch (error) {
      Logger.error('ExternalStorageApi::deleteFile error: ' + stringifyError(error));
      throw new GenericApiError();
    }
  }

  // Download file
  async downloadFile(
    request: DownloadExternalTxMemoRequest
  ): Promise<DownloadExternalTxMemoResponse> {
    try {
      return this.selectedProvider.downloadFile(request);
    } catch (error) {
      Logger.error('ExternalStorageApi::downloadFile error: ' + stringifyError(error));
      throw new GenericApiError();
    }
  }

}
