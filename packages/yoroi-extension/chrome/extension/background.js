// @flow
import debounce from 'lodash/debounce';

import {
  getWallets
} from '../../app/api/common/index';
import {
  PublicDeriver,
} from '../../app/api/ada/lib/storage/models/PublicDeriver/index';
import {
  asGetAllUtxos,
} from '../../app/api/ada/lib/storage/models/PublicDeriver/traits';
import type {
  PendingSignData,
  PendingTransaction,
  SigningMessage,
  ConnectingMessage,
  ConnectedSites,
  RpcUid,
  ConnectResponseData,
  ConfirmedSignData,
  FailedSignData,
  TxSignWindowRetrieveData,
  ConnectRetrieveData,
  RemoveWalletFromWhitelistData,
  GetConnectedSitesData,
  Tx,
  CardanoTx,
} from './ergo-connector/types';
import {
  APIErrorCodes,
  ConnectorError,
  asTokenId,
  asValue,
  asTx,
  asSignedTx,
  asPaginate,
} from './ergo-connector/types';
import {
  connectorGetBalance,
  connectorGetChangeAddress,
  connectorGetUtxosErgo,
  connectorSendTx,
  connectorSendTxCardano,
  connectorSignTx,
  connectorSignCardanoTx,
  connectorGetUsedAddresses,
  connectorGetUnusedAddresses,
  connectorGetUtxosCardano
} from './ergo-connector/api';
import { updateTransactions } from '../../app/api/ergo/lib/storage/bridge/updateTransactions';
import { environment } from '../../app/environment';
import { IFetcher } from '../../app/api/ergo/lib/state-fetch/IFetcher';
import { RemoteFetcher } from '../../app/api/ergo/lib/state-fetch/remoteFetcher';
import { BatchedFetcher } from '../../app/api/ergo/lib/state-fetch/batchedFetcher';
import LocalStorageApi from '../../app/api/localStorage/index';
import { RustModule } from '../../app/api/ada/lib/cardanoCrypto/rustLoader';
import { Logger } from '../../app/utils/logging';
import { schema } from 'lovefield';
import type {
  lf$Database,
} from 'lovefield';
import {
  loadLovefieldDB,
  copyDbToMemory,
} from '../../app/api/ada/lib/storage/database/index';
import { migrateNoRefresh } from '../../app/api/common/migration';
import { Mutex, } from 'async-mutex';
import { isCardanoHaskell } from '../../app/api/ada/lib/storage/database/prepackaged/networks';


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
  publicDeriverId: PublicDeriverId
|} | {|
  // response (?PublicDeriverId) - null means the user refused, otherwise the account they selected
  resolve: ?PublicDeriverId => void,
  // if a window has fetched this to show to the user yet
  openedWindow: boolean,
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

type ConnectedSite = {|
  url: string,
  status: ConnectedStatus,
  pendingSigns: Map<RpcUid, PendingSign>
|};

let  connectionProtocol = ''

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


async function getStateFetcher(
  localStorageApi: LocalStorageApi,
): Promise<IFetcher> {
  const locale = await localStorageApi.getUserLocale() ?? 'en-US';
  return Promise.resolve(new BatchedFetcher(new RemoteFetcher(
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
  )));
}

// This is a temporary workaround to DB duplicate key constraint violations
// that is happening when multiple DBs are loaded at the same time, or possibly
// this one being loaded while Yoroi's main App is doing DB operations.
// Promise<void>
let syncing: ?Promise<void> = null;
async function syncWallet(
  wallet: PublicDeriver<>,
  localStorageApi: LocalStorageApi,
): Promise<void> {
  try {
    const lastSync = await wallet.getLastSyncInfo();
    // don't sync more than every 30 seconds
    const now = Date.now();
    if (lastSync.Time == null || now - lastSync.Time.getTime() > 30*1000) {
      if (syncing == null) {
        syncing = RustModule.load()
          .then(() => {
            Logger.debug('sync started');
            return getStateFetcher(localStorageApi)
          })
          .then(stateFetcher => updateTransactions(
            wallet.getDb(),
            wallet,
            stateFetcher.checkAddressesInUse,
            stateFetcher.getTransactionsHistoryForAddresses,
            stateFetcher.getAssetInfo,
            stateFetcher.getBestBlock))
          .then(() => {
            // to be safe we filter possibly accepted txs for up to 10 minutes
            // this could be accepted in a variable amount of time due to Ergo's PoW
            // but this is probably an okay amount. If it was not accepted then at worst
            // the values are just temporarily withheld for a few minutes too long,
            // and if it was accepted, then none of the UTXOs held would have been
            // reuseable anyway.
            pendingTxs = pendingTxs.filter(
              pendingTx => Date.now() - pendingTx.submittedTime.getTime() <= 10*60*1000);
            Logger.debug('sync ended');
            return Promise.resolve();
          });
      }
      syncing = await syncing;
    }
  } catch (e) {
    Logger.error(`Syncing failed: ${e}`);
  }
}

async function withSelectedWallet<T>(
  tabId: number,
  continuation: PublicDeriver<> => Promise<T>,
  db: lf$Database,
  localStorageApi: LocalStorageApi,
): Promise<T> {
  const wallets = await getWallets({ db });
  const connected = connectedSites.get(tabId);
  if (connected) {
    if (typeof connected.status?.publicDeriverId === 'number') {
      const { publicDeriverId } = connected.status;
      const selectedWallet = wallets.find(
        cache => cache.getPublicDeriverId() === publicDeriverId
      );
      if (selectedWallet == null) {
        connectedSites.delete(tabId);
        await removeWallet(tabId, publicDeriverId, localStorageApi);
        return Promise.reject(new Error(`Public deriver index not found: ${publicDeriverId}`));
      }
      await syncWallet(selectedWallet, localStorageApi);

      // we need to make sure this runs within the withDb call
      // since the publicDeriver contains a DB reference inside it
      return await continuation(selectedWallet);
    }
    return Promise.reject(new Error('site not connected yet'));
  }
  return Promise.reject(new Error(`could not find tabId ${tabId} in connected sites`));
}

// messages from other parts of Yoroi (i.e. the UI for the connector)
chrome.runtime.onMessage.addListener(async (
  request: (
    ConnectResponseData |
    ConfirmedSignData |
    FailedSignData |
    TxSignWindowRetrieveData |
    ConnectRetrieveData |
    RemoveWalletFromWhitelistData |
    GetConnectedSitesData
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
            getStateFetcher(localStorageApi)
              .then(f => f.getBestBlock({ network })),
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
    if (connection && connection.status != null && connection.status.resolve != null) {
      if (request.accepted === true) {
        connection.status.resolve(request.publicDeriverId);
        connection.status = {
          publicDeriverId: request.publicDeriverId,
        };
      } else {
        connection.status.resolve(null);
        connectedSites.delete(tabId);
      }
    }
  } else if (request.type === 'sign_confirmed') {
    const connection = connectedSites.get(request.tabId);
    const responseData = connection?.pendingSigns.get(request.uid);
    if (connection && responseData) {
      const password = request.pw;
      switch (responseData.request.type) {
        case 'tx':
          {
            // We know `tx` is a `Tx` here
            // $FlowFixMe[prop-missing]
            const txToSign: Tx = request.tx;
            const allIndices = [];
            for (let i = 0; i < txToSign.inputs.length; i += 1) {
              allIndices.push(i);
            }
            const signedTx = await signTxInputs(txToSign, allIndices, password, request.tabId);
            responseData.resolve({ ok: signedTx });
          }
          break;
        case 'tx_input':
          {
            const data = responseData.request;
            // $FlowFixMe[prop-missing]
            const txToSign: Tx = request.tx;
            const signedTx = await signTxInputs(
              txToSign,
              [data.index],
              password,
              request.tabId
            );
            responseData.resolve({ ok: signedTx.inputs[data.index] });
          }
          break;
        case 'tx/cardano':
          {
            const signedTx = await signCardanoTx(
              // $FlowFixMe[prop-missing]
              // $FlowFixMe[incompatible-cast]
              (request.tx.tx: CardanoTx),
              password,
              request.tabId
            );
            responseData.resolve({ ok: signedTx });
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
    }
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
});

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
      url: chrome.extension.getURL(`/main_window_ergo.html#/signin-transaction`),
      left: (bounds.width + bounds.positionX) - popupProps.width,
      top: bounds.positionY + 80,
    });
  });
}

async function confirmConnect(
  tabId: number,
  url: string,
  localStorageApi: LocalStorageApi,
): Promise<?PublicDeriverId> {
  const bounds = await getBoundsForTabWindow(tabId);
  const whitelist = await localStorageApi.getWhitelist() ?? [];
  return new Promise(resolve => {
    Logger.info(`whitelist: ${JSON.stringify(whitelist)}`);
    const whitelistEntry = whitelist.find(entry => entry.url === url);
    if (whitelistEntry !== undefined) {
      // we already whitelisted this website, so no need to re-ask the user to confirm
      connectedSites.set(tabId, {
        url,
        status: {
          publicDeriverId: whitelistEntry.publicDeriverId,
        },
        pendingSigns: new Map()
      });
      resolve(whitelistEntry.publicDeriverId);
    } else {
      // website not on whitelist, so need to ask user to confirm connection
      connectedSites.set(tabId, {
        url,
        status: {
          resolve,
          openedWindow: false,
        },
        pendingSigns: new Map()
      });
      chrome.windows.create({
        ...popupProps,
        url: chrome.extension.getURL('main_window_ergo.html'),
        left: (bounds.width + bounds.positionX) - popupProps.width,
        top: bounds.positionY + 80,
      });
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
          url: chrome.extension.getURL(`/main_window_ergo.html#/settings`),
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
    const tabId = port.sender.tab.id;
    ports.set(tabId, port);
    port.onMessage.addListener(async message => {
      connectionProtocol = message.protocol
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
          const func = message.function;
          const args = message.params.map(JSON.stringify).join(', ');
          if (e?.stack != null) {
            Logger.error(`RPC call ergo.${func}(${args}) failed due to internal error: ${e}\n${e.stack}`);
          } else {
            Logger.error(`RPC call ergo.${func}(${args}) failed due to internal error: ${e}`);
          }
          rpcResponse({
            err: {
              code: APIErrorCodes.API_INTERNAL_ERROR,
              info: 'Yoroi has encountered an internal error - please see logs'
            }
          });
        }
      }
      if (message.type === 'yoroi_connect_request/ergo') {
        await withDb(
          async (_db, localStorageApi) => {
            const publicDeriverId = await confirmConnect(tabId, message.url, localStorageApi);
            const accepted = publicDeriverId !== null;
            port.postMessage({
              type: 'yoroi_connect_response/ergo',
              success: accepted
            });
          }
        );
      } else if (message.type === 'yoroi_connect_request/cardano') {
        await withDb(
          async (_db, localStorageApi) => {
            const publicDeriverId = await confirmConnect(tabId, message.url, localStorageApi);
            const accepted = publicDeriverId !== null;
            port.postMessage({
              type: 'yoroi_connect_response/cardano',
              success: accepted
            });
          }
        );
      } else if (message.type === 'connector_rpc_request') {
        switch (message.function) {
          case 'sign_tx':
            try {
              checkParamCount(1);
              await RustModule.load();
              const tx = asTx(message.params[0], RustModule.SigmaRust);
              const connection = connectedSites.get(tabId);
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
            } catch (e) {
              handleError(e);
            }
          break;
          case 'sign_tx/cardano':
            try {
              checkParamCount(1);
              await RustModule.load();
              const connection = connectedSites.get(tabId);
              if (connection == null) {
                Logger.error(`ERR - sign_tx could not find connection with tabId = ${tabId}`);
                rpcResponse(undefined); // shouldn't happen
              } else {
                const resp = await confirmSign(tabId,
                  {
                    type: 'tx/cardano',
                    tx: {
                      tx: message.params[0],
                      partialSign: message.params[1],
                    },
                    uid: message.uid
                  },
                  connection
                );
                rpcResponse(resp);
              }
            } catch (e) {
              handleError(e);
            }
          break;
          case 'sign_tx_input':
            try {
              checkParamCount(2);
              await RustModule.load();
              const tx = asTx(message.params[0], RustModule.SigmaRust);
              const txIndex = message.params[1];
              if (typeof txIndex !== 'number') {
                throw ConnectorError.invalidRequest(`invalid tx input: ${txIndex}`);
              }
              const connection = connectedSites.get(tabId);
              if (connection == null) {
                Logger.error(`ERR - sign_tx could not find connection with tabId = ${tabId}`);
                rpcResponse(undefined); // shouldn't happen
              } else {
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
              }
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
                    const balance = await connectorGetBalance(wallet, pendingTxs, tokenId);
                    rpcResponse({ ok: balance });
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
                    const walletType = wallet.parent.defaultToken.Metadata.type
                    let utxos;
                    if(walletType === 'Cardano') {
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
                    rpcResponse({
                      ok: utxos
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
          case 'get_used_addresses':
            try {
              const paginate = message.params[0] == null ? null : asPaginate(message.params[0]);

              await withDb(async (db, localStorageApi) => {
                await withSelectedWallet(
                  tabId,
                  async (wallet) => {
                    const addresses = await connectorGetUsedAddresses(wallet, paginate);
                    rpcResponse({
                      ok: addresses
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
          case 'get_unused_addresses':
            try {
              await withDb(async (db, localStorageApi) => {
                await withSelectedWallet(
                  tabId,
                  async (wallet) => {
                    const addresses = await connectorGetUnusedAddresses(wallet);
                    rpcResponse({
                      ok: addresses
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
          case `get_change_address`:
            try {
              await withDb(async (db, localStorageApi) => {
                await withSelectedWallet(
                  tabId,
                  async (wallet) => {
                    const change = await connectorGetChangeAddress(wallet);
                    rpcResponse({
                      ok: change
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
                    } else { // is Ergo
                      const tx = asSignedTx(message.params[0], RustModule.SigmaRust);
                      id = await connectorSendTx(wallet, pendingTxs, tx, localStorageApi);
                    }
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
  } else {
    // disconnect?
  }
});
