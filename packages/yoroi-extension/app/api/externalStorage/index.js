// @flow
import {
  Logger,
  stringifyError,
} from '../../utils/logging';
import {
  GenericApiError,
} from '../common/errors';
import DropboxApi from './providers/dropbox';
import type {
  IProvider,
  UploadExternalTxMemoRequest, DeleteExternalTxMemoRequest,
  DownloadExternalTxMemoRequest, FetchFolderExternalTxMemoRequest,
  CreateFolderExternalTxMemoRequest,
  UploadExternalTxMemoResponse, DeleteExternalTxMemoResponse,
  DownloadExternalTxMemoResponse,
  FetchFilenameExternalTxMemoRequest, FetchFilenameExternalTxMemoResponse,
  FetchFolderExternalTxMemoResponse, CreateFolderExternalTxMemoResponse
} from './providers/IProvider.types';
import { ExternalStorageList } from '../../domain/ExternalStorage';
import type { SelectedExternalStorageProvider } from '../../domain/ExternalStorage';


// Each provider may have a different class. The main class will call
// all basic methods but the provider could have a specific one that
// can be invoked by calling directly to the provider
const providers: {|dropbox: DropboxApi|} = {
  [ExternalStorageList.DROPBOX]: new DropboxApi(),
  // [ExternalStorageList.GOOGLE_DRIVE]: new GoogleDriveApi(),
};
export type ProvidersType = $Values<typeof providers>;

// Composite pattern for forwarding calls to selected provider
export default class ExternalStorageApi implements IProvider {

  getProviders: void => { [key: string]: ProvidersType, ... } = () => providers;
  selectedProvider: ProvidersType;
  wallet: string;

  constructor() {
    this.setSelectedProvider = this.setSelectedProvider.bind(this);
    this.setup = this.setup.bind(this);
    this.fetchFolder = this.fetchFolder.bind(this);
    this.fetchFilenames = this.fetchFilenames.bind(this);
    this.createFolder = this.createFolder.bind(this);
    this.uploadFile = this.uploadFile.bind(this);
    this.uploadAndOverwriteFile = this.uploadAndOverwriteFile.bind(this);
    this.deleteFile = this.deleteFile.bind(this);
    this.downloadFile = this.downloadFile.bind(this);
    this.revokeToken = this.revokeToken.bind(this);
  }

  // Setup all available providers. Usually a setup should involve
  // configuring/parsing so the provider is ready to be selected
  // as external storage
  /*:: setup: void => void; */
  setup(): void {
    for (const key of Object.keys(providers)) {
      providers[key].setup();
    }
  }

  // Set the selected provider (saved in local storage) so from now on
  // all methods of this main class call the provider subclass directly
  /*:: setSelectedProvider: SelectedExternalStorageProvider => Promise<void>; */
  async setSelectedProvider(
    selected: SelectedExternalStorageProvider
  ): Promise<void> {
    this.selectedProvider = providers[selected.provider];
    try {
      return this.selectedProvider.auth(selected.token);
    } catch (error) {
      Logger.error('ExternalStorageApi::setSelectedProvider error: ' + stringifyError(error));
      throw new GenericApiError();
    }
  }

  /*:: getDisplayName: void => string; */
  getDisplayName(): string {
    return this.getDisplayName();
  }

  /*:: revokeToken: void => Promise<void>; */
  async revokeToken(): Promise<void> {
    try {
      return this.selectedProvider.revokeToken();
    } catch (error) {
      Logger.error('ExternalStorageApi::revokeToken error: ' + stringifyError(error));
      throw new GenericApiError();
    }
  }

  /*:: fetchFolder:
    FetchFolderExternalTxMemoRequest => Promise<FetchFolderExternalTxMemoResponse>; */
  async fetchFolder(
    request: FetchFolderExternalTxMemoRequest
  ): Promise<FetchFolderExternalTxMemoResponse> {
    try {
      return this.selectedProvider.fetchFolder(request);
    } catch (error) {
      Logger.error('ExternalStorageApi::fetchFolder error: ' + stringifyError(error));
      throw new GenericApiError();
    }
  }

  /*:: createFolder:
    CreateFolderExternalTxMemoRequest => Promise<CreateFolderExternalTxMemoResponse>; */
  async createFolder(
    request: CreateFolderExternalTxMemoRequest
  ): Promise<CreateFolderExternalTxMemoResponse> {
    try {
      return this.selectedProvider.createFolder(request);
    } catch (error) {
      Logger.error('ExternalStorageApi::createFolder error: ' + stringifyError(error));
      throw new GenericApiError();
    }
  }

  /*:: fetchFilenames:
    FetchFilenameExternalTxMemoRequest => Promise<FetchFilenameExternalTxMemoResponse>; */
  async fetchFilenames(
    request: FetchFilenameExternalTxMemoRequest
  ): Promise<FetchFilenameExternalTxMemoResponse> {
    try {
      return this.selectedProvider.fetchFilenames(request);
    } catch (error) {
      Logger.error('ExternalStorageApi::fetchFilenames error: ' + stringifyError(error));
      throw new GenericApiError();
    }
  }

  /*:: uploadFile: UploadExternalTxMemoRequest => Promise<UploadExternalTxMemoResponse>; */
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

  /*:: uploadAndOverwriteFile:
    UploadExternalTxMemoRequest => Promise<UploadExternalTxMemoResponse>; */
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

  /*:: deleteFile: DeleteExternalTxMemoRequest => Promise<DeleteExternalTxMemoResponse>; */
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

  /*:: downloadFile: DownloadExternalTxMemoRequest => Promise<DownloadExternalTxMemoResponse>; */
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
