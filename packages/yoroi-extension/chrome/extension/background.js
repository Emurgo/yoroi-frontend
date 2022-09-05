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
  Tx,
  TxSignWindowRetrieveData,
  WalletAuthEntry,
  WhitelistEntry,
} from './ergo-connector/types';
import {
  APIErrorCodes,
  asPaginate,
  asSignedTx,
  asTokenId,
  asTx,
  asValue,
  ConnectorError,
  DataSignErrorCodes,
} from './ergo-connector/types';
import {
  connectorCreateCardanoTx,
  connectorGenerateReorgTx,
  connectorGetBalance,
  connectorGetCardanoRewardAddresses,
  connectorGetChangeAddress,
  connectorGetCollateralUtxos,
  connectorGetUnusedAddresses,
  connectorGetUsedAddresses,
  connectorGetUtxosCardano,
  connectorGetUtxosErgo,
  connectorRecordSubmittedCardanoTransaction,
  connectorRecordSubmittedErgoTransaction,
  connectorSendTx,
  connectorSendTxCardano,
  connectorSignCardanoTx,
  connectorSignTx,
  getAddressing,
  connectorSignData,
  connectorGetAssets,
  getTokenMetadataFromIds,
} from './ergo-connector/api';
import { updateTransactions as ergoUpdateTransactions } from '../../app/api/ergo/lib/storage/bridge/updateTransactions';
import {
  updateTransactions as cardanoUpdateTransactions
} from '../../app/api/ada/lib/storage/bridge/updateTransactions';
import { environment } from '../../app/environment';
import type { IFetcher as ErgoIFetcher } from '../../app/api/ergo/lib/state-fetch/IFetcher';
import type { IFetcher as CardanoIFetcher } from '../../app/api/ada/lib/state-fetch/IFetcher';
import { RemoteFetcher as ErgoRemoteFetcher } from '../../app/api/ergo/lib/state-fetch/remoteFetcher';
import { RemoteFetcher as CardanoRemoteFetcher } from '../../app/api/ada/lib/state-fetch/remoteFetcher';
import { BatchedFetcher as ErgoBatchedFetcher } from '../../app/api/ergo/lib/state-fetch/batchedFetcher';
import { BatchedFetcher as CardanoBatchedFetcher } from '../../app/api/ada/lib/state-fetch/batchedFetcher';
import LocalStorageApi, {
  loadSubmittedTransactions,
} from '../../app/api/localStorage/index';
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
import { authSignHexPayload } from '../../app/ergo-connector/api';
import type { RemoteUnspentOutput } from '../../app/api/ada/lib/state-fetch/types';
import { NotEnoughMoneyToSendError, } from '../../app/api/common/errors';
import { asAddressedUtxo as asAddressedUtxoCardano, } from '../../app/api/ada/transactions/utils';
import ConnectorStore from '../../app/ergo-connector/stores/ConnectorStore';
import type { ForeignUtxoFetcher } from '../../app/ergo-connector/stores/ConnectorStore';
import { find721metadata } from '../../app/utils/nftMetadata';

/*::
declare var chrome;
*/

const onYoroiIconClicked = () => {
  chrome.tabs.create({ url: 'main_window.html' });
};

chrome.action.onClicked.addListener(debounce(onYoroiIconClicked, 500, { leading: true }));

const STORAGE_KEY_PREFIX = 'background-';

async function setInStorage(key: string, value: any): Promise<void> {
  await chrome.storage.session.set({ [STORAGE_KEY_PREFIX + key]: value });
}

async function getFromStorage(key: string): Promise<any> {
  const storageKey = STORAGE_KEY_PREFIX + key;
  const result = await chrome.storage.session.get(storageKey);
  return result[storageKey];
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

type ConnectRequestType = 'cardano-connect-request' | 'ergo-connect-request';

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
  type: 'ergo-tx',
|} | {|
  type: 'cardano-tx',
  returnTx: boolean,
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
  protocol: 'cardano' | 'ergo',
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

function getDefaultBounds(): {| width: number, positionX: number, positionY: number |} {
  return {
    width: chrome.system.display.width,
    positionX: 0,
    positionY: 0,
  };
}

function getBoundsForWindow(
  targetWindow
): {| width: number, positionX: number, positionY: number |} {
  const defaults = getDefaultBounds();

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

async function getErgoStateFetcher(
  localStorageApi: LocalStorageApi,
): Promise<ErgoIFetcher> {
  return new ErgoBatchedFetcher(await createFetcher(ErgoRemoteFetcher, localStorageApi));
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
          await cardanoUpdateTransactions(
            wallet.getDb(),
            wallet,
            stateFetcher.checkAddressesInUse,
            stateFetcher.getTransactionsHistoryForAddresses,
            stateFetcher.getBestBlock,
            stateFetcher.getTokenInfo,
            stateFetcher.getMultiAssetMintMetadata,
          )
        } else {
          const stateFetcher: ErgoIFetcher =
            await getErgoStateFetcher(localStorageApi);
          await ergoUpdateTransactions(
            wallet.getDb(),
            wallet,
            stateFetcher.checkAddressesInUse,
            stateFetcher.getTransactionsHistoryForAddresses,
            stateFetcher.getAssetInfo,
            stateFetcher.getBestBlock
          );
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
  if (connectType === 'ergo-connect-request') {
    sendToInjector(
      tabId,
      {
        type: 'yoroi_connect_response/ergo',
        success: connectedWallet != null,
      }
    );
  } else if (connectType === 'cardano-connect-request') {
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
  async function signTxInputs(
    tx: Tx,
    indices: number[],
    password: string,
    tabId: number
  ): Promise<ErgoTxJson> {
    return await withDb<ErgoTxJson>(async (db, localStorageApi) => {
      return await withSelectedWallet<ErgoTxJson>(
        tabId,
        async (wallet) => {
          const canGetAllUtxos = asGetAllUtxos(wallet);
          if (canGetAllUtxos == null) {
            throw new Error('could not get all utxos');
          }
          const network = wallet.getParent().getNetworkInfo();
          const [utxos, bestBlock] = await Promise.all([
            canGetAllUtxos.getAllUtxos(),
            getErgoStateFetcher(localStorageApi)
              .then((f: ErgoIFetcher) => f.getBestBlock({ network })),
          ])
          return await connectorSignTx(wallet, password, utxos, bestBlock, tx, indices);
        },
        db,
        localStorageApi
      );
    });
  }
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

  if (request.type === 'connect_response') {
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
  } else if (request.type === 'sign_confirmed') {
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
      case 'tx':
      {
        try {
          // We know `tx` is a `Tx` here
          const txToSign: Tx = (request.tx: any);
          const allIndices = [];
          for (let i = 0; i < txToSign.inputs.length; i += 1) {
            allIndices.push(i);
          }
          const signedTx = await signTxInputs(txToSign, allIndices, password, request.tabId);
          rpcResponse({ ok: signedTx });
        } catch (error) {
          rpcResponse({ err: 'transaction signing failed' });
        }
      }
        break;
      case 'tx_input':
      {
        try {
          const data = responseData.request;
          const txToSign: Tx = (request.tx: any);
          const signedTx = await signTxInputs(
            txToSign,
            [data.index],
            password,
            request.tabId
          );
          rpcResponse({ ok: signedTx.inputs[data.index] });
        } catch (error) {
          rpcResponse({ err: 'transaction signing failed' });
        }
      }
        break;
      case 'tx/cardano':
      {
        let resp;
        try {
          const signedTx = await signCardanoTx(
            (request.tx: any),
            password,
            request.tabId
          );
          resp = { ok: signedTx };
        } catch (error) {
          resp = { err: 'transaction signing failed' };
        }
        if (responseData.continuationData.type !== 'cardano-tx') {
          rpcResponse({ err: 'unexpected error' });
          return;
        }
        const { returnTx } = responseData.continuationData;
        if (!returnTx && resp?.ok != null) {
          const witnessSetResp = Buffer.from(
            RustModule.WalletV4.Transaction.from_bytes(
              Buffer.from(resp.ok, 'hex'),
            ).witness_set().to_bytes()
          ).toString('hex');
          rpcResponse({ ok: witnessSetResp });
        } else {
          rpcResponse(resp);
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
        const { utxosToUse, isCBOR } = responseData.continuationData;
        const utxos = await transformCardanoUtxos(
          [...utxosToUse, ...(request.tx: any)],
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
  } else if (request.type === 'sign_rejected') {
    const connection = await getConnectedSite(request.tabId);
    const responseData = connection?.pendingSigns[String(request.uid)];
    if (connection && responseData) {
      sendToInjector(
        request.tabId,
        {
          type: 'connector_rpc_response',
          protocol: responseData.protocol,
          uid: request.uid,
          return: {
            err: {
              code: 2,
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
  } else if (request.type === 'sign_error') {
    const connection = await getConnectedSite(request.tabId);
    const responseData = connection?.pendingSigns[String(request.uid)];
    if (connection && responseData) {
      sendToInjector(
        request.tabId,
        {
          type: 'connector_rpc_response',
          protocol: responseData.protocol,
          uid: request.uid,
          return: {
            err: {
              code: 3,
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
  } else if (request.type === 'tx_sign_window_retrieve_data') {
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
          }: SigningMessage));
          return;
        }
      }
    }
    // not sure if this should happen - close window if we can't find a tx to sign
    sendResponse(null);
  } else if (request.type === 'connect_retrieve_data') {
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
        }
      }
    }
    sendResponse(null);
  } else if (request.type === 'remove_wallet_from_whitelist') {
    const connectedSites = await getAllConnectedSites();
    for (const tabId of Object.keys(connectedSites)) {
      const site = connectedSites[tabId];
      if (site.url === request.url) {
        sendToInjector(Number(tabId), { type: 'disconnect' });
        break;
      }
    }
  } else if (request.type === 'get_connected_sites') {
    const activeSites: Array<ConnectedSite> =
      (Object.values(await getAllConnectedSites()): any);

    sendResponse(({
      sites: activeSites.map(site => site.url),
    }: ConnectedSites));
  } else if (request.type === 'get_protocol') {
    const connectionProtocol = await getFromStorage(STORAGE_KEY_CONNECTION_PROTOCOL) ||
      'cardano';
    sendResponse({ type: connectionProtocol })
  } else if (request.type === 'get_utxos/addresses') {
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
              usedAddresses: async () => await connectorGetUsedAddresses(wallet, null),
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
  // Returning `true` is required by Firefox, see:
  // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/onMessage
  (message, sender, sendResponse) => {
    yoroiMessageHandler(message, sender, sendResponse);
    return true;
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
  protocol: 'cardano' | 'ergo',
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
    protocol: 'cardano' | 'ergo',
  |},
  localStorageApi: LocalStorageApi,
): Promise<void> {
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

// generic communication to the entire connector
chrome.runtime.onMessageExternal.addListener((message, sender) => {
  if (sender.id === environment.ergoConnectorExtensionId) {
    if (message.type === 'open_browseraction_menu') {
      chrome.windows.getLastFocused(currentWindow => {
        if (currentWindow == null) return; // should not happen
        const bounds = getBoundsForWindow(currentWindow);
        chrome.windows.create({
          ...popupProps,
          url: chrome.runtime.getURL(`/main_window_connector.html#/settings`),
          left: (bounds.width + bounds.positionX) - popupProps.width,
          top: bounds.positionY + 80,
        });
      });
    }
  }
});

// message from injected code of the standalone connector
chrome.runtime.onMessageExternal.addListener(async (message, sender) => {
  if (sender.id === environment.ergoConnectorExtensionId) {
    await handleInjectorMessage(message, sender);
  }
});

// message from injected code of the connector bundled with Yoroi
chrome.runtime.onMessage.addListener(handleInjectorMessage);

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
    return addressesHex.map(a =>
                            RustModule.WalletV4.Address.from_bytes(
                              Buffer.from(a, 'hex'),
                            ).to_bech32()
                           );
  }
  const connectParameters = () => ({
    protocol: message.protocol,
      ...message.connectParameters,
  });
  if (message.type === 'yoroi_connect_request/ergo') {
    await withDb(
      async (_db, localStorageApi) => {
        await confirmConnect(
          'ergo-connect-request',
          tabId,
          connectParameters(),
          localStorageApi
        );
      }
    );
  } else if (message.type === 'yoroi_connect_request/cardano') {
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
    case 'sign_tx':
      try {
        checkParamCount(1);
        await withDb(async (db, localStorageApi) => {
          await withSelectedWallet(
            tabId,
            async (_wallet, connection) => {
              await RustModule.load();
              const tx = asTx(message.params[0], RustModule.SigmaRust);
              if (connection == null) {
                Logger.error(`ERR - sign_tx could not find connection with tabId = ${tabId}`);
                rpcResponse(undefined); // shouldn't happen
              } else {
                await confirmSign(
                  tabId,
                  {
                    type: 'tx',
                    tx,
                    uid: message.uid
                  },
                  connection,
                  { type: 'ergo-tx' },
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
          },
          message.protocol,
          message.uid,
        );
      } catch (e) {
        handleError(e);
      }
      break;
    case 'sign_tx_input':
      try {
        checkParamCount(2);
        await withDb(async (db, localStorageApi) => {
          await withSelectedWallet(
            tabId,
            async (_wallet, connection) => {
              if (connection == null) {
                Logger.error(`ERR - sign_tx could not find connection with tabId = ${tabId}`);
                rpcResponse(undefined); // shouldn't happen
                return
              }
              await RustModule.load();
              const tx = asTx(message.params[0], RustModule.SigmaRust);
              const txIndex = message.params[1];
              if (typeof txIndex !== 'number') {
                throw ConnectorError.invalidRequest(`invalid tx input: ${txIndex}`);
              }
              await confirmSign(
                tabId,
                {
                  type: 'tx_input',
                  tx,
                  index: txIndex,
                  uid: message.uid
                },
                connection,
                { type: 'cardano-tx-input' },
                message.protocol,
                message.uid,
              );
            },
            db,
            localStorageApi,
          )
        });
      } catch (e) {
        handleError(e);
      }
      break;
    case 'sign_data':
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
              const connectionProtocol = await getFromStorage(STORAGE_KEY_CONNECTION_PROTOCOL) ||
                    'cardano';
              const balance =
                    await connectorGetBalance(wallet, tokenId, connectionProtocol);
              if (isCBOR && tokenId === '*' && !(typeof balance === 'string')) {
                await RustModule.load();
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
    case 'get_utxos':
      try {
        checkParamCount(3);
        const valueExpected = message.params[0] == null ? null : asValue(message.params[0]);
        const tokenId = asTokenId(message.params[1]);
        const paginate = message.params[2] == null ? null : asPaginate(message.params[2]);
        await withDb(async (db, localStorageApi) => {
          await withSelectedWallet(
            tabId,
            async (wallet) => {
              const utxos = await connectorGetUtxosErgo(
                wallet,
                valueExpected,
                tokenId,
                paginate
              );
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
              const utxos = await transformCardanoUtxos(
                await connectorGetUtxosCardano(
                  wallet,
                  valueExpected,
                  paginate,
                  coinsPerUtxoWord,
                  network.NetworkId,
                ),
                isCBOR,
              );
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
              const addresses = await connectorGetUsedAddresses(wallet, paginate);
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
    case `get_change_address`:
      try {
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
                const tx = RustModule.WalletV4.Transaction.from_bytes(
                  Buffer.from(message.params[0], 'hex'),
                );
                await connectorSendTxCardano(
                  wallet,
                  tx.to_bytes(),
                  localStorageApi,
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
              } else { // is Ergo
                const tx = asSignedTx(message.params[0], RustModule.SigmaRust);
                id = await connectorSendTx(wallet, tx, localStorageApi);
                try {
                  await connectorRecordSubmittedErgoTransaction(
                    wallet,
                    tx,
                    id,
                  );
                } catch (error) {
                  // eslint-disable-next-line no-console
                  console.error('error recording submitted tx', error);
                }
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
        let requiredAmount: string = message.params[0];
        if (!/^\d+$/.test(requiredAmount)) {
          try {
            requiredAmount = RustModule.WalletV4.Value.from_bytes(
              Buffer.from(requiredAmount, 'hex')
            ).coin().to_str();
          } catch (e) {
            throw new Error(`Failed to parse the required collateral amount: "${requiredAmount}"`);
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
              // do have enough
              if (reorgTargetAmount == null) {
                const utxos = await transformCardanoUtxos(
                  utxosToUse,
                  isCBOR
                );
                rpcResponse({
                  ok: utxos,
                });
                return;
              }

              // not enough suitable UTXOs for collateral
              // see if we can re-organize the UTXOs
              // `utxosToUse` are UTXOs that are already picked
              // `reorgTargetAmount` is the amount still needed
              const usedUtxoIds = utxosToUse.map(utxo => utxo.utxo_id);
              try {
                await connectorGenerateReorgTx(
                  wallet,
                  usedUtxoIds,
                  reorgTargetAmount,
                  addressedUtxos,
                  submittedTxs,
                );
              } catch (error) {
                if (error instanceof NotEnoughMoneyToSendError) {
                  rpcResponse({ error: 'not enough UTXOs' });
                  return;
                }
                throw error;
              }
              // we can get enough collaterals after re-organization
              // pop-up the UI
              const connection = await getConnectedSite(tabId);
              if (connection == null) {
                Logger.error(`ERR - get_collateral_utxos could not find connection with tabId = ${tabId}`);
                rpcResponse(undefined); // shouldn't happen
                return;
              }

              await confirmSign(
                tabId,
                {
                  type: 'tx-reorg/cardano',
                  tx: {
                    usedUtxoIds,
                    reorgTargetAmount,
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


function assetToRustMultiasset(jsonAssets): RustModule.WalletV4.MultiAsset {
  const groupedAssets = jsonAssets.reduce((res, a) => {
    (res[a.policyId] = (res[a.policyId]||[])).push(a);
    return res;
  }, {})
  const W4 = RustModule.WalletV4;
  const multiasset = W4.MultiAsset.new();
  for (const policyHex of Object.keys(groupedAssets)) {
    const assetGroup = groupedAssets[policyHex];
    const policyId = W4.ScriptHash.from_bytes(Buffer.from(policyHex, 'hex'));
    const assets = RustModule.WalletV4.Assets.new();
    for (const asset of assetGroup) {
      assets.insert(
        W4.AssetName.new(Buffer.from(asset.name, 'hex')),
        W4.BigNum.from_str(asset.amount),
      );
    }
    multiasset.insert(policyId, assets);
  }
  return multiasset;
}

async function transformCardanoUtxos(
  utxos: Array<RemoteUnspentOutput>,
  isCBOR: boolean,
) {
  const cardanoUtxos: $ReadOnlyArray<$ReadOnly<RemoteUnspentOutput>> = utxos;
  await RustModule.load();
  const W4 = RustModule.WalletV4;
  if (isCBOR) {
    return cardanoUtxos.map(u => {
      const input = W4.TransactionInput.new(
        W4.TransactionHash.from_bytes(
          Buffer.from(u.tx_hash, 'hex')
        ),
        u.tx_index,
      );
      const value = W4.Value.new(W4.BigNum.from_str(u.amount));
      if ((u.assets || []).length > 0) {
        value.set_multiasset(assetToRustMultiasset(u.assets));
      }
      const output = W4.TransactionOutput.new(
        W4.Address.from_bytes(Buffer.from(u.receiver, 'hex')),
        value,
      );
      return Buffer.from(
        W4.TransactionUnspentOutput.new(input, output).to_bytes(),
      ).toString('hex');
    })
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
