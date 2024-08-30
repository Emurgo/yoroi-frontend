// @flow
import debounce from 'lodash/debounce';
import { getWallets } from '../../app/api/common/index';
import { PublicDeriver, } from '../../app/api/ada/lib/storage/models/PublicDeriver/index';
import { asGetAllUtxos, asHasUtxoChains } from '../../app/api/ada/lib/storage/models/PublicDeriver/traits';
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
  PendingSignData,
  RemoveWalletFromWhitelistData,
  SigningMessage,
  TxSignWindowRetrieveData,
  WalletAuthEntry,
  WhitelistEntry,
} from './connector/types';
import {
  APIErrorCodes,
  asPaginate,
  asTokenId,
  asValue,
  ConnectorError,
  DataSignErrorCodes,
  TxSignErrorCodes,
} from './connector/types';
import {
  connectorCreateCardanoTx,
  connectorGenerateReorgTx,
  connectorGetAssets,
  connectorGetBalance,
  connectorGetCardanoRewardAddresses,
  connectorGetChangeAddress,
  connectorGetCollateralUtxos,
  connectorGetDRepKey,
  connectorGetStakeKey,
  connectorGetUnusedAddresses,
  connectorGetUsedAddressesWithPaginate,
  connectorGetUtxosCardano,
  connectorRecordSubmittedCardanoTransaction,
  connectorSendTxCardano,
  connectorSignCardanoTx,
  connectorSignData,
  getAddressing,
  getTokenMetadataFromIds,
  MAX_COLLATERAL,
} from './connector/api';
import { updateUtxos } from '../../app/api/ada/lib/storage/bridge/updateTransactions';
import { environment } from '../../app/environment';
import type { IFetcher as CardanoIFetcher } from '../../app/api/ada/lib/state-fetch/IFetcher.types';
import { RemoteFetcher as CardanoRemoteFetcher } from '../../app/api/ada/lib/state-fetch/remoteFetcher';
import { BatchedFetcher as CardanoBatchedFetcher } from '../../app/api/ada/lib/state-fetch/batchedFetcher';
import LocalStorageApi, { loadSubmittedTransactions, } from '../../app/api/localStorage/index';
import { RustModule } from '../../app/api/ada/lib/cardanoCrypto/rustLoader';
import { Logger, stringifyError } from '../../app/utils/logging';
import type { lf$Database, } from 'lovefield';
import { schema } from 'lovefield';
import { copyDbToMemory, loadLovefieldDB, } from '../../app/api/ada/lib/storage/database/index';
import { migrateNoRefresh } from '../../app/api/common/migration';
import { Mutex, } from 'async-mutex';
import {
  getCardanoHaskellBaseConfig,
  isCardanoHaskell
} from '../../app/api/ada/lib/storage/database/prepackaged/networks';
import { authSignHexPayload } from '../../app/connector/api';
import type { RemoteUnspentOutput } from '../../app/api/ada/lib/state-fetch/types';
import { NotEnoughMoneyToSendError, } from '../../app/api/common/errors';
import {
  asAddressedUtxo as asAddressedUtxoCardano,
  assetToRustMultiasset,
  cardanoUtxoHexFromRemoteFormat,
  mergeWitnessSets,
} from '../../app/api/ada/transactions/utils';
import type { ForeignUtxoFetcher } from '../../app/connector/stores/ConnectorStore';
import ConnectorStore from '../../app/connector/stores/ConnectorStore';
import { find721metadata } from '../../app/utils/nftMetadata';
import { hexToBytes } from '../../app/coreUtils';
import { addressHexToBech32 } from '../../app/api/ada/lib/cardanoCrypto/utils';

/*::
declare var chrome;
*/

const onYoroiIconClicked = () => {
  chrome.tabs.create({ url: 'main_window.html' });
};

if (chrome.action) {
  // manifest v3
  chrome.action.onClicked.addListener(debounce(onYoroiIconClicked, 500, { leading: true }));
} else {
  // manifest v2
  chrome.browserAction.onClicked.addListener(debounce(onYoroiIconClicked, 500, { leading: true }));
}

const STORAGE_KEY_PREFIX = 'background-';

const STORAGE_API = chrome.storage.session // chrome mv3
  || window.browser?.storage.local // firefox mv2
  || chrome.storage.local; // chrome mv2

async function setInStorage(key: string, value: any): Promise<void> {
  await STORAGE_API.set({ [STORAGE_KEY_PREFIX + key]: value });
}

async function getFromStorage(key: string): Promise<any> {
  const storageKey = STORAGE_KEY_PREFIX + key;
  return new Promise(resolve => {
    // the chrome mv3 and firefox mv2 API also support returning the result as a promise
    // but the chrome v2 API only support callback, so we use the universally supported interface
    STORAGE_API.get(storageKey, result => {
      if (result === undefined) {
        resolve(undefined);
      } else {
        resolve(result[storageKey]);
      }
    });
  });
}

function sendToInjector(tabId: number, message: any) {
  chrome.tabs.sendMessage(tabId, message);
}

/**
 * we store the ID instead of an index
 * because the user could delete a wallet (causing indices to shift)
 * whereas ID lets us detect if the entry in the DB still exists
 */
type PublicDeriverId = number;

type ConnectRequestType = 'cardano-connect-request';

// PublicDeriverId = successfully connected - which public deriver the user selected
// null = refused by user
type ConnectedStatus = null | {|
  publicDeriverId: PublicDeriverId,
  auth: ?WalletAuthEntry,
|} | {|
  requestType: ConnectRequestType,
  // if a window has fetched this to show to the user yet
  openedWindow: boolean,
  publicDeriverId: null,
  auth: null,
|};

type SignContinuationDataType = {|
  type: 'cardano-tx',
  returnTx: boolean,
  tx: string,
|} | {|
  type: 'cardano-tx-input',
|} | {|
  type: 'cardano-data',
  address: string,
  payload: string,
|} | {|
  type: 'cardano-reorg-tx',
  isCBOR: boolean,
  utxosToUse: Array<RemoteUnspentOutput>,
|};

type PendingSign = {|
  // data needed to complete the request
  request: PendingSignData,
  // if an opened window has been created for this request to show the user
  openedWindow: boolean,
  continuationData: SignContinuationDataType,
  protocol: string,
  uid: string,
|}

type ConnectedSite = {|
  url: string,
  // <TODO:PENDING_REMOVAL> Legacy
  protocol: 'cardano',
  appAuthID?: string,
  status: ConnectedStatus,
  pendingSigns: {| [uid: string]: PendingSign |},
|};

const STORAGE_KEY_CONNECTION_PROTOCOL = 'connectionProtocol';
const STORAGE_KEY_IMG_BASE64 = 'imgBase64Url';
const STORAGE_KEY_CONNECTED_SITES = 'connectedSites';

async function getAllConnectedSites(): Promise<{| [tabId: string]: ConnectedSite |}> {
  return (await getFromStorage(STORAGE_KEY_CONNECTED_SITES)) || {};
}

async function getConnectedSite(tabId: number): Promise<?ConnectedSite> {
  const connectedSites = await getFromStorage(STORAGE_KEY_CONNECTED_SITES);
  if (!connectedSites) {
    return null;
  }
  return connectedSites[String(tabId)];
}

async function deleteConnectedSite(tabId: number): Promise<void> {
  const connectedSites = await getFromStorage(STORAGE_KEY_CONNECTED_SITES) || {};
  delete connectedSites[String(tabId)];
  await setInStorage(STORAGE_KEY_CONNECTED_SITES, connectedSites);
}

async function setConnectedSite(tabId: number, connectedSite: ConnectedSite): Promise<void> {
  const connectedSites = await getFromStorage(STORAGE_KEY_CONNECTED_SITES) || {};
  connectedSites[String(tabId)] = connectedSite;
  await setInStorage(STORAGE_KEY_CONNECTED_SITES, connectedSites);
}

async function getDefaultBounds(
): Promise<{| width: number, positionX: number, positionY: number |}> {
  let width;
  if (window.screen != null) { // mv2
    width = window.screen.availWidth;
  } else { // mv3
    const displayUnitInfoArr = await chrome.system.display.getInfo();
    width = displayUnitInfoArr[0].bounds.width;
  }

  return {
    width,
    positionX: 0,
    positionY: 0,
  };
}

async function getBoundsForWindow(
  targetWindow
): Promise<{| width: number, positionX: number, positionY: number |}> {
  const defaults = await getDefaultBounds();

  const bounds = {
      width: targetWindow.width ?? defaults.width,
      positionX: targetWindow.left ?? defaults.positionX,
      positionY: targetWindow.top ?? defaults.positionY,
  };

  return bounds;
}
function getBoundsForTabWindow(
  targetTabId
): Promise<{| width: number, positionX: number, positionY: number |}> {
  return new Promise(resolve => {
    chrome.tabs.get(targetTabId, (tab) => {
      if (tab == null) return resolve(getDefaultBounds());
      chrome.windows.get(tab.windowId, (targetWindow) => {
        if (targetWindow == null) return resolve(getDefaultBounds());
        resolve(getBoundsForWindow(targetWindow));
      });
    });
  });
}

const popupProps: {|width: number, height: number, focused: boolean, type: string|} = {
  width: 500,
  height: 700,
  focused: true,
  type: 'popup',
};

/**
* need to make sure JS tasks run in an order where no two of them have different DB instances
* Otherwise, caching logic may make things go wrong
* TODO: this doesn't help if the Yoroi Extension or a Web Worker makes a query during this execution
*/
const dbAccessMutex = new Mutex();

/**
 * Performs wallet version migration if needed
 * Then calls the continuation with storage objects
 * Note: the DB returns is an IN-MEMORY COPY of the real DB
 * This is to avoid DB modifications corrupting the state of the Yoroi Extension
 * If the Yoroi Extension is running at the same time
 */
async function withDb<T>(
  continuation: (lf$Database, LocalStorageApi) => Promise<T>
): Promise<T> {
  return await dbAccessMutex.runExclusive(async () => {
    // note: lovefield internally caches queries an optimization
    // this doesn't work for us because the DB can change under our feet through the Yoroi Extension
    // so instead, we create the DB, use it, then close the connection
    const db = await loadLovefieldDB(schema.DataStoreType.INDEXED_DB);
    let inMemoryDb: void | lf$Database = undefined;
    try {
      // process migration here before anything involving storage is cached
      // as dApp can't easily recover from refreshing a page to wipe cache after storage migration
      const localStorageApi = new LocalStorageApi();
      // note: it's safe that this call modifies the DB that is shared with the main extension
      // since if a migration actually needs to be processed,
      // it means the extension hasn't been launched since the Yoroi version updated
      // which means it's not running at the same time as the connector
      await migrateNoRefresh({
        localStorageApi,
        persistentDb: db,
        currVersion: environment.getVersion(),
      })

      // note: we can't close the persistent DB connection here after copying it
      // since lovefield closes some shared workers causing the in-memory connection to fail as well
      inMemoryDb = await copyDbToMemory(db);

      return await continuation(inMemoryDb, localStorageApi);
    } catch (e) {
      Logger.error(`DB continuation call failed due to internal error: ${e}\n${e.stack}`);
      throw e;
    } finally {
      inMemoryDb?.close();
      db.close();
    }
  });
}

async function createFetcher(
  fetcherType: Function,
  localStorageApi: LocalStorageApi,
): * {
  const locale = await localStorageApi.getUserLocale() ?? 'en-US';
  return new fetcherType(
    () => environment.getVersion(),
    () => locale,
    () => {
      if (environment.userAgentInfo.isFirefox()) {
        return 'firefox';
      }
      if (environment.userAgentInfo.isChrome()) {
        return 'chrome';
      }
      return '-';
    },
  )
}

async function getCardanoStateFetcher(
  localStorageApi: LocalStorageApi,
): Promise<CardanoIFetcher> {
  return new CardanoBatchedFetcher(await createFetcher(CardanoRemoteFetcher, localStorageApi));
}

// This is a temporary workaround to DB duplicate key constraint violations
// that is happening when multiple DBs are loaded at the same time, or possibly
// this one being loaded while Yoroi's main App is doing DB operations.
// Promise<void>
let syncing: ?boolean = null;
async function syncWallet(
  wallet: PublicDeriver<>,
  localStorageApi: LocalStorageApi,
): Promise<void> {
  const isCardano = isCardanoHaskell(wallet.getParent().getNetworkInfo());
  try {
    const lastSync = await wallet.getLastSyncInfo();
    // don't sync more than every 30 seconds
    const now = Date.now();
    if (lastSync.Time == null || now - lastSync.Time.getTime() > 30*1000) {
      if (syncing == null) {
        syncing = true;
        await RustModule.load();
        Logger.debug('sync started');
        if (isCardano) {
          const stateFetcher: CardanoIFetcher =
            await getCardanoStateFetcher(localStorageApi);
          await updateUtxos(
            wallet.getDb(),
            wallet,
            stateFetcher.checkAddressesInUse,
            stateFetcher.getTokenInfo,
            stateFetcher.getMultiAssetMintMetadata,
            stateFetcher.getMultiAssetSupply,
          )
        } else {
          throw new Error('non-cardano wallet. Should not happen');
        }
        Logger.debug('sync ended');
      }
    }
  } catch (e) {
    Logger.error(`Syncing failed: ${e}`);
  } finally {
    syncing = null;
  }
}

async function withSelectedSiteConnection<T>(
  tabId: number,
  continuation: ?ConnectedSite => Promise<T>,
): Promise<T> {
  const connected = await getConnectedSite(tabId);
  if (connected) {
    if (typeof connected.status?.publicDeriverId === 'number') {
      return await continuation(Object.freeze(connected));
    }
    return Promise.reject(new Error('site not connected yet'));
  }
  return Promise.reject(new Error(`could not find tabId ${tabId} in connected sites`));
}

async function withSelectedWallet<T>(
  tabId: number,
  continuation: (PublicDeriver<>, ?ConnectedSite) => Promise<T>,
  db: lf$Database,
  localStorageApi: LocalStorageApi,
  shouldSyncWallet: boolean = true,
): Promise<T> {
  const wallets = await getWallets({ db });
  return await withSelectedSiteConnection(tabId, async connected => {
    const { publicDeriverId } = connected?.status ?? {};
    const selectedWallet = wallets.find(
      cache => cache.getPublicDeriverId() === publicDeriverId
    );
    if (selectedWallet == null) {
      await deleteConnectedSite(tabId);
      // $FlowFixMe[incompatible-call]
      await removeWallet(tabId, publicDeriverId, localStorageApi);
      return Promise.reject(new Error(`Public deriver index not found: ${String(publicDeriverId)}`));
    }
    if (shouldSyncWallet) {
      await syncWallet(selectedWallet, localStorageApi);
    }

    // we need to make sure this runs within the withDb call
    // since the publicDeriver contains a DB reference inside it
    return await continuation(selectedWallet, connected);
  });
}

function connectContinuation(
  connectType: ConnectRequestType,
  connectedWallet: ?PublicDeriverId,
  auth: ?WalletAuthEntry,
  tabId: number,
) {
  if (connectType === 'cardano-connect-request') {
    sendToInjector(
      tabId,
      {
        type: 'yoroi_connect_response/cardano',
        success: connectedWallet != null,
        auth,
      }
    );

  }
}

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
});

const isYoroiMessage = ({ type }) => Object.values(YOROI_MESSAGES).includes(type);

// messages from other parts of Yoroi (i.e. the UI for the connector)
const yoroiMessageHandler = async (
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
  ),
  sender,
  sendResponse
) => {
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
  }
};

chrome.runtime.onMessage.addListener(
  (message, sender, sendResponse) => {
    if (handleExchangeRedirectMessage(message, sender)) {
      return;
    }
    if (isYoroiMessage(message)) {
      // Returning `true` is required by Firefox, see:
      // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/onMessage
      yoroiMessageHandler(message, sender, sendResponse);
      return true;
    }
    return handleInjectorMessage(message, sender);
  }
);

async function removeWallet(
  tabId: number,
  publicDeriverId: number,
  localStorageApi: LocalStorageApi,
): Promise<void> {
  await deleteConnectedSite(tabId);

  const whitelist = await localStorageApi.getWhitelist();
  await localStorageApi.setWhitelist(
    whitelist == null
      ? undefined
      : whitelist.filter(entry => entry.publicDeriverId !== publicDeriverId)
  );
}

async function confirmSign(
  tabId: number,
  request: PendingSignData,
  connectedSite: ConnectedSite,
  continuationData: SignContinuationDataType,
  protocol: string,
  uid: string,
): Promise<void> {
  const bounds = await getBoundsForTabWindow(tabId);

  connectedSite.pendingSigns[String(request.uid)] = {
    request,
    openedWindow: false,
    continuationData,
    protocol,
    uid,
  };
  await setConnectedSite(tabId, connectedSite);
  chrome.windows.create({
    ...popupProps,
    url: chrome.runtime.getURL(`/main_window_connector.html#/signin-transaction`),
    left: (bounds.width + bounds.positionX) - popupProps.width,
    top: bounds.positionY + 80,
  });
}

async function findWhitelistedConnection(
  url: string,
  requestIdentification?: boolean,
  // <TODO:PENDING_REMOVAL> Legacy
  protocol: 'cardano',
  localStorageApi: LocalStorageApi,
): Promise<?WhitelistEntry> {
  const isAuthRequested = Boolean(requestIdentification);
  const appAuthID = isAuthRequested ? url : undefined;
  const whitelist = await localStorageApi.getWhitelist() ?? [];
  return whitelist.find((entry: WhitelistEntry) => {
    // Whitelist is only matching if same auth or auth is not requested
    const matchingUrl = entry.url === url;
    const matchingProtocol = entry.protocol === protocol;
    const matchingAuthId = entry.appAuthID === appAuthID;
    const isAuthWhitelisted = entry.appAuthID != null;
    const isAuthPermitted = isAuthWhitelisted && matchingAuthId;
    return matchingUrl && matchingProtocol && (!isAuthRequested || isAuthPermitted);
  });
}

async function confirmConnect(
  requestType: ConnectRequestType,
  tabId: number,
  connectParameters: {|
    url: string,
    requestIdentification?: boolean,
    onlySilent?: boolean,
    // <TODO:PENDING_REMOVAL> Protocol
    protocol: 'cardano',
  |},
  localStorageApi: LocalStorageApi,
): Promise<void> {
  // <TODO:PENDING_REMOVAL> Protocol
  const { url, requestIdentification, onlySilent, protocol } = connectParameters;
  const isAuthRequested = Boolean(requestIdentification);
  const appAuthID = isAuthRequested ? url : undefined;
  const [bounds, whitelistEntry] = await Promise.all([
    getBoundsForTabWindow(tabId),
    findWhitelistedConnection(url, requestIdentification, protocol, localStorageApi),
  ])

  if (whitelistEntry != null) {
    // we already whitelisted this website, so no need to re-ask the user to confirm
    if (await getConnectedSite(tabId) == null) {
      await setConnectedSite(tabId, {
        url,
        protocol,
        appAuthID,
        status: {
          publicDeriverId: whitelistEntry.publicDeriverId,
          auth: isAuthRequested ? whitelistEntry.auth : undefined,
        },
        pendingSigns: {},
      });
    }
    connectContinuation(
      requestType,
      whitelistEntry.publicDeriverId,
      isAuthRequested ? whitelistEntry.auth : undefined,
      tabId,
    );
    return;
  }
  if (Boolean(onlySilent) === true) {
    throw new Error('[onlySilent:fail] No active connection');
  }
  // website not on whitelist, so need to ask user to confirm connection
  await setConnectedSite(tabId, {
    url,
    protocol,
    appAuthID,
    status: {
      requestType,
      openedWindow: false,
      publicDeriverId: null,
      auth: null,
    },
    pendingSigns: {},
  });
  chrome.windows.create({
    ...popupProps,
    url: chrome.runtime.getURL('main_window_connector.html'),
    left: (bounds.width + bounds.positionX) - popupProps.width,
    top: bounds.positionY + 80,
  });
}

async function handleInjectorMessage(message, sender) {
  const tabId = sender.tab.id;
  const isCardano = message.protocol === 'cardano';

  await setInStorage(STORAGE_KEY_CONNECTION_PROTOCOL, message.protocol);
  await setInStorage(STORAGE_KEY_IMG_BASE64, message.imgBase64Url);

  function rpcResponse(response) {
    sendToInjector(
      tabId,
      {
        type: 'connector_rpc_response',
        protocol: message.protocol,
        uid: message.uid,
        return: response
      }
    );
  }
  function checkParamCount(expected: number) {
    const found = message?.params?.length;
    if (found !== expected) {
      throw ConnectorError.invalidRequest(`RPC call has ${found} arguments, expected ${expected}`);
    }
  }
  function handleError(e: any) {
    if (e instanceof ConnectorError) {
      rpcResponse({
        err: e.toAPIError()
      });
    } else {
      const prot = message.protocol;
      const func = message.function;
      const args = message.params.map(JSON.stringify).join(', ');
      const msg = `Yoroi internal error: RPC call ${prot}.${func}(${args}) failed due to internal error: ${e}`;
      const info = e?.stack == null ? msg : `${msg}\n${e.stack}`;
      Logger.error(info);
      rpcResponse({ err: { code: APIErrorCodes.API_INTERNAL_ERROR, info } });
    }
  }
  async function addressesToBech(addressesHex: string[]): Promise<string[]> {
    await RustModule.load();
    return addressesHex.map(addressHexToBech32);
  }
  const connectParameters = () => ({
    protocol: message.protocol,
      ...message.connectParameters,
  });
  if (message.type === 'yoroi_connect_request/cardano') {
    try {
      await withDb(
        async (_db, localStorageApi) => {
          await confirmConnect(
            'cardano-connect-request',
            tabId,
            connectParameters(),
            localStorageApi,
          );
        }
      );
    } catch (e) {
      sendToInjector(
        tabId,
        {
          type: 'yoroi_connect_response/cardano',
          success: false,
          err: stringifyError(e),
        }
      );
    }
  } else if (message.type === 'connector_rpc_request') {
    const returnType = message.returnType;
    if (isCardano && returnType !== 'cbor' && returnType !== 'json') {
      handleError(ConnectorError.invalidRequest(`Invalid return type "${returnType}". Expected "cbor" or "json"`));
      return;
    }
    const isCBOR = isCardano && (returnType === 'cbor');
    Logger.debug(`[yoroi][handleInjectorConnect] ${message.function} (Return type is: ${returnType})`);
    switch (message.function) {
    case 'is_enabled/cardano':
      try {
        await withDb(
          async (_db, localStorageApi) => {
            const whitelistedEntry = await findWhitelistedConnection(
              message.url,
              false,
              message.protocol,
              localStorageApi,
            );
            const isWhitelisted = whitelistedEntry != null;
            rpcResponse({ ok: isWhitelisted });
          }
        );
      } catch (e) {
        sendToInjector(
          tabId,
          {
            type: 'yoroi_connect_response/cardano',
            success: false,
            err: stringifyError(e),
          }
        );
      }
      break;
    case 'sign_tx/cardano':
      try {
        checkParamCount(1);
        const connection = await getConnectedSite(tabId);
        if (connection == null) {
          Logger.error(`ERR - sign_tx could not find connection with tabId = ${tabId}`);
          rpcResponse(undefined); // shouldn't happen
          return
        }
        await RustModule.load();
        const { tx, partialSign, returnTx } = message.params[0];
        await confirmSign(
          tabId,
          {
            type: 'tx/cardano',
            tx: { tx, partialSign, tabId },
            uid: message.uid
          },
          connection,
          {
            type: 'cardano-tx',
            returnTx,
            tx,
          },
          message.protocol,
          message.uid,
        );
      } catch (e) {
        handleError(e);
      }
      break;
    case 'sign_data':
    case 'cip95_sign_data':
      try {
        const rawAddress = message.params[0];
        const payload = message.params[1];
        await withDb(async (db, localStorageApi) => {
          await withSelectedWallet(
            tabId,
            async (wallet) => {
              if (isCardano) {
                await RustModule.load();
                const connection = await getConnectedSite(tabId);
                if (connection == null) {
                  Logger.error(`ERR - sign_data could not find connection with tabId = ${tabId}`);
                  rpcResponse(undefined); // shouldn't happen
                  return;
                }
                let address;
                try {
                  address = Buffer.from(
                    RustModule.WalletV4.Address.from_bech32(rawAddress).to_bytes()
                  ).toString('hex');
                } catch {
                  address = rawAddress;
                }
                const addressing = await getAddressing(wallet, address);
                if (!addressing) {
                  rpcResponse({
                    err: {
                      code: DataSignErrorCodes.DATA_SIGN_ADDRESS_NOT_PK,
                      info: 'address not found',
                    }
                  });
                  return;
                }
                await confirmSign(
                  tabId,
                  {
                    type: 'data',
                    address,
                    payload,
                    uid: message.uid
                  },
                  connection,
                  {
                    type: 'cardano-data',
                    address,
                    payload,
                  },
                  message.protocol,
                  message.uid,
                );
              } else {
                rpcResponse({ err: 'not implemented' });

              }
            },
            db,
            localStorageApi,
          )
        });
      } catch (e) {
        handleError(e);
      }
      break;
    case 'get_balance':
      try {
        checkParamCount(1);
        const tokenId = asTokenId(message.params[0]);
        await withDb(async (db, localStorageApi) => {
          await withSelectedWallet(
            tabId,
            async (wallet) => {
              await RustModule.load();
              const balance =
                    await connectorGetBalance(wallet, tokenId);
              if (isCBOR && tokenId === '*' && !(typeof balance === 'string')) {
                const W4 = RustModule.WalletV4;
                const value = W4.Value.new(
                  W4.BigNum.from_str(balance.default),
                );
                if (balance.assets.length > 0) {
                  const mappedAssets = balance.assets.map(a => {
                    const [policyId, name] = a.identifier.split('.');
                    return {
                      amount: a.amount,
                      assetId: a.identifier,
                      policyId,
                      name,
                    };
                  })
                  value.set_multiasset(assetToRustMultiasset(mappedAssets));
                }
                rpcResponse({ ok: Buffer.from(value.to_bytes()).toString('hex') });
              } else {
                rpcResponse({ ok: balance });
              }
            },
            db,
            localStorageApi,
          )
        });
      } catch(e) {
        handleError(e);
      }
      break;
    case 'get_utxos/cardano':
      try {
        checkParamCount(2);
        const valueExpected = message.params[0] == null ? null : asValue(message.params[0]);
        const paginate = message.params[1] == null ? null : asPaginate(message.params[1]);
        await withDb(async (db, localStorageApi) => {
          await withSelectedWallet(
            tabId,
            async (wallet) => {
              await RustModule.load();
              const network = wallet.getParent().getNetworkInfo();
              const config = getCardanoHaskellBaseConfig(
                network
              ).reduce((acc, next) => Object.assign(acc, next), {});
              const coinsPerUtxoWord =
                    RustModule.WalletV4.BigNum.from_str(config.CoinsPerUtxoWord);
              let utxos;
              try {
                utxos = await transformCardanoUtxos(
                  await connectorGetUtxosCardano(
                    wallet,
                    valueExpected,
                    paginate,
                    coinsPerUtxoWord,
                  ),
                  isCBOR,
                );
              } catch (e) {
                if (e instanceof NotEnoughMoneyToSendError) {
                  rpcResponse({ ok: null });
                } else {
                  rpcResponse({ err: e.message });
                }
                return;
              }
              rpcResponse({ ok: utxos });
            },
            db,
            localStorageApi,
          )
        });
      } catch (e) {
        handleError(e);
      }
      break;
    case 'get_used_addresses':
      try {
        const paginate = message.params[0] == null ? null : asPaginate(message.params[0]);

        await withDb(async (db, localStorageApi) => {
          await withSelectedWallet(
            tabId,
            async (wallet) => {
              const addresses = await connectorGetUsedAddressesWithPaginate(wallet, paginate);
              if (!isCardano || isCBOR) {
                rpcResponse({ ok: addresses });
              } else {
                rpcResponse({ ok: await addressesToBech(addresses) });
              }
            },
            db,
            localStorageApi,
          )
        });
      } catch (e) {
        handleError(e);
      }
      break;
    case 'get_unused_addresses':
      try {
        await withDb(async (db, localStorageApi) => {
          await withSelectedWallet(
            tabId,
            async (wallet) => {
              const addresses = await connectorGetUnusedAddresses(wallet);
              if (!isCardano || isCBOR) {
                rpcResponse({ ok: addresses });
              } else {
                rpcResponse({ ok: await addressesToBech(addresses) });
              }
            },
            db,
            localStorageApi,
          )
        });
      } catch (e) {
        handleError(e);
      }
      break;
    case 'get_reward_addresses/cardano':
      try {
        await withDb(async (db, localStorageApi) => {
          await withSelectedWallet(
            tabId,
            async (wallet) => {
              const addresses = await connectorGetCardanoRewardAddresses(wallet);
              if (isCBOR) {
                rpcResponse({ ok: addresses });
              } else {
                rpcResponse({ ok: await addressesToBech(addresses) });
              }
            },
            db,
            localStorageApi,
          )
        });
      } catch (e) {
        handleError(e);
      }
      break;
    case 'get_drep_key':
      try {
        await RustModule.load();
        await withDb(async (db, localStorageApi) => {
          await withSelectedWallet(
            tabId,
            async (wallet) => {
              const dRepKey = await connectorGetDRepKey(wallet);
              rpcResponse({ ok: dRepKey });
            },
            db,
            localStorageApi,
          )
        });
      } catch (e) {
        handleError(e);
      }
      break;
    case 'get_stake_key':
      try {
        await RustModule.load();
        await withDb(async (db, localStorageApi) => {
          await withSelectedWallet(
            tabId,
            async (wallet) => {
              const stateFetcher: CardanoIFetcher =
                    await getCardanoStateFetcher(localStorageApi);
              const resp = await connectorGetStakeKey(
                wallet,
                stateFetcher.getAccountState,
              );
              rpcResponse({ ok: resp });
            },
            db,
            localStorageApi,
          )
        });
      } catch (e) {
        handleError(e);
      }
      break;
    case `get_change_address`:
      try {
        await RustModule.load();
        await withDb(async (db, localStorageApi) => {
          await withSelectedWallet(
            tabId,
            async (wallet) => {
              const address = await connectorGetChangeAddress(wallet);
              if (!isCardano || isCBOR) {
                rpcResponse({ ok: address });
              } else {
                rpcResponse({ ok: (await addressesToBech([address]))[0] });
              }
            },
            db,
            localStorageApi,
          )
        });
      } catch (e) {
        handleError(e);
      }
      break;
    case 'submit_tx':
      try {
        await RustModule.load();
        await withDb(async (db, localStorageApi) => {
          await withSelectedWallet(
            tabId,
            async (wallet) => {
              let id;
              if (isCardanoHaskell(wallet.getParent().getNetworkInfo())) {
                const txBuffer = Buffer.from(message.params[0], 'hex');
                await connectorSendTxCardano(
                  wallet,
                  txBuffer,
                  localStorageApi,
                );
                const tx = RustModule.WalletV4.Transaction.from_bytes(
                  txBuffer
                );
                id = Buffer.from(
                  RustModule.WalletV4.hash_transaction(tx.body()).to_bytes()
                ).toString('hex');
                try {
                  await connectorRecordSubmittedCardanoTransaction(
                    wallet,
                    tx,
                  );
                } catch (error) {
                  // eslint-disable-next-line no-console
                  console.error('error recording submitted tx', error);
                }
              } else {
                throw new Error('non cardano-haskell wallet. Should not happen');
              }
              chrome.runtime.sendMessage('connector-tx-submitted');
              rpcResponse({
                ok: id
              });
            },
            db,
            localStorageApi,
          )
        });
      } catch (e) {
        handleError(e);
      }
      break;
    case 'ping':
      rpcResponse({
        ok: true,
      });
      break;
    case 'create_tx/cardano':
      try {
        checkParamCount(1);
        await RustModule.load();
        const connection = await getConnectedSite(tabId);
        if (connection == null) {
          Logger.error(`ERR - sign_tx could not find connection with tabId = ${tabId}`);
          rpcResponse(undefined); // shouldn't happen
        } else {
          await withDb(async (db, localStorageApi) => {
            return await withSelectedWallet(
              tabId,
              async (wallet) => {
                const stateFetcher: CardanoIFetcher =
                      await getCardanoStateFetcher(localStorageApi);
                const networkInfo = wallet.getParent().getNetworkInfo();
                const foreignUtxoFetcher: ForeignUtxoFetcher =
                      ConnectorStore.createForeignUtxoFetcher(stateFetcher, networkInfo);
                const resp = await connectorCreateCardanoTx(
                  wallet,
                  null,
                  message.params[0],
                  foreignUtxoFetcher,
                );
                rpcResponse({
                  ok: resp,
                });
              },
              db,
              localStorageApi
            );
          });
        }
      } catch (e) {
        handleError(e);
      }
      break;
    case 'get_network_id':
      try {
        checkParamCount(0);
        const connection = await getConnectedSite(tabId);
        if (connection == null) {
          Logger.error(`ERR - get_network_id could not find connection with tabId = ${tabId}`);
          rpcResponse(undefined); // shouldn't happen
        } else {
          await withDb(async (db, localStorageApi) => {
            return await withSelectedWallet(
              tabId,
              async (wallet) => {
                const networkId = wallet.getParent()
                  .getNetworkInfo().BaseConfig[0].ChainNetworkId;
                rpcResponse({
                  ok: parseInt(networkId, 10),
                });
              },
              db,
              localStorageApi,
              false,
            );
          });
        }
      } catch (e) {
        handleError(e);
      }
      break;
    case 'list_nfts/cardano':
      try {
        await withDb(async (db, localStorageApi) => {
          await withSelectedWallet(
            tabId,
            async (wallet) => {
              const assets = await connectorGetAssets(wallet);
              const potentialNFTAssets = assets.filter(asset => asset.amount === '1');
              const tokenIds = potentialNFTAssets.map(asset => asset.identifier);
              const tokenMetadata = await getTokenMetadataFromIds(tokenIds, wallet);

              const nfts = {};

              for (const metadata of tokenMetadata) {
                if (!metadata.IsNFT) {
                  continue;
                }
                if (metadata.Metadata.type !== 'Cardano') {
                  throw new Error('this API only supports Cardano');
                }
                const nftMetadata = find721metadata(
                  metadata.Metadata.policyId,
                  metadata.Metadata.assetName,
                  metadata.Metadata.assetMintMetadata,
                );
                if (nftMetadata) {
                  nfts[metadata.Identifier] = { metadata: nftMetadata };
                }
              }
              rpcResponse({ ok: nfts });
            },
            db,
            localStorageApi,
          )
        });
      } catch(e) {
        handleError(e);
      }
      break;
    case 'auth_sign_hex_payload/cardano':
      try {
        checkParamCount(1);
        await withDb(async (db, localStorageApi) => {
          await withSelectedWallet(
            tabId,
            async (wallet, connection) => {
              const auth = connection?.status?.auth;
              if (auth) {
                await RustModule.load();
                const signatureHex = await authSignHexPayload({
                  privKey: auth.privkey,
                  payloadHex: message.params[0],
                });
                rpcResponse({
                  ok: signatureHex
                });
              } else {
                rpcResponse({
                  err: 'auth_sign_hex_payload is requested but no auth is present in the connection!',
                });
              }
            },
            db,
            localStorageApi,
            false,
          )
        });
      } catch (e) {
        handleError(e);
      }
      break;
    case 'auth_check_hex_payload/cardano':
      try {
        checkParamCount(2);
        await withSelectedSiteConnection(tabId, async connection => {
          if (connection?.status?.auth) {
            await RustModule.load();
            const [payloadHex, signatureHex] = message.params;
            const pk = RustModule.WalletV4.PublicKey
                  .from_bytes(Buffer.from(String(connection.status?.auth?.pubkey), 'hex'));
            const sig = RustModule.WalletV4.Ed25519Signature.from_hex(signatureHex);
            const res = pk.verify(Buffer.from(payloadHex, 'hex'), sig);
            rpcResponse({
              ok: res
            });
          } else {
            rpcResponse({
              err: 'auth_check_hex_payload is requested but no auth is present in the connection!',
            });
          }
        });
      } catch (e) {
        handleError(e);
      }
      break;
    case 'get_collateral_utxos':
      try {
        checkParamCount(1);
        await RustModule.load();
        const firstParam = message.params[0];
        const definedRequiredAmount = !!firstParam;
        let requiredAmount: string = firstParam || String(MAX_COLLATERAL);
        if (!/^\d+$/.test(requiredAmount)) {
          try {
            requiredAmount = RustModule.WalletV4.Value.from_bytes(
              Buffer.from(requiredAmount, 'hex')
            ).coin().to_str();
          } catch {
            rpcResponse({
              err: {
                code: APIErrorCodes.API_INVALID_REQUEST,
                info: 'failed to parse the required collateral amount',
              },
            });
            return;
          }
        }
        await withDb(async (db, localStorageApi) => {
          await withSelectedWallet(
            tabId,
            async (wallet) => {
              // try to get enough collaterals from existing UTXOs
              const withUtxos = asGetAllUtxos(wallet)
              if (withUtxos == null) {
                throw new Error('wallet doesn\'t support IGetAllUtxos');
              }
              const walletUtxos = await withUtxos.getAllUtxos();
              if (walletUtxos.length === 0) {
                rpcResponse({
                  err: {
                    code: APIErrorCodes.API_INTERNAL_ERROR,
                    info: 'not enough UTXOs'
                  }
                });
                return;
              }
              const addressedUtxos = asAddressedUtxoCardano(walletUtxos);
              const submittedTxs = await loadSubmittedTransactions() || [];
              const {
                utxosToUse,
                reorgTargetAmount
              } = await connectorGetCollateralUtxos(
                wallet,
                requiredAmount,
                addressedUtxos.map(u => {
                  // eslint-disable-next-line no-unused-vars
                  const { addressing, ...rest } = u;
                  return rest;
                }),
                submittedTxs,
              );
              const isEnough = reorgTargetAmount == null;
              const someCollateralIsSelected = utxosToUse.length > 0;
              const canAnswer = isEnough || (someCollateralIsSelected && !definedRequiredAmount)
              // do have enough
              if (canAnswer) {
                const utxos = await transformCardanoUtxos(
                  utxosToUse,
                  isCBOR
                );
                rpcResponse({
                  ok: utxos,
                });
                return;
              }

              if (reorgTargetAmount != null) {

                // not enough suitable UTXOs for collateral
                // see if we can re-organize the UTXOs
                // `utxosToUse` are UTXOs that are already picked
                // `requiredAmount` is the amount needed to respond
                const usedUtxoIds = utxosToUse.map(utxo => utxo.utxo_id);
                try {
                  await connectorGenerateReorgTx(
                    wallet,
                    usedUtxoIds,
                    // `requiredAmount` is used here instead of the `reorgTargetAmount`
                    // this is by design to minimise the number of collateral utxos
                    requiredAmount,
                    addressedUtxos,
                    submittedTxs,
                  );
                } catch (error) {
                  if (error instanceof NotEnoughMoneyToSendError) {
                    rpcResponse({
                      err: {
                        code: APIErrorCodes.API_INTERNAL_ERROR,
                        info: 'not enough UTXOs'
                      }
                    });
                    return;
                  }
                  throw error;
                }
                // we can get enough collaterals after re-organization
                // pop-up the UI
                const connection = await getConnectedSite(tabId);
                if (connection == null) {
                  throw new Error(
                    `ERR - get_collateral_utxos could not find connection with tabId = ${tabId}`
                  );
                }

                await confirmSign(
                  tabId,
                  {
                    type: 'tx-reorg/cardano',
                    tx: {
                      usedUtxoIds,
                      reorgTargetAmount: requiredAmount,
                      utxos: walletUtxos,
                    },
                    uid: message.uid,
                  },
                  connection,
                  {
                    type: 'cardano-reorg-tx',
                    utxosToUse,
                    isCBOR,
                  },
                  message.protocol,
                  message.uid,
                );
              }
            },
            db,
            localStorageApi,
          )
        });
      } catch (e) {
        handleError(e);
      }
      break;
    default:
      rpcResponse({
        err: {
          code: APIErrorCodes.API_INVALID_REQUEST,
          info: `unknown API function: ${message.function}`
        }
      })
      break;
    }
  }
}


async function transformCardanoUtxos(
  utxos: Array<RemoteUnspentOutput>,
  isCBOR: boolean,
) {
  const cardanoUtxos: $ReadOnlyArray<$ReadOnly<RemoteUnspentOutput>> = utxos;
  await RustModule.load();
  const W4 = RustModule.WalletV4;
  if (isCBOR) {
    return cardanoUtxos.map(cardanoUtxoHexFromRemoteFormat)
  }

  return cardanoUtxos.map(u => {
    return {
        ...u,
      receiver: W4.Address.from_bytes(
        Buffer.from(u.receiver, 'hex'),
      ).to_bech32(),
    };
  });
}

function handleExchangeRedirectMessage(message, sender) {
  const url = new URL(sender.url);
  if (url.hostname === 'yoroi-wallet.com') {
    const { searchParams } = url;
    const cardanoLink = decodeURIComponent(searchParams.get('link') || '');
    const m = cardanoLink.match(/web\+cardano:([a-z0-9]+)\?amount=([0-9\.]+)/);
    if (!m) {
      return;
    }
    const addr = m[1];
    const amount = m[2];
    const redirectTo = searchParams.get('redirectTo');
    // $FlowFixMe[prop-missing] flow doesn't know replaceAll
    const redirectToFixed = redirectTo?.replaceAll('%253A', ':')?.replaceAll('%252F', '/') || '';
    chrome.tabs.remove(sender.tab.id);
    const extensionUrl = `main_window.html?action=sell-ada&addr=${addr}&amount=${amount}` +
      `&redirect=${encodeURIComponent(redirectToFixed)}`;
    chrome.tabs.create({ url: extensionUrl });
  }
}
