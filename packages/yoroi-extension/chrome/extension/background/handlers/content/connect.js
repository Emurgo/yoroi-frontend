// @flow
import { PublicDeriver, } from '../../../../../app/api/ada/lib/storage/models/PublicDeriver/index';
import type {
  PendingSignData,
  WalletAuthEntry,
  WhitelistEntry,
} from '../../../connector/types';
import type { RemoteUnspentOutput } from '../../../../../app/api/ada/lib/state-fetch/types';
import LocalStorageApi from '../../../../../app/api/localStorage/index';
import { stringifyError } from '../../../../../app/utils/logging';
import { sendToInjector, getBoundsForTabWindow, popupProps } from './utils';
import { getWallets } from '../../../../../app/api/common';
import { getDb, syncWallet } from '../../state';

declare var chrome;

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

export type SignContinuationDataType = {|
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
  uid: number,
|}

export type ConnectedSite = {|
  imgBase64Url: string,
  url: string,
  appAuthID?: string,
  status: ConnectedStatus,
  pendingSigns: {| [uid: string]: PendingSign |},
|};

const STORAGE_KEY_PREFIX = 'background-';

const STORAGE_API = chrome.storage.session // chrome mv3
  || window.browser?.storage.local // firefox mv2
  || chrome.storage.local; // chrome mv2

async function setInStorage(key: string, value: any): Promise<void> {
  await STORAGE_API.set({ [STORAGE_KEY_PREFIX + key]: value });
}

export async function getFromStorage(key: string): Promise<any> {
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

const STORAGE_KEY_CONNECTED_SITES = 'connectedSites';

export async function getAllConnectedSites(): Promise<{| [tabId: string]: ConnectedSite |}> {
  return (await getFromStorage(STORAGE_KEY_CONNECTED_SITES)) || {};
}

export async function getConnectedSite(tabId: number): Promise<?ConnectedSite> {
  const connectedSites = await getFromStorage(STORAGE_KEY_CONNECTED_SITES);
  if (!connectedSites) {
    return null;
  }
  return connectedSites[String(tabId)];
}

export async function deleteConnectedSite(tabId: number): Promise<void> {
  const connectedSites = await getFromStorage(STORAGE_KEY_CONNECTED_SITES) || {};
  delete connectedSites[String(tabId)];
  await setInStorage(STORAGE_KEY_CONNECTED_SITES, connectedSites);
}

export async function setConnectedSite(tabId: number, connectedSite: ConnectedSite): Promise<void> {
  const connectedSites = await getFromStorage(STORAGE_KEY_CONNECTED_SITES) || {};
  connectedSites[String(tabId)] = connectedSite;
  await setInStorage(STORAGE_KEY_CONNECTED_SITES, connectedSites);
}

export function connectContinuation(
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

export function connectError(
  tabId: number,
  error: Error,
){
  sendToInjector(
    tabId,
    {
      type: 'yoroi_connect_response/cardano',
      success: false,
      err: stringifyError(error),
    }
  );
}

export async function findWhitelistedConnection(
  url: string,
  requestIdentification?: boolean,
  localStorageApi: LocalStorageApi,
): Promise<?WhitelistEntry> {
  const isAuthRequested = Boolean(requestIdentification);
  const appAuthID = isAuthRequested ? url : undefined;
  const whitelist = await localStorageApi.getWhitelist() ?? [];
  return whitelist.find((entry: WhitelistEntry) => {
    // Whitelist is only matching if same auth or auth is not requested
    const matchingUrl = entry.url === url;
    const matchingAuthId = entry.appAuthID === appAuthID;
    const isAuthWhitelisted = entry.appAuthID != null;
    const isAuthPermitted = isAuthWhitelisted && matchingAuthId;
    return matchingUrl && (!isAuthRequested || isAuthPermitted);
  });
}

export type ConnectParameters = {|
  url: string,
  requestIdentification?: boolean,
  onlySilent?: boolean,
|};

async function confirmConnect(
  requestType: ConnectRequestType,
  tabId: number,
  connectParameters: ConnectParameters,
  localStorageApi: LocalStorageApi,
  imgBase64Url: string,
): Promise<void> {
  const { url, requestIdentification, onlySilent } = connectParameters;
  const isAuthRequested = Boolean(requestIdentification);
  const appAuthID = isAuthRequested ? url : undefined;
  const [bounds, whitelistEntry] = await Promise.all([
    getBoundsForTabWindow(tabId),
    findWhitelistedConnection(url, requestIdentification, localStorageApi),
  ])

  if (whitelistEntry != null) {
    // we already whitelisted this website, so no need to re-ask the user to confirm
    if (await getConnectedSite(tabId) == null) {
      await setConnectedSite(tabId, {
        url,
        imgBase64Url,
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
    imgBase64Url,
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

export async function getConnectedWallet(
  tabId: number, syncConnectedWallet: boolean
): Promise<PublicDeriver<>> {
  const db = await getDb();
  const wallets = await getWallets({ db });
  const connected = await getConnectedSite(tabId);
  if (!connected) {
    throw new Error(`could not find tabId ${tabId} in connected sites`);
  }
  if (typeof connected.status?.publicDeriverId !== 'number') {
    throw new Error('site not connected yet');
  }

  const { publicDeriverId } = connected?.status ?? {};
  const connectedWallet = wallets.find(
    wallet => wallet.getPublicDeriverId() === publicDeriverId
  );
  if (connectedWallet == null) {
    await deleteConnectedSite(tabId);
    // $FlowFixMe[incompatible-call]
    await removeWallet(tabId, publicDeriverId, new LocalStorageApi());
    throw new Error(`Public deriver index not found: ${String(publicDeriverId)}`);
  }
  if (syncConnectedWallet) {
    await syncWallet(connectedWallet, 'connector-call');
  }
  return connectedWallet;
}

export async function handleConnect(
  tabId: number,
  connectParameters: ConnectParameters,
  imgBase64Url: string,
) {
  const localStorageApi = new LocalStorageApi();
  try {
    await confirmConnect(
      'cardano-connect-request',
      tabId,
      connectParameters,
      localStorageApi,
      imgBase64Url,
    );
  } catch (error) {
    connectError(tabId, error);
  }
}
