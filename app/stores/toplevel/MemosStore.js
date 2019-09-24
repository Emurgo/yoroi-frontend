// @flow
import { observable, computed, action } from 'mobx';
import Store from '../base/Store';
import Request from '../lib/LocalizedRequest';
import WalletTransaction from '../../domain/WalletTransaction';
import LocalizableError from '../../i18n/LocalizableError';
import environment from '../../environment';
import type {
  SaveTxMemoFunc, DeleteTxMemoFunc, GetTxMemoLastUpdateDateFunc
} from '../../api/ada';
import type { TransactionMemo } from '../../api/ada/adaTypes';
import type { ProvidersType } from '../../api/externalStorage/index';
import type {
  UploadExternalTxMemoFunc, DeleteExternalTxMemoFunc,
  DownloadExternalTxMemoFunc, FetchFilenameExternalTxMemoFunc,
  FetchFilenameExternalTxMemoResponse, FetchFolderExternalTxMemoFunc,
  CreateFolderExternalTxMemoFunc
} from '../../api/externalStorage/types';
import type { SelectedExternalStorageProvider } from '../../domain/ExternalStorage';

export default class MemosStore extends Store {

  @computed get providers(): { [key: string]: ProvidersType } {
    return this.api.externalStorage.getProviders();
  }

  @observable error: ?LocalizableError = null;
  @observable selectedTransaction: WalletTransaction;

  @observable getExternalStorageProviderRequest:
    Request<void => Promise<?SelectedExternalStorageProvider>>
    // eslint-disable-next-line max-len
    = new Request<void => Promise<?SelectedExternalStorageProvider>>(this.api.localStorage.getExternalStorage);

  @observable
  setExternalStorageProviderRequest: Request<SelectedExternalStorageProvider => Promise<void>>
    // eslint-disable-next-line max-len
    = new Request<SelectedExternalStorageProvider => Promise<void>>(this.api.localStorage.setExternalStorage);

  @observable
  unsetExternalStorageProviderRequest: Request<void => Promise<void>>
    = new Request<void => Promise<void>>(this.api.localStorage.unsetExternalStorage);

  @observable
  setSelectedProviderRequest: Request<SelectedExternalStorageProvider => Promise<void>>
    // eslint-disable-next-line max-len
    = new Request<SelectedExternalStorageProvider => Promise<void>>(this.api.externalStorage.setSelectedProvider);

  @observable
  setWalletAccountNumberPlateRequest: Request<string => Promise<void>>
    = new Request<string => Promise<void>>(this.api.externalStorage.setWalletAccountNumberPlate);

  @observable uploadExternalTxMemoRequest: Request<UploadExternalTxMemoFunc>
    = new Request<UploadExternalTxMemoFunc>(this.api.externalStorage.uploadFile);

  @observable uploadAndOverwriteExternalTxMemoRequest: Request<UploadExternalTxMemoFunc>
    = new Request<UploadExternalTxMemoFunc>(this.api.externalStorage.uploadAndOverwriteFile);

  @observable deleteExternalTxMemoRequest: Request<DeleteExternalTxMemoFunc>
    = new Request<DeleteExternalTxMemoFunc>(this.api.externalStorage.deleteFile);

  @observable downloadExternalTxMemoRequest: Request<DownloadExternalTxMemoFunc>
    = new Request<DownloadExternalTxMemoFunc>(this.api.externalStorage.downloadFile);

  @observable fetchFilenamesExternalTxMemoRequest: Request<FetchFilenameExternalTxMemoFunc>
    = new Request<FetchFilenameExternalTxMemoFunc>(this.api.externalStorage.fetchFilenames);

  @observable fetchFolderExternalTxMemoRequest: Request<FetchFolderExternalTxMemoFunc>
    = new Request<FetchFolderExternalTxMemoFunc>(this.api.externalStorage.fetchFolder);

  @observable createFolderExternalTxMemoRequest: Request<CreateFolderExternalTxMemoFunc>
    = new Request<CreateFolderExternalTxMemoFunc>(this.api.externalStorage.createFolder);

  @observable saveTxMemoRequest: Request<SaveTxMemoFunc>
    = new Request<SaveTxMemoFunc>(this.api.ada.saveTxMemo);

  @observable deleteTxMemoRequest: Request<DeleteTxMemoFunc>
    = new Request<DeleteTxMemoFunc>(this.api.ada.deleteTxMemo);

  @observable getTxMemoLastUpdateDateRequest: Request<GetTxMemoLastUpdateDateFunc>
    = new Request<GetTxMemoLastUpdateDateFunc>(this.api.ada.getTxMemoLastUpdateDate);

   @observable
  revokeTokenStorageProvideRequest: Request<void => Promise<void>>
    = new Request<void => Promise<void>>(this.api.externalStorage.revokeToken);

  _hasAnyPending: boolean = false;

  setup() {
    this._getSelectedProvider(); // eagerly cache
    this.actions.memos.updateExternalStorageProvider.listen(this._setExternalStorageProvider);
    this.actions.memos.updateAccountNumberPlate.listen(this._updateAccountNumberPlate);
    this.actions.memos.unsetExternalStorageProvider.listen(this._unsetExternalStorageProvider);
    this.actions.memos.closeAddMemoDialog.listen(this._closeAddMemoDialog);
    this.actions.memos.closeEditMemoDialog.listen(this._closeEditMemoDialog);
    this.actions.memos.goBackDeleteMemoDialog.listen(this._goBackDeleteMemoDialog);
    this.actions.memos.closeDeleteMemoDialog.listen(this._closeDeleteMemoDialog);
    // eslint-disable-next-line max-len
    this.actions.memos.closeConnectExternalStorageDialog.listen(this._closeConnectExternalStorageDialog);
    this.actions.memos.selectTransaction.listen(this._selectTransaction);
    this.actions.memos.saveTxMemo.listen(this._saveTxMemo);
    this.actions.memos.updateTxMemo.listen(this._updateTxMemo);
    this.actions.memos.deleteTxMemo.listen(this._deleteTxMemo);
    this.actions.memos.syncTxMemos.listen(this._syncTxMemos);
    this.actions.memos.downloadTxMemo.listen(this._downloadTxMemo);
    this.api.externalStorage.setup();
    this.registerReactions([
      this._setSelectedProvider,
    ]);
  }

  teardown() {
    super.teardown();
  }

  // ========== Selected External Storage ========== //

  @action _setExternalStorageProvider = async (provider : SelectedExternalStorageProvider) => {
    await this.setExternalStorageProviderRequest.execute(provider);
    await this.getExternalStorageProviderRequest.execute(); // eagerly cache
  };

  @action _updateAccountNumberPlate = async (numberPlateId : string) => {
    if (this.hasSetSelectedExternalStorageProvider && !this.hasSetAccountNumberPlate) {
      await this.setWalletAccountNumberPlateRequest.execute(numberPlateId);
    }
  }

  @action _unsetExternalStorageProvider = async () => {
    await this.unsetExternalStorageProviderRequest.execute();
    await this.getExternalStorageProviderRequest.execute(); // eagerly cache
    // Revoke current token
    await this.revokeTokenStorageProvideRequest.execute();
  };

  @computed get hasLoadedExternalStorageProvider(): boolean {
    return (
      this.getExternalStorageProviderRequest.wasExecuted &&
      this.getExternalStorageProviderRequest.result !== null
    );
  }

  @computed get hasSetSelectedExternalStorageProvider(): boolean {
    return (
      this.setSelectedProviderRequest.wasExecuted &&
      this.setSelectedProviderRequest.result !== null
    );
  }

  @computed get hasSetAccountNumberPlate(): boolean {
    return (
      this.setWalletAccountNumberPlateRequest.wasExecuted &&
      this.setWalletAccountNumberPlateRequest.result !== null
    );
  }

  @action _closeAddMemoDialog = (): void => {
    this._setError(null);
    this.actions.dialogs.closeActiveDialog.trigger();
  }

  @action _closeEditMemoDialog = (): void => {
    this._setError(null);
    this.actions.dialogs.closeActiveDialog.trigger();
  }

  @action _goBackDeleteMemoDialog = (): void => {
    this._setError(null);
    this.actions.dialogs.closeActiveDialog.trigger();
  }

  @action _closeDeleteMemoDialog = (): void => {
    this._setError(null);
    this.actions.dialogs.closeActiveDialog.trigger();
  }

  @action _closeConnectExternalStorageDialog = (): void => {
    this._setError(null);
    this.actions.dialogs.closeActiveDialog.trigger();
  }

  @action _selectTransaction = async (params: { tx: WalletTransaction }): Promise<void> => {
    this.selectedTransaction = params.tx;
  }

  @action _setError = (error: ?LocalizableError): void => {
    this.error = error;
  }

  @action _saveTxMemo = async (memo: TransactionMemo) => {
    const { wallets } = this.stores.substores[environment.API];
    if (this.hasSetSelectedExternalStorageProvider) {
      await this.saveTxMemoRequest.execute({ memo });
      wallets.refreshWalletsData();
      await this.uploadExternalTxMemoRequest.execute({ memo });
      this._closeAddMemoDialog();
    }
  };

  @action _updateTxMemo = async (memo: TransactionMemo) => {
    const { wallets } = this.stores.substores[environment.API];
    if (this.hasSetSelectedExternalStorageProvider) {
      await this.saveTxMemoRequest.execute({ memo });
      wallets.refreshWalletsData();
      await this.uploadAndOverwriteExternalTxMemoRequest.execute({ memo });
      this._closeEditMemoDialog();
    }
  };

  @action _deleteTxMemo = async (memoTxHash: string) => {
    const { wallets } = this.stores.substores[environment.API];
    if (this.hasSetSelectedExternalStorageProvider) {
      await this.deleteTxMemoRequest.execute(memoTxHash);
      wallets.refreshWalletsData();
      await this.deleteExternalTxMemoRequest.execute(memoTxHash);
      this._closeDeleteMemoDialog();
    }
  };

  @action _downloadTxMemo = async (memoTxHash: string) => {
    if (this.hasSetSelectedExternalStorageProvider) {
      await this.downloadExternalTxMemoRequest.execute(memoTxHash)
        .then(async memo => {
          return await this.saveTxMemoRequest.execute({
            memo: {
              memo: memo.content,
              tx: memoTxHash,
              lastUpdated: memo.lastUpdated
            }
          });
        });
    }
  };

  @action _syncTxMemos = async () => {
    if (this.hasSetSelectedExternalStorageProvider) {
      // Check if wallet folder exists
      await this.fetchFolderExternalTxMemoRequest.execute('')
        .then(async response => {
          // If folder exists, fetch files. Otherwise, create it.
          if (response === true) {
            return await this.fetchFilenamesExternalTxMemoRequest.execute()
              .then(async memos => {
                return await this._queryAndUpdateMemos(memos);
              });
          }
          return await this.createFolderExternalTxMemoRequest.execute('');
        });
    }
  }

  _queryAndUpdateMemos = async (memos: FetchFilenameExternalTxMemoResponse) => {
    for (const memo of memos) {
      // First, check if memo already exists
      await this.getTxMemoLastUpdateDateRequest.execute(memo.tx)
        .then(async lastUpdated => {
          if (memo.deleted === true) {
            // delete local copy if file was deleted on external storage
            await this.deleteTxMemoRequest.execute(memo.tx);
          // only update if the file is newer
          } else if (lastUpdated < memo.lastUpdated) {
            await this._downloadTxMemo(memo.tx);
          }
          return lastUpdated;
        });
    }
  }

  @computed get selectedProvider(): ?SelectedExternalStorageProvider {
    const { result } = this.getExternalStorageProviderRequest.execute();
    return result;
  }

  _getSelectedProvider = () => {
    this.getExternalStorageProviderRequest.execute();
  };

  _setSelectedProvider = async () => {
    const { isLoading } = this.stores.loading;
    if (isLoading) {
      return;
    }
    if (!this.hasSetSelectedExternalStorageProvider) {
      const selected = this.selectedProvider;
      if (selected) {
        await this.setSelectedProviderRequest.execute(selected);
      }
    }
  }

}
