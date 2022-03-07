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
  PendingSignData,
  PendingTransaction,
  RemoveWalletFromWhitelistData,
  RpcUid,
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
} from './ergo-connector/types';
import {
  connectorCreateCardanoTx,
  connectorGetBalance,
  connectorGetCardanoRewardAddresses,
  connectorGetChangeAddress,
  connectorGetUnusedAddresses,
  connectorGetUsedAddresses,
  connectorGetUtxosCardano,
  connectorGetUtxosErgo,
  connectorSendTx,
  connectorSendTxCardano,
  connectorSignCardanoTx,
  connectorSignTx,
  connectorRecordSubmittedCardanoTransaction,
  connectorRecordSubmittedErgoTransaction,
} from './ergo-connector/api';
import { updateTransactions as ergoUpdateTransactions } from '../../app/api/ergo/lib/storage/bridge/updateTransactions';
import { updateTransactions as cardanoUpdateTransactions } from '../../app/api/ada/lib/storage/bridge/updateTransactions';
import { environment } from '../../app/environment';
import type { IFetcher as ErgoIFetcher } from '../../app/api/ergo/lib/state-fetch/IFetcher';
import type { IFetcher as CardanoIFetcher } from '../../app/api/ada/lib/state-fetch/IFetcher';
import { RemoteFetcher as ErgoRemoteFetcher } from '../../app/api/ergo/lib/state-fetch/remoteFetcher';
import { RemoteFetcher as CardanoRemoteFetcher } from '../../app/api/ada/lib/state-fetch/remoteFetcher';
import { BatchedFetcher as ErgoBatchedFetcher } from '../../app/api/ergo/lib/state-fetch/batchedFetcher';
import { BatchedFetcher as CardanoBatchedFetcher } from '../../app/api/ada/lib/state-fetch/batchedFetcher';
import LocalStorageApi from '../../app/api/localStorage/index';
import { RustModule } from '../../app/api/ada/lib/cardanoCrypto/rustLoader';
import { Logger, stringifyError } from '../../app/utils/logging';
import type { lf$Database, } from 'lovefield';
import { schema } from 'lovefield';
import { copyDbToMemory, loadLovefieldDB, } from '../../app/api/ada/lib/storage/database/index';
import { migrateNoRefresh } from '../../app/api/common/migration';
import { Mutex, } from 'async-mutex';
import { isCardanoHaskell } from '../../app/api/ada/lib/storage/database/prepackaged/networks';
import { authSignHexPayload } from '../../app/ergo-connector/api';
import type { RemoteUnspentOutput } from '../../app/api/ada/lib/state-fetch/types';


/*::
declare var chrome;
*/

const onYoroiIconClicked = () => {
  chrome.tabs.create({ url: 'main_window.html' });
};

chrome.browserAction.onClicked.addListener(debounce(onYoroiIconClicked, 500, { leading: true }));

/**
 * we store the ID instead of an index
 * because the user could delete a wallet (causing indices to shift)
 * whereas ID lets us detect if the entry in the DB still exists
 */
type PublicDeriverId = number;

// PublicDeriverId = successfully connected - which public deriver the user selected
// null = refused by user
type ConnectedStatus = null | {|
  publicDeriverId: PublicDeriverId,
  auth: ?WalletAuthEntry,
|} | {|
  // response (?PublicDeriverId) - null means the user refused, otherwise the account they selected
  resolve: ({|
    connectedWallet: ?PublicDeriverId,
    auth: ?WalletAuthEntry,
  |}) => void,
  // if a window has fetched this to show to the user yet
  openedWindow: boolean,
  publicDeriverId: null,
  auth: null,
|};

type PendingSign = {|
  // data needed to complete the request
  request: PendingSignData,
  // if an opened window has been created for this request to show the user
  openedWindow: boolean,
  // resolve function from signRequest's Promise
  resolve: ({| ok: any |} | {| err: any |}) => void,
|}

let imgBase64Url: string = '';
let connectionProtocol: 'cardano' | 'ergo' = 'cardano';

type ConnectedSite = {|
  url: string,
  protocol: 'cardano' | 'ergo',
  appAuthID?: string,
  status: ConnectedStatus,
  pendingSigns: Map<RpcUid, PendingSign>
|};


function getDefaultBounds(): {| width: number, positionX: number, positionY: number |} {
  return {
    width: screen.availWidth,
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

type TabId = number;

const connectedSites: Map<TabId, ConnectedSite> = new Map();

// tabid => chrome.runtime.Port
const ports: Map<TabId, any> = new Map();


let pendingTxs: PendingTransaction[] = [];

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
        if (!isCardano) {
          // to be safe we filter possibly accepted txs for up to 10 minutes
          // this could be accepted in a variable amount of time due to Ergo's PoW
          // but this is probably an okay amount. If it was not accepted then at worst
          // the values are just temporarily withheld for a few minutes too long,
          // and if it was accepted, then none of the UTXOs held would have been
          // reuseable anyway.
          pendingTxs = pendingTxs.filter(
            pendingTx => Date.now() - pendingTx.submittedTime.getTime() <= 10 * 60 * 1000);
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
  const connected = connectedSites.get(tabId);
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
      connectedSites.delete(tabId);
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

  // alert(`received event: ${JSON.stringify(request)}`);
  if (request.type === 'connect_response') {
    if (request.tabId == null) return;
    const { tabId } = request;
    const connection = connectedSites.get(tabId);
    if (connection?.status?.resolve != null) {
      if (request.accepted === true) {
        connection.status.resolve({
          connectedWallet: request.publicDeriverId,
          auth: request.auth,
        });
        connection.status = {
          publicDeriverId: request.publicDeriverId,
          auth: request.auth,
        };
      } else {
        connection.status.resolve({ connectedWallet: null, auth: null });
        connectedSites.delete(tabId);
      }
    }
  } else if (request.type === 'sign_confirmed') {
    const connection = connectedSites.get(request.tabId);
    if (!connection) {
      throw new ConnectorError({
        code: APIErrorCodes.API_INTERNAL_ERROR,
        info: 'Connection has failed. Please retry.',
      });
    }
    const responseData = connection?.pendingSigns.get(request.uid);
    if (!responseData) {
      throw new ConnectorError({
        code: APIErrorCodes.API_INTERNAL_ERROR,
        info: `Sign request data is not available after confirmation (uid=${request.uid}). Please retry.`,
      });
    }
    const password = request.pw;
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
          responseData.resolve({ ok: signedTx });
        } catch (error) {
          responseData.resolve({ err: 'transaction signing failed' })
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
          responseData.resolve({ ok: signedTx.inputs[data.index] });
        } catch (error) {
          responseData.resolve({ err: 'transaction signing failed' })
        }
      }
        break;
      case 'tx/cardano':
      {
        try {
          const signedTx = await signCardanoTx(
            // $FlowFixMe[prop-missing]
            // $FlowFixMe[incompatible-exact]
            (request.tx: CardanoTx),
            password,
            request.tabId
          );
          responseData.resolve({ ok: signedTx });
        } catch (error) {
          responseData.resolve({ err: 'transaction signing failed' })
        }
      }
        break;
      case 'data':
        // mocked data sign
        responseData.resolve({ err: 'Generic data signing is not implemented yet' });
        break;
      default:
        // log?
        break;
    }
    connection.pendingSigns.delete(request.uid);
  } else if (request.type === 'sign_rejected') {
    const connection = connectedSites.get(request.tabId);
    const responseData = connection?.pendingSigns.get(request.uid);
    if (connection && responseData) {
      responseData.resolve({
        err: {
          code: 2,
          info: 'User rejected'
        }
      });
      connection.pendingSigns.delete(request.uid);
    } else {
      // eslint-disable-next-line no-console
      console.error(`couldn't find tabId: ${request.tabId} in ${JSON.stringify(connectedSites.entries())}`);
    }
  } else if (request.type === 'tx_sign_window_retrieve_data') {
    for (const [tabId, connection] of connectedSites) {
      for (const [/* uid */, responseData] of connection.pendingSigns.entries()) {
        if (!responseData.openedWindow) {
          responseData.openedWindow = true;
          if (connection.status?.publicDeriverId == null) {
            throw new Error(`${request.type} no public deriver set for request`);
          }
          sendResponse(({
            publicDeriverId: connection.status.publicDeriverId,
            sign: responseData.request,
            tabId
          }: SigningMessage));
          return;
        }
      }
    }
    // not sure if this should happen - close window if we can't find a tx to sign
    sendResponse(null);
  } else if (request.type === 'connect_retrieve_data') {
    for (const [tabId, connection] of connectedSites) {
      if (connection.status != null) {
        if (connection.status.resolve) {
          connection.status.openedWindow = true;
          sendResponse(({
            url: connection.url,
            protocol: connection.protocol,
            appAuthID: connection.appAuthID,
            imgBase64Url,
            tabId,
          }: ConnectingMessage));
        }
      }
    }
    sendResponse(null);
  } else if (request.type === 'remove_wallet_from_whitelist') {
    for (const [tabId, site] of connectedSites) {
      if (site.url === request.url) {
        const port = ports.get(tabId);
        if (port) {
          port.disconnect();
          ports.delete(tabId);
        }
        break;
      }
    }
  } else if (request.type === 'get_connected_sites') {
    const activeSites = []
    for (const value of connectedSites.values()){
      activeSites.push(value);
    }
    sendResponse(({
      sites: activeSites.map(site => site.url),
    }: ConnectedSites));
  } else if (request.type === 'get_protocol') {
    sendResponse({ type: connectionProtocol })
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
  connectedSites.delete(tabId);

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
): Promise<void | ({| ok: any |} | {| err: any |})> {
  const bounds = await getBoundsForTabWindow(tabId);
  return new Promise(resolve => {
    connectedSite.pendingSigns.set(request.uid, {
      request,
      openedWindow: false,
      resolve
    });
      chrome.windows.create({
        ...popupProps,
      url: chrome.extension.getURL(`/main_window_connector.html#/signin-transaction`),
      left: (bounds.width + bounds.positionX) - popupProps.width,
      top: bounds.positionY + 80,
    });
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
  tabId: number,
  connectParameters: {|
    url: string,
    requestIdentification?: boolean,
    onlySilent?: boolean,
    protocol: 'cardano' | 'ergo',
  |},
  localStorageApi: LocalStorageApi,
): Promise<{|
  connectedWallet: ?PublicDeriverId,
  auth: ?WalletAuthEntry,
|}> {
  const { url, requestIdentification, onlySilent, protocol } = connectParameters;
  const isAuthRequested = Boolean(requestIdentification);
  const appAuthID = isAuthRequested ? url : undefined;
  const [bounds, whitelistEntry] = await Promise.all([
    getBoundsForTabWindow(tabId),
    findWhitelistedConnection(url, requestIdentification, protocol, localStorageApi),
  ])
  return new Promise((resolve, reject) => {
    try {
      if (whitelistEntry != null) {
        // we already whitelisted this website, so no need to re-ask the user to confirm
        if (connectedSites.get(tabId) == null) {
          connectedSites.set(tabId, {
            url,
            protocol,
            appAuthID,
            status: {
              publicDeriverId: whitelistEntry.publicDeriverId,
              auth: isAuthRequested ? whitelistEntry.auth : undefined,
            },
            pendingSigns: new Map()
          });
        }
        resolve({
          connectedWallet: whitelistEntry.publicDeriverId,
          auth: isAuthRequested ? whitelistEntry.auth : undefined,
        });
        return;
      }
      if (Boolean(onlySilent) === true) {
        reject(new Error('[onlySilent:fail] No active connection'));
        return;
      }
      // website not on whitelist, so need to ask user to confirm connection
      connectedSites.set(tabId, {
        url,
        protocol,
        appAuthID,
        status: {
          resolve,
          openedWindow: false,
          publicDeriverId: null,
          auth: null,
        },
        pendingSigns: new Map()
      });
      chrome.windows.create({
        ...popupProps,
        url: chrome.extension.getURL('main_window_connector.html'),
        left: (bounds.width + bounds.positionX) - popupProps.width,
        top: bounds.positionY + 80,
      });
    } catch (e) {
      reject(e);
    }
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
          url: chrome.extension.getURL(`/main_window_connector.html#/settings`),
          left: (bounds.width + bounds.positionX) - popupProps.width,
          top: bounds.positionY + 80,
        });
      });
    }
  }
});

// per-page connection to injected code in the connector
chrome.runtime.onConnectExternal.addListener(port => {
  if (port.sender.id === environment.ergoConnectorExtensionId) {
    handleInjectorConnect(port);
  } else {
    // disconnect?
  }
});

// per-page connection to injected code by Yoroi with connector
chrome.runtime.onConnect.addListener(port => {
  handleInjectorConnect(port);
});

function handleInjectorConnect(port) {
  const tabId = port.sender.tab.id;
  ports.set(tabId, port);
  port.onMessage.addListener(async message => {

      connectionProtocol = message.protocol;
      const isCardano = connectionProtocol === 'cardano';

      imgBase64Url = message.imgBase64Url;
      function rpcResponse(response) {
        port.postMessage({
          type: 'connector_rpc_response',
          protocol: message.protocol,
          uid: message.uid,
          return: response
        });
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
          if (e?.stack != null) {
            Logger.error(`RPC call ${prot}.${func}(${args}) failed due to internal error: ${e}\n${e.stack}`);
          } else {
            Logger.error(`RPC call ${prot}.${func}(${args}) failed due to internal error: ${e}`);
          }
          rpcResponse({
            err: {
              code: APIErrorCodes.API_INTERNAL_ERROR,
              info: 'Yoroi has encountered an internal error - please see logs'
            }
          });
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
      const connectParameters = () => ({
        protocol: message.protocol,
        ...message.connectParameters,
      });
      if (message.type === 'yoroi_connect_request/ergo') {
        await withDb(
          async (_db, localStorageApi) => {
            const { connectedWallet } =
              (await confirmConnect(tabId, connectParameters(), localStorageApi)) ?? {};
            const accepted = connectedWallet != null;
            port.postMessage({
              type: 'yoroi_connect_response/ergo',
              success: accepted
            });
          }
        );
      } else if (message.type === 'yoroi_connect_request/cardano') {
        try {
          await withDb(
            async (_db, localStorageApi) => {
              const { connectedWallet, auth } =
                (await confirmConnect(tabId, connectParameters(), localStorageApi)) ?? {};
              const accepted = connectedWallet != null;
              port.postMessage({
                type: 'yoroi_connect_response/cardano',
                success: accepted,
                auth,
              });
            }
          );
        } catch (e) {
          port.postMessage({
            type: 'yoroi_connect_response/cardano',
            success: false,
            err: stringifyError(e),
          });
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
              port.postMessage({
                type: 'yoroi_connect_response/cardano',
                success: false,
                err: stringifyError(e),
              });
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
                      const resp = await confirmSign(tabId,
                        {
                          type: 'tx',
                          tx,
                          uid: message.uid
                        },
                        connection
                      );
                      rpcResponse(resp);
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
              await withDb(async (db, localStorageApi) => {
                await withSelectedWallet(
                  tabId,
                  async (wallet, connection) => {
                    if (connection == null) {
                      Logger.error(`ERR - sign_tx could not find connection with tabId = ${tabId}`);
                      rpcResponse(undefined); // shouldn't happen
                      return
                    }

                    await RustModule.load();
                    const { tx, partialSign, returnTx } = message.params[0];
                    const withUtxos = asGetAllUtxos(wallet)
                    if (withUtxos == null) {
                      throw new Error(`missing utxo functionality`);
                    }
                    const withHasUtxoChains = asHasUtxoChains(withUtxos);
                    if (withHasUtxoChains == null) {
                      throw new Error(`missing chains functionality`);
                    }
                    const utxos = await withHasUtxoChains.getAllUtxos();

                    const resp = await confirmSign(tabId,
                      {
                        type: 'tx/cardano',
                        tx: { tx, partialSign, utxos },
                        uid: message.uid
                      },
                      connection
                    );
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
                  },
                  db,
                  localStorageApi,
                )
              });
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
                    const resp = await confirmSign(tabId,
                      {
                        type: 'tx_input',
                        tx,
                        index: txIndex,
                        uid: message.uid
                      },
                      connection
                    );
                    rpcResponse(resp);
                  },
                  db,
                  localStorageApi,
                )
              });
            } catch (e) {
              handleError(e);
            }
            break;
          // unsupported until EIP-0012's definition is finalized
          // case 'sign_data':
          //   {
          //     const resp = await confirmSign(tabId, {
          //       type: 'data',
          //       address: message.params[0],
          //       bytes: message.params[1],
          //       uid: message.uid
          //     });
          //     rpcResponse(resp);
          //   }
          //   break;
          case 'get_balance':
            try {
              checkParamCount(1);
              const tokenId = asTokenId(message.params[0]);
              await withDb(async (db, localStorageApi) => {
                await withSelectedWallet(
                  tabId,
                  async (wallet) => {
                    const balance =
                      await connectorGetBalance(wallet, pendingTxs, tokenId, connectionProtocol);
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
                    let utxos;
                    if (isCardano) {
                      utxos = await connectorGetUtxosCardano(
                        wallet,
                        pendingTxs,
                        valueExpected,
                        tokenId,
                        paginate
                      );
                    } else {
                      utxos = await connectorGetUtxosErgo(
                        wallet,
                        pendingTxs,
                        valueExpected,
                        tokenId,
                        paginate
                      );
                    }
                    if (isCardano) {
                      // $FlowFixMe[prop-missing]
                      const cardanoUtxos: $ReadOnlyArray<$ReadOnly<RemoteUnspentOutput>> = utxos;
                      await RustModule.load();
                      const W4 = RustModule.WalletV4;
                      if (isCBOR) {
                        utxos = cardanoUtxos.map(u => {
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
                      } else {
                        utxos = cardanoUtxos.map(u => {
                          return {
                            ...u,
                            receiver: W4.Address.from_bytes(
                              Buffer.from(u.receiver, 'hex'),
                            ).to_bech32(),
                          };
                        });
                      }
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
                      id = await connectorSendTx(wallet, pendingTxs, tx, localStorageApi);
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
                  false,
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
              const connection = connectedSites.get(tabId);
              if (connection == null) {
                Logger.error(`ERR - sign_tx could not find connection with tabId = ${tabId}`);
                rpcResponse(undefined); // shouldn't happen
              } else {
                await withDb(async (db, localStorageApi) => {
                  return await withSelectedWallet(tabId,
                    async (wallet) => {
                      const resp = await connectorCreateCardanoTx(
                        wallet,
                        null,
                        message.params[0],
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
  });
}
