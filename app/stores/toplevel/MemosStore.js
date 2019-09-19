// @flow
import { observable, computed, action } from 'mobx';
import Store from '../base/Store';
import Request from '../lib/LocalizedRequest';
import WalletTransaction from '../../domain/WalletTransaction';
import LocalizableError from '../../i18n/LocalizableError';
import environment from '../../environment';
import type {
  SaveTxMemoFunc, DeleteTxMemoFunc,
} from '../../api/ada';
import type { TransactionMemo } from '../../api/ada/adaTypes';
import type { ProvidersType } from '../../api/externalStorage/index';
import type {
  UploadExternalTxMemoFunc, DeleteExternalTxMemoFunc,
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
  setSelectedProviderRequest: Request<SelectedExternalStorageProvider => Promise<void>>
    // eslint-disable-next-line max-len
    = new Request<SelectedExternalStorageProvider => Promise<void>>(this.api.externalStorage.setSelectedProvider);

  @observable uploadExternalTxMemoRequest: Request<UploadExternalTxMemoFunc>
    = new Request<UploadExternalTxMemoFunc>(this.api.externalStorage.uploadFile);

  @observable uploadAndOverwriteExternalTxMemoRequest: Request<UploadExternalTxMemoFunc>
    = new Request<UploadExternalTxMemoFunc>(this.api.externalStorage.uploadAndOverwriteFile);

    @observable deleteExternalTxMemoRequest: Request<DeleteExternalTxMemoFunc>
    = new Request<DeleteExternalTxMemoFunc>(this.api.externalStorage.deleteFile);

  @observable saveTxMemoRequest: Request<SaveTxMemoFunc>
    = new Request<SaveTxMemoFunc>(this.api.ada.saveTxMemos);

  @observable deleteTxMemoRequest: Request<DeleteTxMemoFunc>
    = new Request<DeleteTxMemoFunc>(this.api.ada.deleteTxMemos);

  _hasAnyPending: boolean = false;

  setup() {
    this._getSelectedProvider(); // eagerly cache
    this.actions.memos.updateExternalStorageProvider.listen(this._setExternalStorageProvider);
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

  @action _saveTxMemo = async (params: TransactionMemo) => {
    const memos: Array<TransactionMemo> = [params];
    const { wallets } = this.stores.substores[environment.API];
    if (this.hasSetSelectedExternalStorageProvider) {
      await this.saveTxMemoRequest.execute({ memos });
      wallets.refreshWalletsData();
      await this.uploadExternalTxMemoRequest.execute({ memos });
      this._closeAddMemoDialog();
    }
  };

  @action _updateTxMemo = async (params: TransactionMemo) => {
    const memos: Array<TransactionMemo> = [params];
    const { wallets } = this.stores.substores[environment.API];
    if (this.hasSetSelectedExternalStorageProvider) {
      await this.saveTxMemoRequest.execute({ memos });
      wallets.refreshWalletsData();
      await this.uploadAndOverwriteExternalTxMemoRequest.execute({ memos });
      this._closeEditMemoDialog();
    }
  };

  @action _deleteTxMemo = async (tx: string) => {
    const { wallets } = this.stores.substores[environment.API];
    if (this.hasSetSelectedExternalStorageProvider) {
      await this.deleteTxMemoRequest.execute(tx);
      wallets.refreshWalletsData();
      await this.deleteExternalTxMemoRequest.execute(tx);
      this._closeDeleteMemoDialog();
    }
  };

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
