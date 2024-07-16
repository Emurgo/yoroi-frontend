// @flow
// Handle messages from Yoroi extension pages, including connector.

import { getWallets } from '../../../../app/api/common/index';
import { PublicDeriver, } from '../../../../app/api/ada/lib/storage/models/PublicDeriver/index';
import {
  asGetAllUtxos,
  asHasUtxoChains,
  asDisplayCutoff,
  asGetSigningKey,
  asGetAllAccounting,
  asHasLevels,
  asGetPublicKey,
} from '../../../../app/api/ada/lib/storage/models/PublicDeriver/traits';
import type {
  CardanoTx,
  ConfirmedSignData,
  ConnectedSites,
  ConnectingMessage,
  ConnectResponseData,
  ConnectRetrieveData,
  FailedSignData,
  GetConnectedSitesData,
  GetConnectionProtocolData,
  GetUtxosRequest,
  RemoveWalletFromWhitelistData,
  SigningMessage,
  TxSignWindowRetrieveData,
  GetDb,
  Subscribe,
  CreateWallet,
  CreateHardwareWallet,
  RemoveWallet,
  GetWallets,
  ChangeSigningPassword,
  RenamePublicDeriver,
  RenameConceptualWallet,
  SignAndBroadcastTransaction,
  BroadcastTransaction,
  GetPrivateStakingKey,
  GetCardanoAssets,
  UpsertTxMemo,
  DeleteTxMemo,
  GetAllTxMemos,
  RemoveAllTransactions,
  PopAddress,
  RefreshTransactions,
  ConnectorCreateAuthEntry,
  GetAllExplorers,
  GetSelectedExplorer,
  SaveSelectedExplorer,
  SignTransaction,
} from '../../connector/types';
import {
  APIErrorCodes,
  asPaginate,
  asTokenId,
  asValue,
  ConnectorError,
  DataSignErrorCodes,
  TxSignErrorCodes,
} from '../../connector/types';
import {
  connectorCreateCardanoTx,
  connectorGetBalance,
  connectorGetCardanoRewardAddresses,
  connectorGetChangeAddress,
  connectorGetCollateralUtxos,
  connectorGetUnusedAddresses,
  connectorGetUsedAddressesWithPaginate,
  connectorGetUtxosCardano,
  connectorRecordSubmittedCardanoTransaction,
  connectorSendTxCardano,
  connectorSignCardanoTx,
  getAddressing,
  connectorSignData,
  connectorGetAssets,
  getTokenMetadataFromIds,
  MAX_COLLATERAL,
  connectorGetDRepKey, connectorGetStakeKey,
} from '../../connector/api';
import {
  updateTransactions as cardanoUpdateTransactions,
  removeAllTransactions,
  genCardanoAssetMap,
} from '../../../../app/api/ada/lib/storage/bridge/updateTransactions';
import { environment } from '../../../../app/environment';
import type { IFetcher as CardanoIFetcher } from '../../../../app/api/ada/lib/state-fetch/IFetcher.types';
import { RemoteFetcher as CardanoRemoteFetcher } from '../../../../app/api/ada/lib/state-fetch/remoteFetcher';
import { BatchedFetcher as CardanoBatchedFetcher } from '../../../../app/api/ada/lib/state-fetch/batchedFetcher';
import LocalStorageApi, {
  loadSubmittedTransactions, persistSubmittedTransactions
} from '../../../../app/api/localStorage/index';
import { RustModule } from '../../../../app/api/ada/lib/cardanoCrypto/rustLoader';
import { Logger, stringifyError } from '../../../../app/utils/logging';
import type { lf$Database, } from 'lovefield';
import {
  getCardanoHaskellBaseConfig,
  isCardanoHaskell,
  getNetworkById,
} from '../../../../app/api/ada/lib/storage/database/prepackaged/networks';
import { authSignHexPayload } from '../../../../app/connector/api';
import type { RemoteUnspentOutput } from '../../../../app/api/ada/lib/state-fetch/types';
import { NotEnoughMoneyToSendError, } from '../../../../app/api/common/errors';
import {
  asAddressedUtxo as asAddressedUtxoCardano,
  mergeWitnessSets,
} from '../../../../app/api/ada/transactions/utils';
import ConnectorStore from '../../../../app/connector/stores/ConnectorStore';
import type { ForeignUtxoFetcher } from '../../../../app/connector/stores/ConnectorStore';
import { find721metadata } from '../../../../app/utils/nftMetadata';
import { hexToBytes } from '../../../../app/coreUtils';
import { getDb, syncWallet } from '../state';
import {
  withDb,
  withSelectedWallet,
  getConnectedSite,
  connectContinuation,
  setConnectedSite,
  deleteConnectedSite,
  sendToInjector,
  transformCardanoUtxos,
  getAllConnectedSites,
  getFromStorage,
  STORAGE_KEY_IMG_BASE64,
  STORAGE_KEY_CONNECTION_PROTOCOL,
} from './content';
import type { ConnectedSite } from './content';
import { subscribe, emitUpdateToSubscriptions } from '../subscriptionManager';
import AdaApi, { genOwnStakingKey } from '../../../../app/api/ada';
import { loadWalletsFromStorage } from '../../../../app/api/ada/lib/storage/models/load';
import { getWalletState, batchLoadSubmittedTransactions } from './utils';
import { getCardanoStateFetcher } from '../utils';
import { removePublicDeriver } from '../../../../app/api/ada/lib/storage/bridge/walletBuilder/remove';
import { GetToken } from '../../../../app/api/ada/lib/storage/database/primitives/api/read';
import { ModifyToken } from '../../../../app/api/ada/lib/storage/database/primitives/api/write';
import {
  getAllSchemaTables,
  raii,
} from '../../../../app/api/ada/lib/storage/database/utils';
import { upsertTxMemo, deleteTxMemo, getAllTxMemo } from '../../../../app/api/ada/lib/storage/bridge/memos';
import type { AdaGetTransactionsRequest } from '../../../../app/api/ada';
import type { BaseGetTransactionsRequest } from '../../../../app/api/common';
import { createAuthEntry } from '../../../../app/connector/api/';
import { getWalletChecksum } from '../../../../app/api/export/utils';
import { getAllTokenInfo } from '../../../../app/api/common/lib/tokens/utils';
import {
  getAllExplorers,
  getSelectedExplorer,
  saveSelectedExplorer,
} from '../../../../app/api/ada/lib/storage/bridge/explorers';
import {
  transactionHexToHash,
  transactionHexReplaceWitnessSet, 
  transactionHexToWitnessSet,
} from '../../../../app/api/ada/lib/cardanoCrypto/utils';

const YOROI_MESSAGES = Object.freeze({
  CONNECT_RESPONSE: 'connect_response',
  SIGN_CONFIRMED: 'sign_confirmed',
  SIGN_REJECTED: 'sign_rejected',
  SIGN_ERROR: 'sign_error',
  SIGN_WINDOW_RETRIEVE_DATA: 'tx_sign_window_retrieve_data',
  CONNECT_WINDOW_RETRIEVE_DATA: 'connect_retrieve_data',
  REMOVE_WALLET_FROM_WHITELIST: 'remove_wallet_from_whitelist',
  GET_CONNECTED_SITES: 'get_connected_sites',
  GET_PROTOCOL: 'get_protocol',
  GET_UTXOS_ADDRESSES: 'get_utxos/addresses',
  GET_DB: 'get-db',
  SUBSCRIBE: 'subscribe',
  CREATE_WALLET: 'create-wallet',
  CREATE_HARDWARE_WALLET: 'create-hardware-wallet',
  REMOVE_WALLET: 'remove-wallet',
  GET_WALLETS: 'get-wallets',
  CHANGE_SIGNING_PASSWORD: 'change-signing-password',
  RENAME_PUBLIC_DERIVER: 'rename-public-deriver',
  RENAME_CONCEPTUAL_WALLET: 'rename-conceptual-wallet',
  SIGN_AND_BROADCAST_TRANSACTION: 'sign-and-broadcast-transaction',
  BROADCAST_TRANSACTION: 'broadcast-transaction',
  GET_PRIVATE_STAKING_KEY: 'get-private-staking-key',
  GET_CARDANO_ASSETS: 'get-cardano-assets',
  UPSERT_TX_MEMO: 'upsert-tx-memo',
  DELETE_TX_MEMO: 'delete-tx-memo',
  GET_ALL_TX_MEMOS: 'get-all-tx-memos',
  REMOVE_ALL_TRANSACTIONS: 'remove-all-transactions',
  POP_ADDRESS: 'pop-address',
  REFRESH_TRANSACTIONS: 'refresh-transactions',
  CONNECTOR_CREATE_AUTH_ENTRY: 'connector-create-auth-entry',
  GET_ALL_EXPLORERS: 'get-all-explorers',
  GET_SELECTED_EXPLORER: 'get-selected-explorer',
  SAVE_SELECTED_EXPLORER: 'save-selected-explorer',
  SIGN_TRANSACTION: 'sign-transaction',
});

// messages from other parts of Yoroi (i.e. the UI for the connector)
export async function yoroiMessageHandler(
  request: (
    ConnectResponseData
    | ConfirmedSignData
    | FailedSignData
    | TxSignWindowRetrieveData
    | ConnectRetrieveData
    | RemoveWalletFromWhitelistData
    | GetConnectedSitesData
    | GetConnectionProtocolData
    | GetUtxosRequest
    | GetDb
    | Subscribe
    | CreateWallet
    |  CreateHardwareWallet
    | RemoveWallet
    | GetWallets
    | ChangeSigningPassword
    | RenamePublicDeriver
    | RenameConceptualWallet
    | SignAndBroadcastTransaction
    | BroadcastTransaction
    | GetPrivateStakingKey
    | GetCardanoAssets
    | UpsertTxMemo
    | DeleteTxMemo
    | GetAllTxMemos
    | RemoveAllTransactions
    | PopAddress
    | RefreshTransactions
    | ConnectorCreateAuthEntry
    | GetAllExplorers
    | GetSelectedExplorer
    | SaveSelectedExplorer
    | SignTransaction
  ),
  sender: any,
  sendResponse: Function,
) {
  /**
   * Returns HEX of a serialised witness set
   */
  async function signCardanoTx(
    tx: CardanoTx,
    password: string,
    tabId: number
  ): Promise<string> {
    return await withDb(async (db, localStorageApi) => {
      return await withSelectedWallet(
        tabId,
        async (wallet) => {
          return await connectorSignCardanoTx(
            wallet,
            password,
            tx,
          );
        },
        db,
        localStorageApi
      );
    });
  }

  if (request.type === YOROI_MESSAGES.CONNECT_RESPONSE) {
    const { tabId } = request;
    if (tabId == null) return;
    const connection = await getConnectedSite(tabId);
    if (connection?.status?.requestType != null) {
      if (request.accepted === true) {
        connectContinuation(
          connection?.status?.requestType,
          request.publicDeriverId,
          request.auth,
          tabId,
        );
        connection.status = {
          publicDeriverId: request.publicDeriverId,
          auth: request.auth,
        };
        await setConnectedSite(tabId, connection);
      } else {
        connectContinuation(
          connection?.status?.requestType,
          null,
          null,
          tabId,
        );
        await deleteConnectedSite(tabId);
      }
    }
  } else if (request.type === YOROI_MESSAGES.SIGN_CONFIRMED) {
    const connection = await getConnectedSite(request.tabId);
    if (connection == null) {
      throw new ConnectorError({
        code: APIErrorCodes.API_INTERNAL_ERROR,
        info: 'Connection has failed. Please retry.',
      });
    }
    const responseData = connection.pendingSigns[String(request.uid)];
    if (!responseData) {
      throw new ConnectorError({
        code: APIErrorCodes.API_INTERNAL_ERROR,
        info: `Sign request data is not available after confirmation (uid=${request.uid}). Please retry.`,
      });
    }
    const password = request.pw;

    const rpcResponse = (response: {| ok: any |} | {| err: any |}) => {
      sendToInjector(
        request.tabId,
        {
          type: 'connector_rpc_response',
          protocol: responseData.protocol,
          uid: request.uid,
          return: response
        }
      );
    };


    switch (responseData.request.type) {
      case 'tx/cardano':
      {
        let resp;
        try {
          let signedTxWitnessSetHex;
          if (password) {
            signedTxWitnessSetHex = await signCardanoTx(
              (request.tx: any),
              password,
              request.tabId
            );
          } else if (request.witnessSetHex) {
            signedTxWitnessSetHex = request.witnessSetHex;
          } else {
            throw new Error('missing password or witness from connector dialog');
          }
          resp = { ok: signedTxWitnessSetHex };
        } catch (error) {
          resp = { err: 'transaction signing failed' };
        }
        if (responseData.continuationData.type !== 'cardano-tx') {
          rpcResponse({ err: 'unexpected error' });
          return;
        }
        const { tx, returnTx } = responseData.continuationData;
        if (resp?.ok == null) {
          rpcResponse(resp);
        } else {
          const resultWitnessSetHex: string = resp.ok;
          if (returnTx) {
            const inputWitnessSetHex: string | null = RustModule.WasmScope(Scope => {
              try {
                const fullTx = Scope.WalletV4.FixedTransaction.from_hex(tx);
                return fullTx.witness_set().to_hex();
              } catch {
                // no input witness set
                return null;
              }
            });
            const isFullTx = inputWitnessSetHex != null;
            const finalWitnessSetHex = inputWitnessSetHex == null
                  ? resultWitnessSetHex
                  : mergeWitnessSets(inputWitnessSetHex, resultWitnessSetHex);
            RustModule.WasmScope(Scope => {
              let fullTx;
              if (isFullTx) {
                fullTx = Scope.WalletV4.FixedTransaction.from_hex(tx);
                fullTx.set_witness_set(hexToBytes(finalWitnessSetHex));
              } else {
                fullTx = Scope.WalletV4.FixedTransaction.new(
                  hexToBytes(tx),
                  hexToBytes(finalWitnessSetHex),
                  true,
                );
              }
              rpcResponse({ ok: fullTx.to_hex() });
            });
          } else {
            rpcResponse({ ok: resultWitnessSetHex });
          }
        }
      }
        break;
      case 'data':
      {
        if (responseData.continuationData.type !== 'cardano-data') {
          rpcResponse({ err: 'unexpected error' });
          return;
        }
        const { address, payload } = responseData.continuationData;
        let dataSig;
        try {
          dataSig = await withDb(async (db, localStorageApi) => {
            return await withSelectedWallet(
              request.tabId,
              async (wallet) => {
                const addressing = await getAddressing(wallet, address);
                if (!addressing) {
                  throw new Error('key derivation path does not exist');
                }
                return await connectorSignData(
                  wallet,
                  password,
                  addressing,
                  address,
                  payload,
                );
              },
              db,
              localStorageApi,
              false,
            );
          });
        } catch (error) {
          Logger.error(`error when signing data ${error}`);
          rpcResponse(
            {
              err: {
                code: DataSignErrorCodes.DATA_SIGN_PROOF_GENERATION,
                info: error.message,
              }
            }
          );
          return;
        }
        rpcResponse({ ok: dataSig });
      }
        break;
      case 'tx-reorg/cardano':
      {
        if (responseData.continuationData.type !== 'cardano-reorg-tx') {
          rpcResponse({ err: 'unexpected error' });
          return;
        }
        const { isCBOR } = responseData.continuationData;
        const utxos = await transformCardanoUtxos(
          // Only one utxo from the result of the reorg transaction is packed and returned here
          [...(request.tx: any)],
          isCBOR
        );
        rpcResponse({ ok: utxos });
      }
        break;
      default:
        // log?
        break;
    }
    delete connection.pendingSigns[String(request.uid)];
    await setConnectedSite(request.tabId, connection);
  } else if (request.type === YOROI_MESSAGES.SIGN_REJECTED) {
    const connection = await getConnectedSite(request.tabId);
    const responseData = connection?.pendingSigns[String(request.uid)];
    if (connection && responseData) {
      const code = responseData.request?.type === 'data'
        ? DataSignErrorCodes.DATA_SIGN_USER_DECLINED
        : TxSignErrorCodes.USER_DECLINED;

      sendToInjector(
        request.tabId,
        {
          type: 'connector_rpc_response',
          protocol: responseData.protocol,
          uid: request.uid,
          return: {
            err: {
              code,
              info: 'User rejected'
            },
          },
        }
      );
      delete connection.pendingSigns[String(request.uid)];
      await setConnectedSite(request.tabId, connection);
    } else {
      // eslint-disable-next-line no-console
      console.error(`couldn't find tabId: ${request.tabId}`);
    }
  } else if (request.type === YOROI_MESSAGES.SIGN_ERROR) {
    const connection = await getConnectedSite(request.tabId);
    const responseData = connection?.pendingSigns[String(request.uid)];
    if (connection && responseData) {
      const code = responseData.request?.type === 'data'
        ? DataSignErrorCodes.DATA_SIGN_PROOF_GENERATION
        : TxSignErrorCodes.PROOF_GENERATION;

      sendToInjector(
        request.tabId,
        {
          type: 'connector_rpc_response',
          protocol: responseData.protocol,
          uid: request.uid,
          return: {
            err: {
              code,
              info: `utxo error: ${request.errorType} (${request.data})`
            },
          },
        }
      );
      delete connection.pendingSigns[String(request.uid)];
      await setConnectedSite(request.tabId, connection);
    } else {
      // eslint-disable-next-line no-console
      console.error(`couldn't find tabId: ${request.tabId}`);
    }
  } else if (request.type === YOROI_MESSAGES.SIGN_WINDOW_RETRIEVE_DATA) {
    await new Promise(resolve => { setTimeout(resolve, 1); });
    const connectedSites = await getAllConnectedSites();
    for (const tabId of Object.keys(connectedSites)) {
      const connection = connectedSites[tabId];
      for (const uid of Object.keys(connection.pendingSigns)) {
        const responseData = connection.pendingSigns[uid];
        if (!responseData.openedWindow) {
          responseData.openedWindow = true;
          await setConnectedSite(Number(tabId), connection);
          if (connection.status?.publicDeriverId == null) {
            throw new Error(`${request.type} no public deriver set for request`);
          }
          sendResponse(({
            publicDeriverId: connection.status.publicDeriverId,
            sign: responseData.request,
            tabId: Number(tabId),
            requesterUrl: connection.url,
          }: SigningMessage));
          return;
        }
      }
    }
  } else if (request.type === YOROI_MESSAGES.CONNECT_WINDOW_RETRIEVE_DATA) {
    const connectedSites = await getAllConnectedSites();

    for (const tabId of Object.keys(connectedSites)) {
      const connection = connectedSites[tabId];
      if (connection.status != null) {
        if (connection.status.requestType) {
          connection.status.openedWindow = true;
          const imgBase64Url = await getFromStorage(STORAGE_KEY_IMG_BASE64);
          sendResponse(({
            url: connection.url,
            protocol: connection.protocol,
            appAuthID: connection.appAuthID,
            imgBase64Url,
            tabId: Number(tabId),
          }: ConnectingMessage));
          return;
        }
      }
    }
    sendResponse(null);
  } else if (request.type === YOROI_MESSAGES.REMOVE_WALLET_FROM_WHITELIST) {
    const connectedSites = await getAllConnectedSites();
    for (const tabId of Object.keys(connectedSites)) {
      const site = connectedSites[tabId];
      if (site.url === request.url) {
        sendToInjector(Number(tabId), { type: 'disconnect' });
        break;
      }
    }
  } else if (request.type === YOROI_MESSAGES.GET_CONNECTED_SITES) {
    const activeSites: Array<ConnectedSite> =
      (Object.values(await getAllConnectedSites()): any);

    sendResponse(({
      sites: activeSites.map(site => site.url),
    }: ConnectedSites));
  } else if (request.type === YOROI_MESSAGES.GET_PROTOCOL) {
    const connectionProtocol = await getFromStorage(STORAGE_KEY_CONNECTION_PROTOCOL) ||
      'cardano';
    sendResponse({ type: connectionProtocol })
  } else if (request.type === YOROI_MESSAGES.GET_UTXOS_ADDRESSES) {
    try {
      await withDb(async (db, localStorageApi) => {
        await withSelectedWallet(
          request.tabId,
          async (wallet, connection) => {
            if (connection == null) {
              Logger.error(`ERR - sign_tx could not find connection with tabId = ${request.tabId}`);
              sendResponse({ utxos: null })
              return
            }
            const withUtxos = asGetAllUtxos(wallet)

            if (withUtxos == null) {
              throw new Error(`missing utxo functionality`);
            }
            const withHasUtxoChains = asHasUtxoChains(withUtxos);
            if (withHasUtxoChains == null) {
              throw new Error(`missing chains functionality`);
            }

            const addressesMap = {
              usedAddresses: async () => await connectorGetUsedAddressesWithPaginate(wallet, null),
              unusedAddresses: async () => await connectorGetUnusedAddresses(wallet),
              changeAddress: async () => await connectorGetChangeAddress(wallet),
              utxos: async () =>  await withHasUtxoChains.getAllUtxos(),
            }

            const response = {}

            for(const key of request.select) {
              response[key] = await addressesMap[key]()
            }

            sendResponse(response)
          },
          db,
          localStorageApi,
        )
      });
    } catch (error) {
      Logger.error(`Get utxos faild for tabId = ${request.tabId}`);
    }
  } else if (request.type === YOROI_MESSAGES.GET_DB) {
    const db = await getDb();
    const data = await db.export();
    sendResponse(JSON.stringify(data));
  } else if (request.type === YOROI_MESSAGES.SUBSCRIBE) {
    subscribe(sender.tab.id, request.request.activeWalletId);
    sendResponse({ error: null });
  } else if (request.type === YOROI_MESSAGES.CREATE_WALLET) {
    await RustModule.load();
    try {
      const db = await getDb();
      const network = getNetworkById(request.request.networkId);

      const adaApi = new AdaApi();
      const { publicDerivers } = await adaApi.createWallet({
        db,
        network,
        recoveryPhrase: request.request.recoveryPhrase,
        walletName: request.request.walletName,
        walletPassword: request.request.walletPassword,
        accountIndex: request.request.accountIndex,
      });
      const publicDeriverId = publicDerivers[0].getPublicDeriverId();
      sendResponse({ publicDeriverId });
      emitUpdateToSubscriptions({
        type: 'wallet-state-update',
        params: {
          eventType: 'new',
          publicDeriverId,
        }
      });
      syncWallet(publicDerivers[0], 'new wallet', 1);
    } catch(error) {
      sendResponse({ error: error.message });
      return;
    }
    sendResponse({ error: null });
  } else if (request.type === YOROI_MESSAGES.CREATE_HARDWARE_WALLET) {
    try {
      const db = await getDb();

      const stateFetcher = await getCardanoStateFetcher(new LocalStorageApi());

      const adaApi = new AdaApi();
      const { publicDeriver } = await adaApi.createHardwareWallet({
        db,
        network: request.request.network,
        walletName: request.request.walletName,
        publicKey: request.request.publicKey,
        hwFeatures: request.request.hwFeatures,
        checkAddressesInUse: stateFetcher.checkAddressesInUse,
        addressing: request.request.addressing,
      });
      const publicDeriverId = publicDeriver.getPublicDeriverId();
      sendResponse({ publicDeriverId });
      emitUpdateToSubscriptions({
        type: 'wallet-state-update',
        params: {
          eventType: 'new',
          publicDeriverId,
        }
      });
      syncWallet(publicDeriver, 'new wallet', 1);
    } catch(error) {
      sendResponse({ error: error.message });
      return;
    }
    sendResponse({ error: null });
  } else if (request.type === YOROI_MESSAGES.REMOVE_WALLET) {
    const publicDeriver = await getPublicDeriverById(request.request.publicDeriverId);
    if (publicDeriver) {
      await removePublicDeriver({
        publicDeriver,
        conceptualWallet: publicDeriver.getParent(),
      });
      emitUpdateToSubscriptions({
        type: 'wallet-state-update',
        params: {
          eventType: 'remove',
          publicDeriverId: request.request.publicDeriverId,
        }
      });
    }
    sendResponse(null);
  } else if (request.type === YOROI_MESSAGES.GET_WALLETS) {
    const db = await getDb();
    let publicDerivers = await loadWalletsFromStorage(db);
    if (request.request.walletId) {
      const publicDeriver = publicDerivers.find(publicDeriver =>
        publicDeriver.getPublicDeriverId() === request.request.walletId
      );
      if (publicDeriver) {
        publicDerivers = [publicDeriver];
      } else {
        publicDerivers = [];
      }
    }
    const walletStates = await Promise.all(publicDerivers.map(getWalletState));
    await batchLoadSubmittedTransactions(walletStates);
    sendResponse(walletStates);
  } else if (request.type === YOROI_MESSAGES.CHANGE_SIGNING_PASSWORD) {
    const publicDeriver = await getPublicDeriverById(request.request.publicDeriverId);
    if (publicDeriver) {
      const withSigningKey = asGetSigningKey(publicDeriver);
      if (withSigningKey == null) {
        throw new Error('unexpected missing asGetSigningKey result');
      }
      const newUpdateDate = new Date(Date.now());
      await withSigningKey.changeSigningKeyPassword({
        currentTime: newUpdateDate,
        oldPassword: request.request.oldPassword,
        newPassword: request.request.newPassword,
      });
      sendResponse(null);
    }
  } else if (request.type === YOROI_MESSAGES.RENAME_PUBLIC_DERIVER) {
    const publicDeriver = await getPublicDeriverById(request.request.publicDeriverId);
    if (publicDeriver) {
      await publicDeriver.rename({ newName: request.request.newName });
    }
    sendResponse(null);
  } else if (request.type === YOROI_MESSAGES.RENAME_CONCEPTUAL_WALLET) {
    const db = await getDb();
    for (let publicDeriver of await loadWalletsFromStorage(db)) {
      if (publicDeriver.getParent().getConceptualWalletId() === request.request.conceptualWalletId) {
        await publicDeriver.getParent().rename({ newName: request.request.newName });
      }
    }
    sendResponse(null);
  } else if (request.type === YOROI_MESSAGES.SIGN_AND_BROADCAST_TRANSACTION) {
    const publicDeriver = await getPublicDeriverById(request.request.publicDeriverId);
    if (!publicDeriver) {
      sendResponse({ error: 'no public deriver' });
      return;
    }
    const { senderUtxos, unsignedTx, metadata, wits, neededHashes, txHash } = request.request;

    try {
      const withSigning = asGetSigningKey(publicDeriver);
      if (withSigning == null) {
        throw new Error('unexpected missing asGetSigningKey result');
      }

      if (neededHashes.length - wits.length >= 2) {
        throw new Error('Too many missing witnesses');
      }
      if (neededHashes.length !== wits.length) {
        const withStakingKey = asGetAllAccounting(withSigning);
        if (withStakingKey == null) {
          throw new Error('unexpected missing asGetAllAcccounting result');
        }
        const stakingKey = await genOwnStakingKey({
          publicDeriver: withStakingKey,
          password: request.request.password,
        });
        if (neededHashes.includes(
          Buffer.from(
            RustModule.WalletV4.Credential.from_keyhash(
              stakingKey.to_public().hash()
            ).to_bytes()
          ).toString('hex')
        )) {
          wits.push(
            Buffer.from(RustModule.WalletV4.make_vkey_witness(
              RustModule.WalletV4.TransactionHash.from_hex(txHash),
              stakingKey
            ).to_bytes()).toString('hex')
          );
        } else {
          throw new Error('missing witness but it was not ours');
        }
      }

      const signRequest = {
        senderUtxos,
        unsignedTx: Buffer.from(unsignedTx, 'hex'),
        metadata: metadata ? RustModule.WalletV4.AuxiliaryData.from_hex(metadata) : undefined,
        neededStakingKeyHashes: {
          wits: new Set(wits),
        },
      };
      const stateFetcher = await getCardanoStateFetcher(new LocalStorageApi());
      const adaApi = new AdaApi();
      const { txId, signedTxHex, } = await adaApi.signAndBroadcast({
        publicDeriver: withSigning,
        password: request.request.password,
        signRequest,
        sendTx: stateFetcher.sendTx,
      });
      // fixme: notify submitted tx change
      try {
        await RustModule.WasmScope(Scope => connectorRecordSubmittedCardanoTransaction(
          publicDeriver,
          Scope.WalletV4.Transaction.from_hex(signedTxHex)
        ));
      } catch (_error) {
        // ignore
      }
      sendResponse({ txId });
    } catch (error) {
      sendResponse({ error: error.message });
    }
  } else if (request.type === YOROI_MESSAGES.GET_PRIVATE_STAKING_KEY) {
    const publicDeriver = await getPublicDeriverById(request.request.publicDeriverId);
    if (!publicDeriver) {
      sendResponse({ error: 'no public deriver' });
      return;
    }
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
        password: request.request.password,
      });
      sendResponse(stakingKey.to_hex());
    } catch (error) {
      // fixme
      sendResponse({ error: 'wrong password' });
    }
  } else if (request.type === YOROI_MESSAGES.GET_CARDANO_ASSETS) {
    // fixme: cache
    const db = await getDb();
    const params = request.request;
    if (params) {
      const network = getNetworkById(params.networkId);
      const deps =  Object.freeze({
        ModifyToken,
        GetToken,
      });
      const depTables = Object
            .keys(deps)
            .map(key => deps[key])
            .flatMap(table => getAllSchemaTables(db, table));

      const stateFetcher = await getCardanoStateFetcher(new LocalStorageApi());

      const assetMap = await raii(
        db,
        depTables,
        dbTx => (
          genCardanoAssetMap(
            db,
            dbTx,
            deps,
            params.tokenIds,
            stateFetcher.getTokenInfo,
            stateFetcher.getMultiAssetMintMetadata,
            stateFetcher.getMultiAssetSupply,
            network,
          )
        )
      );
      sendResponse([... assetMap.values()]);
    } else {
      const tokens = await getAllTokenInfo({ db });
      sendResponse(tokens);
    }
  } else if (request.type === YOROI_MESSAGES.UPSERT_TX_MEMO) {
    const db = await getDb();
    const response = await upsertTxMemo({ db, memo: request.request.memo });
    sendResponse(response);
  } else if (request.type === YOROI_MESSAGES.DELETE_TX_MEMO) {
    const db = await getDb();
    await deleteTxMemo({ db, key: request.request.key });
    sendResponse(null);
  } else if (request.type === YOROI_MESSAGES.GET_ALL_TX_MEMOS) {
    const db = await getDb();
    const memos = await getAllTxMemo({ db });
    sendResponse(memos);
  } else if (request.type === YOROI_MESSAGES.REMOVE_ALL_TRANSACTIONS) {
    const publicDeriver: ?PublicDeriver<> = await getPublicDeriverById(request.request.publicDeriverId);
    if (!publicDeriver) {
      sendResponse({ error: 'no public dervier'});
      return;
    }
    const withLevels = asHasLevels(publicDeriver);
    if (!withLevels) {
      throw new Error('unexpected missing asHasLevels result');
    }
    await removeAllTransactions({ publicDeriver: withLevels });

    for (let i = 0; i < this._submittedTransactions.length; ) {
      if (this._submittedTransactions[i].publicDeriverId === publicDeriver.publicDeriverId) {
        this._submittedTransactions.splice(i, 1);
      } else {
        i++;
      }
    }

    const txs = await loadSubmittedTransactions();
    if (!txs) {
      return;
    }
    const filteredTxs = txs.filter(
      ({ publicDeriverId }) => publicDeriverId !== request.request.publicDeriverId
    );
    await persistSubmittedTransactions(filteredTxs);
    sendResponse(null);
  } else if (request.type === YOROI_MESSAGES.POP_ADDRESS) {
    const publicDeriver = await getPublicDeriverById(request.request.publicDeriverId);
    if (!publicDeriver) {
      sendResponse({ error: 'no public dervier'});
      return;
    }
    const withDisplayCutoff = asDisplayCutoff(publicDeriver);
    if (withDisplayCutoff == null) {
      throw new Error('unexpected missing asDisplayCutoff result');
    }
    await withDisplayCutoff.popAddress();
    sendResponse(null);
  } else if (request.type === YOROI_MESSAGES.REFRESH_TRANSACTIONS) {
    const publicDeriver: ?PublicDeriver<> = await getPublicDeriverById(request.request.publicDeriverId);
    if (!publicDeriver) {
      sendResponse({ error: 'no public dervier'});
      return;
    }
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
      isLocalRequest: request.request.isLocalRequest,
      getRecentTransactionHashes: stateFetcher.getRecentTransactionHashes,
      getTransactionsByHashes: stateFetcher.getTransactionsByHashes,
      checkAddressesInUse: stateFetcher.checkAddressesInUse,
      getBestBlock: stateFetcher.getBestBlock,
      getTokenInfo: stateFetcher.getTokenInfo,
      getMultiAssetMetadata: stateFetcher.getMultiAssetMintMetadata,
      getMultiAssetSupply: stateFetcher.getMultiAssetSupply,
      getTransactionHistory: stateFetcher.getTransactionsHistoryForAddresses,
    };
    if (request.request.skip) {
      refreshTxRequest.skip = request.request.skip;
    }
    if (request.request.limit) {
      refreshTxRequest.limit = request.request.limit;
    }
    if (request.request.beforeTx) {
      refreshTxRequest.beforeTx = request.request.beforeTx;
    }
    if (request.request.afterTx) {
      refreshTxRequest.afterTx = request.request.afterTx;
    }
    const txs = await adaApi.refreshTransactions(refreshTxRequest);
    sendResponse(txs);
  } else if (request.type === YOROI_MESSAGES.BROADCAST_TRANSACTION) {
    const publicDeriver: ?PublicDeriver<> = await getPublicDeriverById(request.request.publicDeriverId);
    if (!publicDeriver) {
      sendResponse({ error: 'no public dervier'});
      return;
    }
    let txs;
    let addressedUtxoArray;
    if (request.request.signedTxHexArray) {
      txs = request.request.signedTxHexArray.map(txHex => ({
        id: transactionHexToHash(txHex),
        encodedTx: hexToBytes(txHex),
      }));
      addressedUtxoArray = [];
    } else {
      const { signedTxHex, addressedUtxos } = request.request;
      if (typeof signedTxHex !== 'string') {
        throw new Error('unexpected missing `signedTxHex` in request');
      }
      txs = [{ id: transactionHexToHash(signedTxHex), encodedTx: hexToBytes(signedTxHex) }];
      addressedUtxoArray = [addressedUtxos];
    }

    const stateFetcher = await getCardanoStateFetcher(new LocalStorageApi());
    try {
      await stateFetcher.sendTx({
        network: publicDeriver.getParent().getNetworkInfo(),
        txs,
      });
      try {
        for (let i = 0; i < txs.length; i++) {
          await RustModule.WasmScope(Scope => connectorRecordSubmittedCardanoTransaction(
            publicDeriver,
            Scope.WalletV4.Transaction.from_bytes(txs[i].encodedTx),
            addressedUtxoArray[i]
          ));
        }
      } catch (_error) {
        // ignore
      }
      sendResponse(null);
    } catch (error) {
      sendResponse({ error: error.message });
    }
  } else if (request.type === YOROI_MESSAGES.CONNECTOR_CREATE_AUTH_ENTRY) {
    const publicDeriver: ?PublicDeriver<> = await getPublicDeriverById(request.request.publicDeriverId);
    if (!publicDeriver) {
      sendResponse({ error: 'no public dervier'});
      return;
    }
    const withPubKey = asGetPublicKey(publicDeriver);
    if (withPubKey == null) {
      throw new Error('unexpected missing asGetPublicKey result');
    }
    const publicKey = await withPubKey.getPublicKey();
    const checksum = await getWalletChecksum(withPubKey);
    try {
      const result = await createAuthEntry({
        appAuthID: request.request.appAuthID,
        deriver: publicDeriver,
        checksum,
        password: request.request.password
      });
      sendResponse(result);
    } catch (error) {
      // fixme: handle wrong password
      sendResponse({ error: error.message });
    }
  } else if (request.type === YOROI_MESSAGES.GET_ALL_EXPLORERS) {
    const db = await getDb();
    const result = await getAllExplorers({ db });
    sendResponse([...result.entries()]);
  } else if (request.type === YOROI_MESSAGES.GET_SELECTED_EXPLORER) {
    const db = await getDb();
    const result = await getSelectedExplorer({ db });
    sendResponse([...result.entries()]);
  } else if (request.type === YOROI_MESSAGES.SAVE_SELECTED_EXPLORER) {
    const db = await getDb();
    const result = await saveSelectedExplorer({ db, explorer: request.request.explorer });
    sendResponse(result);
  } else if (request.type === YOROI_MESSAGES.SIGN_TRANSACTION) {
    const { publicDeriverId, password, transactionHex } = request.request;
    const publicDeriver: ?PublicDeriver<> = await getPublicDeriverById(publicDeriverId);
    if (!publicDeriver) {
      sendResponse({ error: 'no public dervier'});
      return;
    }
    const signedWitnessSetHex = await connectorSignCardanoTx(
      publicDeriver,
      password,
      {
        tx: transactionHex,
        tabId: -1,
        partialSign: false
      },
    );

    const mergedWitnessSetHex = mergeWitnessSets(
      transactionHexToWitnessSet(transactionHex),
      signedWitnessSetHex,
    );
    sendResponse(transactionHexReplaceWitnessSet(transactionHex, mergedWitnessSetHex));
  } else {
    console.error(`unknown message ${JSON.stringify(request)} from ${sender.tab.id}`)
  }
}

export function isYoroiMessage({ type }: {| type: string |}): boolean {
  return Object.values(YOROI_MESSAGES).includes(type);
}

async function getPublicDeriverById(publicDeriverId: number): Promise<?PublicDeriver<>> {
  const db = await getDb();
  for (let publicDeriver of await loadWalletsFromStorage(db)) {
    if (publicDeriver.getPublicDeriverId() === publicDeriverId) {
      return publicDeriver;
    }
  }
  // todo: refactor to throw an exception
  return null;
}
