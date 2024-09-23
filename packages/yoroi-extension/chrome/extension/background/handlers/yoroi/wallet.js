// @flow
import type { HandlerType } from './type';
import { RustModule } from '../../../../../app/api/ada/lib/cardanoCrypto/rustLoader';
import { getNetworkById } from '../../../../../app/api/ada/lib/storage/database/prepackaged/networks';
import AdaApi, { genOwnStakingKey } from '../../../../../app/api/ada';
import { getDb, syncWallet } from '../../state';
import { emitUpdateToSubscriptions } from '../../subscriptionManager';
import type { WalletState } from '../../types';
import { getWalletsState, getPlaceHolderWalletState } from '../utils';
import type { HWFeatures } from '../../../../../app/api/ada/lib/storage/database/walletTypes/core/tables';
import type { NetworkRow } from '../../../../../app/api/ada/lib/storage/database/primitives/tables';
import { getCardanoStateFetcher } from '../../utils';
import LocalStorageApi, {
  loadSubmittedTransactions, persistSubmittedTransactions
} from '../../../../../app/api/localStorage';
import { getPublicDeriverById } from './utils';
import { removePublicDeriver } from '../../../../../app/api/ada/lib/storage/bridge/walletBuilder/remove';
import { loadWalletsFromStorage } from '../../../../../app/api/ada/lib/storage/models/load';
import {
  asDisplayCutoff,
  asGetSigningKey,
  asGetAllAccounting,
  asHasLevels,
} from '../../../../../app/api/ada/lib/storage/models/PublicDeriver/traits';
import {
  removeAllTransactions,
} from '../../../../../app/api/ada/lib/storage/bridge/updateTransactions';
import type { ReferenceTransaction, BaseGetTransactionsRequest } from '../../../../../app/api/common';
import WalletTransaction from '../../../../../app/domain/WalletTransaction';
import type { AdaGetTransactionsRequest } from '../../../../../app/api/ada';

type CreateWalletRequest = {|
  networkId: number,
  recoveryPhrase: string,
  walletName: string,
  walletPassword: string,
  accountIndex: number,
|};
type CreateWalletResponse =  WalletState;

export const CreateWallet: HandlerType<CreateWalletRequest, CreateWalletResponse> = Object.freeze({
  typeTag: 'create-wallet',

  handle: async (request) => {
    await RustModule.load();

    const db = await getDb();
    const network = getNetworkById(request.networkId);

    const adaApi = new AdaApi();
    const { publicDerivers } = await adaApi.createWallet({
      db,
      network,
      recoveryPhrase: request.recoveryPhrase,
      walletName: request.walletName,
      walletPassword: request.walletPassword,
      accountIndex: request.accountIndex,
    });

    emitUpdateToSubscriptions({
      type: 'wallet-state-update',
      params: {
        eventType: 'new',
        publicDeriverId: publicDerivers[0].getPublicDeriverId(),
      }
    });
    syncWallet(publicDerivers[0], 'new wallet', 1);
    return await getPlaceHolderWalletState(publicDerivers[0]);
  },
});

export type CreateHardwareWalletRequest = {|
  walletName: string,
  publicKey: string,
  addressing: {|
    path: Array<number>,
    startLevel: number,
  |},
  hwFeatures: HWFeatures,
  network: $ReadOnly<NetworkRow>,
|};

export const CreateHardwareWallet: HandlerType<
  CreateHardwareWalletRequest, CreateWalletResponse
> = Object.freeze({
  typeTag: 'create-hardware-wallet',

  handle: async (request) => {
    await RustModule.load();

    const db = await getDb();

    const stateFetcher = await getCardanoStateFetcher(new LocalStorageApi());

    const adaApi = new AdaApi();
    const { publicDeriver } = await adaApi.createHardwareWallet({
      db,
      network: request.network,
      walletName: request.walletName,
      publicKey: request.publicKey,
      hwFeatures: request.hwFeatures,
      checkAddressesInUse: stateFetcher.checkAddressesInUse,
      addressing: request.addressing,
    });

    emitUpdateToSubscriptions({
      type: 'wallet-state-update',
      params: {
        eventType: 'new',
        publicDeriverId: publicDeriver.getPublicDeriverId(),
      }
    });
    syncWallet(publicDeriver, 'new wallet', 1);

    return await getPlaceHolderWalletState(publicDeriver);
  },
});

export const RemoveWallet: HandlerType<
  {| publicDeriverId: number |},
  void,
> = Object.freeze({
  typeTag: 'remove-wallet',

  handle: async (request) => {
    const publicDeriver = await getPublicDeriverById(request.publicDeriverId);

    await removePublicDeriver({
      publicDeriver,
      conceptualWallet: publicDeriver.getParent(),
    });

    emitUpdateToSubscriptions({
      type: 'wallet-state-update',
      params: {
        eventType: 'remove',
        publicDeriverId: request.publicDeriverId,
      }
    });
  },
});

export const RenamePublicDeriver: HandlerType<
  {| publicDeriverId: number, newName: string |},
  void
> = Object.freeze({
  typeTag: 'rename-public-deriver',

  handle: async (request) => {
    const publicDeriver = await getPublicDeriverById(request.publicDeriverId);
    await publicDeriver.rename({ newName: request.newName });
  }
});

export const RenameConceptualWallet: HandlerType<
  {| conceptualWalletId: number, newName: string |},
  void
> = Object.freeze({
  typeTag: 'rename-conceptual-wallet',

  handle: async (request) => {
    const db = await getDb();
    for (const publicDeriver of await loadWalletsFromStorage(db)) {
      if (publicDeriver.getParent().getConceptualWalletId() === request.conceptualWalletId) {
        await publicDeriver.getParent().rename({ newName: request.newName });
      }
    }
  },
});

export const GetWallets: HandlerType<
  {| walletId: ?number |},
  Array<WalletState>,
> = Object.freeze({
  typeTag: 'get-wallets',

  handle: async (request) => {
    return await getWalletsState(request.walletId);
  },
});

export const ResyncWallet: HandlerType<
  {| publicDeriverId: number |},
  void,
> = Object.freeze({
  typeTag: 'resync-wallet',

  handle: async (request) => {
    const publicDeriver = await getPublicDeriverById(request.publicDeriverId);
    await syncWallet(publicDeriver, 'UI resync');
  },
});

export const ChangeSigningPassword: HandlerType<
  {|
    publicDeriverId: number,
    oldPassword: string,
    newPassword: string,
  |},
  void
> = Object.freeze({
  typeTag: 'change-signing-password',

  handle: async (request) => {
    const publicDeriver = await getPublicDeriverById(request.publicDeriverId);

    const withSigningKey = asGetSigningKey(publicDeriver);
    if (withSigningKey == null) {
      throw new Error('unexpected missing asGetSigningKey result');
    }
    const newUpdateDate = new Date(Date.now());
    await withSigningKey.changeSigningKeyPassword({
      currentTime: newUpdateDate,
      oldPassword: request.oldPassword,
      newPassword: request.newPassword,
    });
  },
});

export const GetPrivateStakingKey: HandlerType<
  {| publicDeriverId: number, password: string |},
  string | {| error: string |},
> = Object.freeze({
  typeTag: 'get-private-staking-key',

  handle: async (request) => {
    const publicDeriver = await getPublicDeriverById(request.publicDeriverId);
    const withSigning = asGetSigningKey(publicDeriver);
    if (withSigning == null) {
      throw new Error('unexpected missing asGetSigningKey result');
    }
    const withStakingKey = asGetAllAccounting(withSigning);
    if (withStakingKey == null) {
      throw new Error('unexpected missing asGetAllAcccounting result');
    }
    try {
      const stakingKey = await genOwnStakingKey({
        publicDeriver: withStakingKey,
        password: request.password,
      });
      return stakingKey.to_hex();
    } catch (error) {
      return { error: error.name };
    }
  },
});

export const RemoveAllTransactions: HandlerType<
  { publicDeriverId: number, ... },
  void
> = Object.freeze({
  typeTag: 'remove-all-transactions',

  handle: async (request) => {
    const publicDeriver = await getPublicDeriverById(request.publicDeriverId);
    const withLevels = asHasLevels(publicDeriver);
    if (!withLevels) {
      throw new Error('unexpected missing asHasLevels result');
    }
    await removeAllTransactions({ publicDeriver: withLevels });

    const txs = await loadSubmittedTransactions();
    if (!txs) {
      return;
    }
    const filteredTxs = txs.filter(
      ({ publicDeriverId }) => publicDeriverId !== request.publicDeriverId
    );
    await persistSubmittedTransactions(filteredTxs);
  },
});

export const PopAddress: HandlerType<
  { publicDeriverId: number, ... },
  void
> = Object.freeze({
  typeTag: 'pop-address',

  handle: async (request) => {
    const publicDeriver = await getPublicDeriverById(request.publicDeriverId);
    const withDisplayCutoff = asDisplayCutoff(publicDeriver);
    if (withDisplayCutoff == null) {
      throw new Error('unexpected missing asDisplayCutoff result');
    }
    await withDisplayCutoff.popAddress();
  },
});

type RefreshTransactionForInitialLoad = {|
|};
type RefreshTransactionToLoadMore = {|
  beforeTx: ReferenceTransaction,
  skip: number,
  limit: number,
|};
type RefreshTransactionsRequest = {|
  publicDeriverId: number,
  ...(RefreshTransactionForInitialLoad | RefreshTransactionToLoadMore)
|};

export const RefreshTransactions: HandlerType<
  RefreshTransactionsRequest,
  Array<WalletTransaction>
> = Object.freeze({
  typeTag: 'refresh-transactions',

  handle: async (request) => {
    const publicDeriver = await getPublicDeriverById(request.publicDeriverId);
    const withLevels = asHasLevels(publicDeriver);
    if (!withLevels) {
      throw new Error('unexpected missing asHasLevels result');
    }

    const stateFetcher = await getCardanoStateFetcher(new LocalStorageApi());
    const adaApi = new AdaApi();
    const refreshTxRequest: {|
      ...BaseGetTransactionsRequest,
      ...AdaGetTransactionsRequest,
    |} = {
      publicDeriver: withLevels,
      isLocalRequest: true,
      getRecentTransactionHashes: stateFetcher.getRecentTransactionHashes,
      getTransactionsByHashes: stateFetcher.getTransactionsByHashes,
      checkAddressesInUse: stateFetcher.checkAddressesInUse,
      getBestBlock: stateFetcher.getBestBlock,
      getTokenInfo: stateFetcher.getTokenInfo,
      getMultiAssetMetadata: stateFetcher.getMultiAssetMintMetadata,
      getMultiAssetSupply: stateFetcher.getMultiAssetSupply,
      getTransactionHistory: stateFetcher.getTransactionsHistoryForAddresses,
    };

    let txs;
    if (typeof request.skip === 'number' && request.limit && request.beforeTx) {
      const { skip, limit, beforeTx } = request;
      // load more
      // first try to load locally
      refreshTxRequest.skip = skip;
      refreshTxRequest.limit = limit;
      const localTxs = await adaApi.refreshTransactions(refreshTxRequest);
      if (localTxs.length === limit) {
        txs = localTxs;
      } else {
        // not enough in db, must request network
        refreshTxRequest.beforeTx = localTxs.length ? localTxs[localTxs.length - 1] : beforeTx;
        refreshTxRequest.isLocalRequest = false;
        const remoteTxs = await adaApi.refreshTransactions(refreshTxRequest);
        txs = [...localTxs, ...remoteTxs.slice(0, limit - localTxs.length)];
      }
    } else {
      // initial transaction list loading
      txs = await adaApi.refreshTransactions(refreshTxRequest);
    }
    return txs;
  },
});
