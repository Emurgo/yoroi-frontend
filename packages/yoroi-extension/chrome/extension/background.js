// @flow
import debounce from 'lodash/debounce';

import { schema } from 'lovefield';
import type {
  lf$Database,
} from 'lovefield';
import {
  loadLovefieldDB,
} from '../../app/api/ada/lib/storage/database/index';
import {
  getWallets
} from '../../app/api/common/index';
import {
  PublicDeriver,
} from '../../app/api/ada/lib/storage/models/PublicDeriver/index';
import {
  asGetAllUtxos,
  asGetPublicKey,
} from '../../app/api/ada/lib/storage/models/PublicDeriver/traits';
import type {
  PendingSignData,
  PendingTransaction,
  RpcUid,
  AccountInfo,
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
  connectorGetUtxos,
  connectorSendTx,
  connectorSignTx,
  connectorGetUsedAddresses,
  connectorGetUnusedAddresses
} from './ergo-connector/api';
import { GenericApiError } from '../../app/api/common/errors';
import { isErgo, isCardanoHaskell, } from '../../app/api/ada/lib/storage/database/prepackaged/networks';
import { Bip44Wallet } from '../../app/api/ada/lib/storage/models/Bip44Wallet/wrapper';
import { walletChecksum, legacyWalletChecksum } from '@emurgo/cip4-js';
import type { WalletChecksum } from '@emurgo/cip4-js';
import { updateTransactions } from '../../app/api/ergo/lib/storage/bridge/updateTransactions';
import { environment } from '../../app/environment';
import { IFetcher } from '../../app/api/ergo/lib/state-fetch/IFetcher';
import { RemoteFetcher } from '../../app/api/ergo/lib/state-fetch/remoteFetcher';
import { BatchedFetcher } from '../../app/api/ergo/lib/state-fetch/batchedFetcher';
import LocalStorageApi from '../../app/api/localStorage/index';
import { RustModule } from '../../app/api/ada/lib/cardanoCrypto/rustLoader';
import { Logger } from '../../app/utils/logging';

/*::
declare var chrome;
*/

const onYoroiIconClicked = () => {
  chrome.tabs.create({ url: 'main_window.html' });
};

chrome.browserAction.onClicked.addListener(debounce(onYoroiIconClicked, 500, { leading: true }));

type PendingSign = {|
  // data needed to complete the request
  request: PendingSignData,
  // if an opened window has been created for this request to show the user
  openedWindow: boolean,
  // resolve function from signRequest's Promise
  resolve: any
|}

// This is a temporary workaround to DB duplicate key constraint violations
// that is happening when multiple DBs are loaded at the same time, or possibly
// this one being loaded while Yoroi's main App is doing DB operations.
let loadedDB: ?lf$Database = null;
let dbPromise: ?Promise<lf$Database> = null;

async function loadDB(): Promise<lf$Database> {
  if (loadedDB == null) {
    if (dbPromise == null) {
      dbPromise = loadLovefieldDB(schema.DataStoreType.INDEXED_DB)
        .then(db => {
          loadedDB = db;
          return Promise.resolve(loadedDB);
        });
    }
    return dbPromise;
  }
  return Promise.resolve(loadedDB);
}

type AccountIndex = number;

// AccountIndex = successfully connected - which account the user selected
// null = refused by user
type ConnectedStatus = ?AccountIndex | {|
  // response (?AccountIndex) - null means the user refused, otherwise the account they selected
  resolve: any,
  // if a window has fetched this to show to the user yet
  openedWindow: boolean,
|};

type ConnectedSite = {|
  url: string,
  status: ConnectedStatus,
  pendingSigns: Map<RpcUid, PendingSign>
|};

async function getChecksum(
  publicDeriver: ReturnType<typeof asGetPublicKey>,
): Promise<void | WalletChecksum> {
  if (publicDeriver == null) return undefined;

  const hash = (await publicDeriver.getPublicKey()).Hash;

  const isLegacyWallet =
    isCardanoHaskell(publicDeriver.getParent().getNetworkInfo()) &&
    publicDeriver.getParent() instanceof Bip44Wallet;
  const checksum = isLegacyWallet
    ? legacyWalletChecksum(hash)
    : walletChecksum(hash);

  return checksum;
}

type TabId = number;

const connectedSites: Map<TabId, ConnectedSite> = new Map();

// tabid => chrome.runtime.Port
const ports: Map<TabId, any> = new Map();


let pendingTxs: PendingTransaction[] = [];

export async function getWalletsInfo(): Promise<AccountInfo[]> {
  try {
    const db = await loadDB();
    const wallets = await getWallets({ db });
    // information about each wallet to show to the user
    const accounts = [];
    for (const wallet of wallets) {
      const conceptualWallet = wallet.getParent();
      const withPubKey = asGetPublicKey(wallet);

      const conceptualInfo = await conceptualWallet.getFullConceptualWalletInfo();
      if (isErgo(conceptualWallet.getNetworkInfo())) {
        const balance = await connectorGetBalance(wallet, pendingTxs, 'ERG');
        accounts.push({
          name: conceptualInfo.Name,
          balance: balance.toString(),
          checksum: await getChecksum(withPubKey)
        });
      }
    }
    return accounts;
  } catch (error) {
    throw new GenericApiError();
  }
}

export async function getStateFetcher(): Promise<IFetcher> {
  // I don't think it's worth it to cache this? We only need it for syncs and sending tx
  const localStorgeApi = new LocalStorageApi();
  const locale = await localStorgeApi.getUserLocale() ?? 'en-US';
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
async function syncWallet(wallet: PublicDeriver<>): Promise<void> {
  try {
    const lastSync = await wallet.getLastSyncInfo();
    // don't sync more than every 30 seconds
    const now = Date.now();
    if (lastSync.Time == null || now - lastSync.Time.getTime() > 30*1000) {
      if (syncing == null) {
        syncing = RustModule.load()
          .then(() => {
            Logger.debug('sync started');
            return getStateFetcher()
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
export function getActiveSites(): Array<string> {
  const activeSites = []
  for (const value of connectedSites.values()){
    activeSites.push(value);
  }
  return activeSites.map(item => item.url);
}

async function getSelectedWallet(tabId: number): Promise<PublicDeriver<>> {
  const db = await loadDB();
  const wallets = await getWallets({ db });
  const connected = connectedSites.get(tabId);
  if (connected) {
    const index = connected.status;
    if (typeof index === 'number') {
      if (index >= 0 && index < wallets.length) {
        const selectedWallet = wallets[index];
        await syncWallet(selectedWallet);
        return Promise.resolve(selectedWallet);
      }
      return Promise.reject(new Error(`wallet index out of bounds: ${index}`));
    }
    return Promise.reject(new Error('site not connected yet'));
  }
  return Promise.reject(new Error(`could not find tabId ${tabId} in connected sites`));
}

// messages from other parts of Yoroi (i.e. the UI for the connector)
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  async function signTxInputs(
    tx,
    indices: number[],
    password: string,
    tabId: number
  ): Promise<any> {
    const wallet = await getSelectedWallet(tabId);
    const canGetAllUtxos = await asGetAllUtxos(wallet);
    if (canGetAllUtxos == null) {
      throw new Error('could not get all utxos');
    }
    const utxos = await canGetAllUtxos.getAllUtxos();
    return connectorSignTx(wallet, password, utxos, tx, indices);
  }
  // alert(`received event: ${JSON.stringify(request)}`);
  if (request.type === 'connect_response') {
    const connection = connectedSites.get(request.tabId);
    if (connection && connection.status != null && typeof connection.status === 'object') {
      connection.status.resolve(request.accepted ? request.account : null);
      connection.status = request.account;
    }
  } else if (request.type === 'sign_confirmed') {
    const connection = connectedSites.get(request.tabId);
    const responseData = connection?.pendingSigns.get(request.uid);
    if (connection && responseData) {
      const password = request.pw;
      switch (responseData.request.type) {
        case 'tx':
          {
            const txToSign = request.tx;
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
            const txToSign = request.tx;
            const signedTx = await signTxInputs(txToSign, [request.index], password, request.tabId);
            responseData.resolve({ ok: signedTx.inputs[request.index] });
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
          sendResponse({
            sign: responseData.request,
            tabId
          });
          return;
        }
      }
    }
    // not sure if this should happen - close window if we can't find a tx to sign
    sendResponse(null);
  } else if (request.type === 'connect_retrieve_data') {
    for (const [tabId, connection] of connectedSites) {
      if (connection.status != null && typeof connection.status === 'object') {
        if (!connection.status.openedWindow) {
          connection.status.openedWindow = true;
          sendResponse({
            url: connection.url,
            tabId,
          });
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
  }
});

async function confirmSign(tabId: number, request: PendingSignData): Promise<any> {
  return new Promise(resolve => {
    const connection = connectedSites.get(tabId);
    if (connection) {
      connection.pendingSigns.set(request.uid, {
        request,
        openedWindow: false,
        resolve
      });
       chrome.windows.create({
        url: `${window.location.origin}/main_window_ergo.html#/signin-transaction`,
        width: 500,
        height: 700,
        focused: true,
        type: 'popup'
      });
    } else {
      // console.log(`ERR - confirmSign could not find connection with tabId = ${tabId}`);
    }
  });
}

async function confirmConnect(tabId: number, url: string): Promise<?AccountIndex> {
  return new Promise(resolve => {
    chrome.storage.local.get('connector_whitelist', async result => {
      const whitelist = Object.keys(result).length === 0 ? []
        : JSON.parse(result.connector_whitelist);
      Logger.info(`whitelist: ${JSON.stringify(whitelist)}`);
      const whitelistEntry = whitelist.find(entry => entry.url === url);
      if (whitelistEntry !== undefined) {
        connectedSites.set(tabId, {
          url,
          status: whitelistEntry.walletIndex,
          pendingSigns: new Map()
        });
        resolve(whitelistEntry.walletIndex);
      } else {
        connectedSites.set(tabId, {
          url,
          status: {
            resolve,
            openedWindow: false,
          },
          pendingSigns: new Map()
        });
        chrome.windows.create({
          url: 'main_window_ergo.html',
          width: 500,
          height: 700,
          focused: true,
          type: 'popup'
        });
      }
    });
  });
}

// generic communication to the entire connector
chrome.runtime.onMessageExternal.addListener((message, sender) => {
  if (sender.id === environment.ergoConnectorExtensionId) {
    if (message.type === 'open_browseraction_menu') {
      chrome.windows.create({
        url: `${window.location.origin}/main_window_ergo.html#/settings`,
        width: 500,
        height: 700,
        focused: true,
        type: 'popup'
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
      function rpcResponse(response) {
        port.postMessage({
          type: 'connector_rpc_response',
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
      if (message.type === 'yoroi_connect_request') {
        const account = await confirmConnect(tabId, message.url);
        const accepted = account !== null;
        port.postMessage({
          type: 'yoroi_connect_response',
          success: accepted
        });
      } else if (message.type === 'connector_rpc_request') {
        switch (message.function) {
          case 'sign_tx':
            try {
              checkParamCount(1);
              const tx = asTx(message.params[0]);
              const resp = await confirmSign(tabId, {
                type: 'tx',
                tx,
                uid: message.uid
              });
              rpcResponse(resp);
            } catch (e) {
              handleError(e);
            }
            break;
          case 'sign_tx_input':
            try {
              checkParamCount(2);
              const tx = asTx(message.params[0]);
              const txIndex = message.params[1];
              if (typeof txIndex !== 'number') {
                throw ConnectorError.invalidRequest(`invalid tx input: ${txIndex}`);
              }
              const resp = await confirmSign(tabId, {
                type: 'tx_input',
                tx,
                index: txIndex,
                uid: message.uid
              });
              rpcResponse(resp);
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
              const wallet = await getSelectedWallet(tabId);
              const balance = await connectorGetBalance(wallet, pendingTxs, tokenId);
              rpcResponse({ ok: balance });
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
              const wallet = await getSelectedWallet(tabId);
              const utxos = await connectorGetUtxos(
                wallet,
                pendingTxs,
                valueExpected,
                tokenId,
                paginate
              );
              rpcResponse({
                ok: utxos
              });
            } catch (e) {
              handleError(e);
            }
            break;
          case 'get_used_addresses':
            try {
              const paginate = message.params[0] == null ? null : asPaginate(message.params[0]);
              const wallet = await getSelectedWallet(tabId);
              const addresses = await connectorGetUsedAddresses(wallet, paginate);
              rpcResponse({
                ok: addresses
              });
            } catch (e) {
              handleError(e);
            }
            break;
          case 'get_unused_addresses':
            try {
              const wallet = await getSelectedWallet(tabId);
              const addresses = await connectorGetUnusedAddresses(wallet);
              rpcResponse({
                ok: addresses
              });
            } catch (e) {
              handleError(e);
            }
            break;
          case `get_change_address`:
            try {
              const wallet = await getSelectedWallet(tabId);
              const change = await connectorGetChangeAddress(wallet);
              rpcResponse({
                ok: change
              });
            } catch (e) {
              handleError(e);
            }
            break;
          case 'submit_tx':
            try {
              const tx = asSignedTx(message.params[0]);
              const wallet = await getSelectedWallet(tabId);
              const id = await connectorSendTx(wallet, pendingTxs, tx);
              rpcResponse({
                ok: id
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
