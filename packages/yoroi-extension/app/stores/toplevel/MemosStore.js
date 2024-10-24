// @flow
import { observable, computed, action, runInAction } from 'mobx';
import Store from '../base/Store';
import Request from '../lib/LocalizedRequest';
import WalletTransaction from '../../domain/WalletTransaction';
import LocalizableError from '../../i18n/LocalizableError';
import type {
  TxMemoTableUpsert, TxMemoTablePreInsert, TxMemoPreLookupKey,
} from '../../api/ada/lib/storage/bridge/memos';
import type { TxMemoTableRow } from '../../api/ada/lib/storage/database/memos/tables';
import type { ProvidersType } from '../../api/externalStorage/index';
import type {
  UploadExternalTxMemoFunc, DeleteExternalTxMemoFunc,
  DownloadExternalTxMemoFunc, FetchFilenameExternalTxMemoFunc,
  FetchFilenameExternalTxMemoResponse, FetchFolderExternalTxMemoFunc,
  CreateFolderExternalTxMemoFunc
} from '../../api/externalStorage/providers/IProvider.types';
import type { SelectedExternalStorageProvider } from '../../domain/ExternalStorage';
import type { ActionsMap } from '../../actions/index';
import type { StoresMap } from '../index';
import type { WalletState } from '../../../chrome/extension/background/types';
import {
  getAllTxMemos,
  deleteTxMemo,
  upsertTxMemo,
} from '../../api/thunk';

export type MemosForWallet = Map<string, $ReadOnly<TxMemoTableRow>>;

export default class MemosStore extends Store<StoresMap, ActionsMap> {

  @computed get providers(): { [key: string]: ProvidersType, ... } {
    return this.api.externalStorage.getProviders();
  }

  @observable error: ?LocalizableError = null;
  @observable selectedTransaction: void | WalletTransaction;

  @observable getExternalStorageProviderRequest:
    Request<void => Promise<?SelectedExternalStorageProvider>>
    = new Request<void => Promise<?SelectedExternalStorageProvider>>(this.api.localStorage.getExternalStorage);

  @observable
  setExternalStorageProviderRequest: Request<SelectedExternalStorageProvider => Promise<void>>
    = new Request<SelectedExternalStorageProvider => Promise<void>>(this.api.localStorage.setExternalStorage);

  @observable
  unsetExternalStorageProviderRequest: Request<void => Promise<void>>
    = new Request<void => Promise<void>>(this.api.localStorage.unsetExternalStorage);

  @observable
  setSelectedProviderRequest: Request<SelectedExternalStorageProvider => Promise<void>>
    = new Request<SelectedExternalStorageProvider => Promise<void>>(this.api.externalStorage.setSelectedProvider);

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

  @observable
  revokeTokenStorageProvideRequest: Request<void => Promise<void>>
    = new Request<void => Promise<void>>(this.api.externalStorage.revokeToken);

  @observable
  txMemoMap: Map<string, MemosForWallet> = new Map();

  setup(): void {
    this.actions.memos.updateExternalStorageProvider.listen(this._setExternalStorageProvider);
    this.actions.memos.unsetExternalStorageProvider.listen(this._unsetExternalStorageProvider);
    this.actions.memos.closeMemoDialog.listen(this._closeMemoDialog);
    this.actions.memos.selectTransaction.listen(this._selectTransaction);
    this.actions.memos.saveTxMemo.listen(this._saveTxMemo);
    this.actions.memos.updateTxMemo.listen(this._updateTxMemo);
    this.actions.memos.deleteTxMemo.listen(this._deleteTxMemo);
    this.actions.memos.syncTxMemos.listen(this._syncTxMemos);
    this.actions.memos.downloadTxMemo.listen(this._downloadAndSaveTxMemo);
    this.api.externalStorage.setup();
    this.registerReactions([
      this._setSelectedProvider,
      this._initMemosForWallet,
    ]);
  }

  teardown(): void {
    super.teardown();
  }

  _initMemosForWallet: void => void = () => {
    const { selected } = this.stores.wallets;
    if (selected == null) return undefined;
    const walletId = selected.plate.TextPart;
    const memos = this.txMemoMap.get(walletId);
    if (memos != null) return;

    // not found -> new wallet
    const result = observable.map();
    runInAction(() => {
      this.txMemoMap.set(walletId, result);
    });
    return result;
  }

  @action
  loadFromStorage: void => Promise<void> = async () => {
    // note: only need to care about persistent storage
    // since this is called only once when the app launches
    // so there should be no transient storage when the app loads anyway
    const allTxMemos = await getAllTxMemos();
    if (allTxMemos == null) throw new Error('Should never happen');
    for (const txMemo of allTxMemos) {
      let walletTxMemos = this.txMemoMap.get(txMemo.WalletId);
      runInAction(() => {
        if (walletTxMemos == null) {
          walletTxMemos = observable.map();
          this.txMemoMap.set(txMemo.WalletId, walletTxMemos);
        }
        walletTxMemos.set(txMemo.TransactionHash, txMemo);
      });
    }
  }

  // ========== Selected External Storage ========== //

  @action _setExternalStorageProvider: SelectedExternalStorageProvider => Promise<void> = async (
    provider
  ) => {
    await this.setExternalStorageProviderRequest.execute(provider);
    await this.getExternalStorageProviderRequest.execute(); // eagerly cache
  };

  @action _unsetExternalStorageProvider: void => Promise<void> = async () => {
    await this.unsetExternalStorageProviderRequest.execute();
    await this.getExternalStorageProviderRequest.execute(); // eagerly cache
    // Revoke current token
    await this.revokeTokenStorageProvideRequest.execute();
    // Reset SET requests
    this.setSelectedProviderRequest.reset();
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

  @action _closeMemoDialog: void => void = () => {
    this._setError(null);
    this.actions.dialogs.closeActiveDialog.trigger();
  }

  @action _selectTransaction: {| tx: WalletTransaction |} => void = (params) => {
    this.selectedTransaction = params.tx;
  }

  @action _setError: ?LocalizableError => void = (error) => {
    this.error = error;
  }

  @action _saveTxMemo: TxMemoTablePreInsert => Promise<void> = async (request) => {
    const walletId = request.plateTextPart;
    const memo = {
      ...request.memo,
      WalletId: walletId,
    };
    if (this.hasSetSelectedExternalStorageProvider) {
      await this.uploadExternalTxMemoRequest.execute({ memo });
    }
    const savedMemo = await upsertTxMemo({
      publicDeriverId: request.publicDeriverId,
      memo,
    });

    runInAction(() => {
      this.txMemoMap.get(walletId)?.set(request.memo.TransactionHash, savedMemo);
    });
    this._closeMemoDialog();
  };

  @action _updateTxMemo: TxMemoTableUpsert => Promise<void> = async (request) => {
    const walletId = request.plateTextPart;
    const memo = {
      ...request.memo,
      WalletId: walletId,
    };
    if (this.hasSetSelectedExternalStorageProvider) {
      await this.uploadAndOverwriteExternalTxMemoRequest.execute({ memo });
    }
    const savedMemo = await upsertTxMemo({
      publicDeriverId: request.publicDeriverId,
      memo,
    });
    if (savedMemo == null) throw new Error('Should never happen');
    runInAction(() => {
      this.txMemoMap.get(walletId)?.set(request.memo.TransactionHash, savedMemo);
    });
    this._closeMemoDialog();
  };

  @action _deleteTxMemo: TxMemoPreLookupKey => Promise<void> = async (request) => {
    const walletId = request.plateTextPart;
    const memoToDelete = {
      walletId,
      txHash: request.txHash,
    };
    if (this.hasSetSelectedExternalStorageProvider) {
      await this.deleteExternalTxMemoRequest.execute(memoToDelete);
    }
    await deleteTxMemo({
      publicDeriverId: request.publicDeriverId,
      key: memoToDelete,
    });
    runInAction(() => {
      this.txMemoMap.get(walletId)?.delete(request.txHash);
    });
    this._closeMemoDialog();
  };

  @action _downloadAndSaveTxMemo: TxMemoPreLookupKey => Promise<void> = async (
    request
  ) => {
    if (this.hasSetSelectedExternalStorageProvider) {
      const walletId = request.plateTextPart;
      const memo = await this.downloadExternalTxMemoRequest.execute({
        walletId,
        txHash: request.txHash,
      }).promise;
      if (memo == null) throw new Error('Should never happen');
      const memoRow = await upsertTxMemo({
        publicDeriverId: request.publicDeriverId,
        memo: {
          WalletId: walletId,
          Content: memo.content,
          TransactionHash: request.txHash,
          LastUpdated: memo.lastUpdated
        }
      });

      runInAction(() => {
        this.txMemoMap.get(walletId)?.set(request.txHash, memoRow);
      });
    }
  };

  @action _syncTxMemos: WalletState => Promise<void> = async (publicDeriver) => {
    if (this.hasSetSelectedExternalStorageProvider) {
      // 1st check if root folder exists. If not, we create it
      {
        const rootFolderStatus = await this.fetchFolderExternalTxMemoRequest.execute({
          walletId: undefined
        }).promise;
        if (rootFolderStatus == null) return undefined;
        if (rootFolderStatus === false) {
          await this.createFolderExternalTxMemoRequest.execute({ walletId: undefined });
        }
      }

      // 2nd check if wallet folder exists. If not, we create it
      const walletId = publicDeriver.plate.TextPart;
      {
        // Check if wallet folder exists
        const walletFolderStatus = await this.fetchFolderExternalTxMemoRequest.execute({
          walletId
        }).promise;
        if (walletFolderStatus == null) return undefined;
        if (walletFolderStatus === false) {
          await this.createFolderExternalTxMemoRequest.execute({ walletId });
        }
      }

      // sync memos with remote
      const memos = await this.fetchFilenamesExternalTxMemoRequest.execute({ walletId }).promise;
      if (memos == null) return undefined;
      await this._updateLocaleFromRemote({
        remoteResponse: memos,
        publicDeriver,
      });
    }
  }

  _updateLocaleFromRemote: {|
    remoteResponse: FetchFilenameExternalTxMemoResponse,
    publicDeriver: WalletState,
  |} => Promise<void> = async (request) => {
    const walletId = request.publicDeriver.plate.TextPart;
    const txMemosForWallet = this.txMemoMap.get(walletId);
    if (txMemosForWallet == null) return; // shouldn't happen

    for (const memo of request.remoteResponse) {
      // check if memo already exists
      const localMemo = txMemosForWallet.get(memo.tx);
      if (localMemo != null) {
        // delete local copy if file was deleted on external storage
        if (memo.deleted === true) {
          await deleteTxMemo({
            publicDeriverId: request.publicDeriver.publicDeriverId,
            key: {
              walletId,
              txHash: memo.tx,
            }
          });
        } else if (localMemo.LastUpdated < memo.lastUpdated) {
          // only update if the file is newer
          await this._downloadAndSaveTxMemo({
            publicDeriverId: request.publicDeriver.publicDeriverId,
            plateTextPart: request.publicDeriver.plate.TextPart,
            txHash: memo.tx
          });
        }
        // our local version is more recent, so don't do anything
      } else {
        // save memo locally
        await this._downloadAndSaveTxMemo({
          publicDeriverId: request.publicDeriver.publicDeriverId,
          plateTextPart: request.publicDeriver.plate.TextPart,
          txHash: memo.tx
        });
      }
    }
  }

  @computed get selectedProvider(): ?SelectedExternalStorageProvider {
    let { result } = this.getExternalStorageProviderRequest;
    if (result == null) {
      result = this.getExternalStorageProviderRequest.execute().result;
    }
    return result;
  }

  _setSelectedProvider: void => Promise<void> = async () => {
    const { isLoading } = this.stores.loading;
    if (isLoading) {
      return;
    }
    // TODO: handle refreshing (and possibly merging) memos when a provider is selected
    if (!this.hasSetSelectedExternalStorageProvider) {
      const selected = this.selectedProvider;
      if (selected) {
        await this.setSelectedProviderRequest.execute(selected);
      }
    }
  }
}
