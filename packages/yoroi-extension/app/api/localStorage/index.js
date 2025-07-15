// @flow
import type { SelectedExternalStorageProvider } from '../../domain/ExternalStorage';
import environment from '../../environment';
import type { UnitOfAccountSettingType } from '../../types/unitOfAccountType';
import { DEFAULT_CURRENCY_PAIR } from '../../types/unitOfAccountType';

import { getLocalItem, isEmptyStorage, removeLocalItem, setLocalItem } from './primitives';
import { TabIdKeys } from '../../utils/tabManager';
import type { ComplexityLevelType } from '../../types/complexityLevelType';
import type { WhitelistEntry } from '../../../chrome/extension/connector/types';
import type { CatalystRoundInfoResponse } from '../ada/lib/state-fetch/types';
import type { CardanoShelleyTransactionCtorData } from '../../domain/CardanoShelleyTransaction';
import { deserializeTransactionCtorData } from '../../domain/CardanoShelleyTransaction';
import { maybe } from '../../coreUtils';
import type { StorageAPI } from '@emurgo/yoroi-lib/dist/flags';
import { networks } from '../ada/lib/storage/database/prepackaged/networks';

const networkForLocalStorage = String(environment.getNetworkName());
const storageKeys = {
  USER_LOCALE: networkForLocalStorage + '-USER-LOCALE',
  URI_SCHEME_ACCEPTANCE: networkForLocalStorage + '-URI-SCHEME-ACCEPTANCE',
  COMPLEXITY_LEVEL: networkForLocalStorage + '-COMPLEXITY-LEVEL',
  IS_USER_MIGRATED_TO_REVAMP: 'IS_USER_MIGRATED_TO_REVAMP',
  LAST_ANNOUNCED_FEATURE_VERSION: 'LAST_ANNOUNCED_FEATURE_VERSION',
  TESTNET_MODAL_DISPLAYED: 'TESTNET_MODAL_DISPLAYED',
  VERSION: networkForLocalStorage + '-LAST-LAUNCH-VER',
  HIDE_BALANCE: networkForLocalStorage + '-HIDE-BALANCE',
  UNIT_OF_ACCOUNT: networkForLocalStorage + '-UNIT-OF-ACCOUNT',
  COIN_PRICE_PUB_KEY_DATA: networkForLocalStorage + '-COIN-PRICE-PUB-KEY-DATA',
  EXTERNAL_STORAGE: networkForLocalStorage + '-EXTERNAL-STORAGE',
  TOGGLE_SIDEBAR: networkForLocalStorage + '-TOGGLE-SIDEBAR',
  SUBMITTED_TRANSACTIONS: 'submittedTransactions',
  CATALYST_ROUND_INFO: networkForLocalStorage + '-CATALYST_ROUND_INFO',
  FLAGS: networkForLocalStorage + '-FLAGS',
  USER_THEME: networkForLocalStorage + '-USER-THEME',
  PORTFOLIO_FIAT_PAIR: '-PORTFOLIO_FIAT_PAIR',
  NOTIFICATIONS_ENABLED: networkForLocalStorage + '-NOTIFICATIONS_ENABLED_PER_WALLET',
  BUY_SELL_DISCLAIMER: networkForLocalStorage + '-BUY_SELL_DISCLAIMER',
  BRING_SANDBOX: networkForLocalStorage + '-BRING_SANDBOX',
  BRING_BANNER_CLOSED: networkForLocalStorage + '-BRING_BANNER_CLOSED',
  MIDNIGHT_MODAL_CLOSED: networkForLocalStorage + '-MIDNIGHT_MODAL_CLOSED',
  DREP_YOROI_BANNER: networkForLocalStorage + '-DREP_YOROI_BANNER',
  CURRENT_NETWORK_ID: networkForLocalStorage + '-CURRENT_NETWORK_ID',
  WALLET_LIST_ORDER: networkForLocalStorage + '-WALLET_LIST_ORDER',
  SELECTED_WALLET_PUBLIC_KEY: networkForLocalStorage + '_SELECTED_WALLET_PUBLIC_KEY',

  // ========== CONNECTOR   ========== //
  DAPP_CONNECTOR_WHITELIST: 'connector_whitelist',

  IS_ANALYTICS_ALLOWED: networkForLocalStorage + '-IS_ANALYTICS_ALLOWED',
  ACCEPTED_TOS_VERSION: networkForLocalStorage + '-ACCEPTED_TOS_VERSION',

  // ========== LEGACY USED FOR MIGRATIONS ========== //
  CUSTOM_THEME: networkForLocalStorage + '-CUSTOM-THEME',
  THEME: networkForLocalStorage + '-THEME',

  CASHBACK_WALLET_ID: 'CASHBACK_WALLET_ID',
  SHOWN_DISCLAIMERS: 'SHOWN_DISCLAIMERS',
  WALLETS_NAVIGATION: networkForLocalStorage + '-WALLETS-NAVIGATION',
  SELECTED_WALLET: 'SELECTED_WALLET',
  PUSH_NOTIFICATION_METADATA: 'PUSH_NOTIFICATION_METADATA',
};

export type SetCustomUserThemeRequest = {|
  cssCustomPropObject: Object,
|};

export type WalletsNavigation = {|
  cardano: number[],
|};

type Disclaimer = 'cashback' | 'buySellAda' | 'swap';

export type PushNotificationMetadata = {|
  duration?: number,
|};
/**
 * This api layer provides access to the electron local storage
 * for user settings that are not synced with any coin backend.
 */

export default class LocalStorageApi {
  // ========== Locale ========== //

  getUserLocale: void => Promise<?string> = () => getLocalItem(storageKeys.USER_LOCALE);

  setUserLocale: string => Promise<void> = locale => setLocalItem(storageKeys.USER_LOCALE, locale);

  unsetUserLocale: void => Promise<void> = () => removeLocalItem(storageKeys.USER_LOCALE);

  // ========== URI Scheme acceptance ========== //

  getUriSchemeAcceptance: void => Promise<boolean> = () =>
    getLocalItem(storageKeys.URI_SCHEME_ACCEPTANCE).then(accepted => {
      if (accepted !== 'true') return false;
      return JSON.parse(accepted);
    });

  setUriSchemeAcceptance: void => Promise<void> = () => setLocalItem(storageKeys.URI_SCHEME_ACCEPTANCE, JSON.stringify(true));

  unsetUriSchemeAcceptance: void => Promise<void> = () => removeLocalItem(storageKeys.URI_SCHEME_ACCEPTANCE);

  // ========== Level Complexity ========== //
  getComplexityLevel: void => Promise<?ComplexityLevelType> = () =>
    getLocalItem(storageKeys.COMPLEXITY_LEVEL).then(level => {
      if (level == null) return null;
      return JSON.parse(level);
    });

  setComplexityLevel: ComplexityLevelType => Promise<void> = (level: ComplexityLevelType) =>
    setLocalItem(storageKeys.COMPLEXITY_LEVEL, JSON.stringify(level));

  unsetComplexityLevel: void => Promise<void> = () => removeLocalItem(storageKeys.COMPLEXITY_LEVEL);

  // ========== User Theme Mode========== //

  getUserThemeMode: void => Promise<?string> = () => getLocalItem(storageKeys.USER_THEME);

  setUserThemeMode: string => Promise<void> = theme => setLocalItem(storageKeys.USER_THEME, theme);

  // ========== Dred Yoroi Banner ========== //

  getDrepYoroiBanerTimestamp: void => Promise<?string> = () => getLocalItem(storageKeys.DREP_YOROI_BANNER);

  setDrepYoroiBanerTimestamp: string => Promise<void> = timestamp => setLocalItem(storageKeys.DREP_YOROI_BANNER, timestamp);

  unsetDrepYoroiBanerTimestamp: void => Promise<void> = () => removeLocalItem(storageKeys.DREP_YOROI_BANNER);

  // ========== Portfolio FIAT Pair ========== //

  getPortfolioFiatPair: number => Promise<?string> = networkId =>
    getLocalItem(String(networkId) + storageKeys.PORTFOLIO_FIAT_PAIR);

  setSetPortfolioFiatPair: (number, string) => Promise<void> = (networkId, pair) =>
    setLocalItem(String(networkId) + storageKeys.PORTFOLIO_FIAT_PAIR, pair);

  unsetPortfolioFiatPair: number => Promise<void> = networkId =>
    removeLocalItem(String(networkId) + storageKeys.PORTFOLIO_FIAT_PAIR);

  // ========== Notifications Setting ========== //

  getNotificationsSetting: void => Promise<?string> = () => getLocalItem(storageKeys.NOTIFICATIONS_ENABLED);

  setNotificationsSetting: string => Promise<void> = allowed => setLocalItem(storageKeys.NOTIFICATIONS_ENABLED, allowed);

  unsetNotificationsSetting: void => Promise<void> = () => removeLocalItem(storageKeys.NOTIFICATIONS_ENABLED);

  // ========== Bring Banner ========== //
  getBringBannerClosed: void => Promise<?string> = () => getLocalItem(storageKeys.BRING_BANNER_CLOSED);

  setBringBannerClosed: string => Promise<void> = closed => setLocalItem(storageKeys.BRING_BANNER_CLOSED, closed);

  unsetBringBannerClosed: void => Promise<void> = () => removeLocalItem(storageKeys.BRING_BANNER_CLOSED);

  // ========== Midnight Modal ========== //
  getMidnightModalClosed: void => Promise<?string> = () => getLocalItem(storageKeys.MIDNIGHT_MODAL_CLOSED);

  setMidnightModalClosed: string => Promise<void> = closed => setLocalItem(storageKeys.MIDNIGHT_MODAL_CLOSED, closed);

  unsetMidnightModalClosed: void => Promise<void> = () => removeLocalItem(storageKeys.MIDNIGHT_MODAL_CLOSED);

  // ========== Buy/Sell Disclaimer ========== //
  getBuySellDisclaimer: void => Promise<?string> = () => getLocalItem(storageKeys.BUY_SELL_DISCLAIMER);

  setBuySellDisclaimer: string => Promise<void> = accepted => setLocalItem(storageKeys.BUY_SELL_DISCLAIMER, accepted);

  unsetBuySellDisclaimer: void => Promise<void> = () => removeLocalItem(storageKeys.BUY_SELL_DISCLAIMER);

  // ========== Testnet Modal Info  ========== //
  getTestnetModalDisplayed: void => Promise<boolean> = async () =>
    (await getLocalItem(storageKeys.TESTNET_MODAL_DISPLAYED)) === 'true';

  setTestnetModalDisplayed: boolean => Promise<void> = accepted =>
    setLocalItem(storageKeys.TESTNET_MODAL_DISPLAYED, String(accepted));

  unsetTestnetModalDisplayed: void => Promise<void> = () => removeLocalItem(storageKeys.TESTNET_MODAL_DISPLAYED);

  // ========== Theme Migration ========== //

  getUserRevampMigrationStatus: void => Promise<boolean> = async () =>
    (await getLocalItem(storageKeys.IS_USER_MIGRATED_TO_REVAMP)) === 'true';

  setUserRevampMigrationStatus: boolean => Promise<void> = status =>
    setLocalItem(storageKeys.IS_USER_MIGRATED_TO_REVAMP, status.toString());

  // ========== Updates Announcement  ========== //

  getLastAnnouncedFeatureVersion: void => Promise<string> = async () =>
    (await getLocalItem(storageKeys.LAST_ANNOUNCED_FEATURE_VERSION)) ?? '';

  setLastAnnouncedFeatureVersion: string => Promise<void> = version =>
    setLocalItem(storageKeys.LAST_ANNOUNCED_FEATURE_VERSION, String(version));

  // ========== Legacy Select Wallet ========== //

  getSelectedWalletId: void => Promise<number | null> = async () => {
    let id = await getLocalItem(storageKeys.SELECTED_WALLET);
    if (!id) {
      id = window.localStorage?.getItem(storageKeys.SELECTED_WALLET);
      if (!/^\d+$/.test(id)) {
        id = null;
      }
    }

    if (!id) {
      return null;
    }
    if (isNaN(Number(id))) throw new Error(`Invalid wallet Id: ${id}`);
    return Number(id);
  };

  // ========== Selected Wallet ========== //
  getSelectedWalletPublicKey: void => Promise<?string> = async () => {
    return await getLocalItem(storageKeys.SELECTED_WALLET_PUBLIC_KEY);
  };

  setSelectedWalletPublicKey: string => Promise<void> = async publicKey => {
    await setLocalItem(storageKeys.SELECTED_WALLET_PUBLIC_KEY, publicKey);
  };

  // ========== Legacy Theme ========== //

  hasAnyLegacyThemeFlags: void => Promise<boolean> = async () => {
    const [a, b] = await Promise.all([getLocalItem(storageKeys.THEME), getLocalItem(storageKeys.CUSTOM_THEME)]);
    return a != null || b != null;
  };

  unsetLegacyThemeFlags: void => Promise<void> = async () => {
    await Promise.all([removeLocalItem(storageKeys.THEME), removeLocalItem(storageKeys.CUSTOM_THEME)]);
  };

  // ========== Last Launch Version Number ========== //

  getLastLaunchVersion: void => Promise<string> = () =>
    getLocalItem(storageKeys.VERSION).then(versionNum => {
      if (versionNum == null) return '0.0.0';
      return versionNum;
    });

  setLastLaunchVersion: string => Promise<void> = (version: string) => setLocalItem(storageKeys.VERSION, version);

  unsetLastLaunchVersion: void => Promise<void> = () => removeLocalItem(storageKeys.VERSION);

  isEmpty: void => Promise<boolean> = () => isEmptyStorage();

  clear: void => Promise<void> = async () => {
    const storage = JSON.parse(await this.getStorage());
    const tabKeys = new Set(Object.values(TabIdKeys));
    await Promise.all(
      Object.keys(storage).map(async key => {
        // changing this key would cause the tab to close
        if (!tabKeys.has(key)) {
          await removeLocalItem(key);
        }
      })
    );
  };

  // ========== Show/hide Balance ========== //

  getHideBalance: void => Promise<boolean> = () =>
    getLocalItem(storageKeys.HIDE_BALANCE).then(accepted => {
      if (accepted !== 'true') return false;
      return JSON.parse(accepted);
    });

  setHideBalance: boolean => Promise<void> = hideBalance => setLocalItem(storageKeys.HIDE_BALANCE, JSON.stringify(!hideBalance));

  unsetHideBalance: void => Promise<void> = () => removeLocalItem(storageKeys.HIDE_BALANCE);

  // ========== Expand / retract Sidebar ========== //

  getToggleSidebar: void => Promise<boolean> = () =>
    getLocalItem(storageKeys.TOGGLE_SIDEBAR).then(accepted => {
      if (accepted !== 'true') return false;
      return JSON.parse(accepted);
    });

  setToggleSidebar: boolean => Promise<void> = toggleSidebar =>
    setLocalItem(storageKeys.TOGGLE_SIDEBAR, JSON.stringify(!toggleSidebar));

  unsetToggleSidebar: void => Promise<void> = () => removeLocalItem(storageKeys.TOGGLE_SIDEBAR);

  // ========== Expand / retract Sidebar ========== //

  getBringSandbox: void => Promise<boolean> = () => getLocalItem(storageKeys.BRING_SANDBOX).then(s => s === 'true');

  setBringSandbox: boolean => Promise<void> = flag => {
    return flag ? setLocalItem(storageKeys.BRING_SANDBOX, 'true') : this.unsetBringSandbox();
  };

  unsetBringSandbox: void => Promise<void> = () => removeLocalItem(storageKeys.BRING_SANDBOX);

  // ============ External storage provider ============ //

  getExternalStorage: void => Promise<?SelectedExternalStorageProvider> = () =>
    getLocalItem(storageKeys.EXTERNAL_STORAGE).then(result => {
      if (result === undefined || result === null) return null;
      return JSON.parse(result);
    });

  setExternalStorage: SelectedExternalStorageProvider => Promise<void> = provider =>
    setLocalItem(storageKeys.EXTERNAL_STORAGE, JSON.stringify(provider));

  unsetExternalStorage: void => Promise<void> = () => removeLocalItem(storageKeys.EXTERNAL_STORAGE);

  // ========== CONNECTOR whitelist  ========== //
  getWhitelist: void => Promise<?Array<WhitelistEntry>> = async () => {
    const result = await getLocalItem(storageKeys.DAPP_CONNECTOR_WHITELIST);
    if (result === undefined || result === null) return undefined;
    const filteredWhitelist = JSON.parse(result);
    await this.setWhitelist(filteredWhitelist);
    return filteredWhitelist;
  };

  setWhitelist: (Array<WhitelistEntry> | void) => Promise<void> = value =>
    setLocalItem(storageKeys.DAPP_CONNECTOR_WHITELIST, JSON.stringify(value ?? []));

  // =========== Common =============== //

  // ========== Unit of account ========== //

  getUnitOfAccount: void => Promise<UnitOfAccountSettingType> = async () => {
    const unitOfAccount = await getLocalItem(storageKeys.UNIT_OF_ACCOUNT);
    if (unitOfAccount == null) {
      return DEFAULT_CURRENCY_PAIR;
    }
    return JSON.parse(unitOfAccount);
  };

  setUnitOfAccount: UnitOfAccountSettingType => Promise<void> = async currency => {
    await setLocalItem(storageKeys.UNIT_OF_ACCOUNT, JSON.stringify(currency));
  };

  unsetUnitOfAccount: void => Promise<void> = async () => {
    await removeLocalItem(storageKeys.UNIT_OF_ACCOUNT);
  };

  // ========== Coin price data public key  ========== //

  getCoinPricePubKeyData: void => Promise<?string> = async () => {
    return await getLocalItem(storageKeys.COIN_PRICE_PUB_KEY_DATA);
  };

  setCoinPricePubKeyData: string => Promise<void> = async pubKeyData => {
    await setLocalItem(storageKeys.COIN_PRICE_PUB_KEY_DATA, pubKeyData);
  };

  unsetCoinPricePubKeyData: void => Promise<void> = async () => {
    try {
      await removeLocalItem(storageKeys.COIN_PRICE_PUB_KEY_DATA);
    } catch (_) {
      // ignore the error
    }
  };

  // ========== FLAGS ========== //

  getFlag: string => boolean = flag => {
    return localStorage.getItem(`${storageKeys.FLAGS}/${flag}`) === 'true';
  };

  setFlag: (string, boolean) => void = (flag, state) => {
    localStorage.setItem(`${storageKeys.FLAGS}/${flag}`, String(state));
  };

  // ========== Sort wallets - Revamp ========== //
  getWalletsNavigation: void => Promise<?WalletsNavigation> = async () => {
    let result = await getLocalItem(storageKeys.WALLETS_NAVIGATION);
    if (result === undefined || result === null) return undefined;
    result = JSON.parse(result);
    // Added for backward compatibility
    if (Array.isArray(result))
      return {
        cardano: [],
      };

    return result;
  };

  setWalletsNavigation: WalletsNavigation => Promise<void> = value =>
    setLocalItem(storageKeys.WALLETS_NAVIGATION, JSON.stringify(value));

  loadAcceptedTosVersion: () => Promise<?number> = async () => {
    const raw = await getLocalItem(storageKeys.ACCEPTED_TOS_VERSION);
    if (!raw) {
      return undefined;
    }
    const version = parseFloat(raw);
    if (Number.isNaN(version)) {
      return undefined;
    }
    return version;
  };

  saveAcceptedTosVersion: (version: number) => Promise<void> = async version => {
    await setLocalItem(storageKeys.ACCEPTED_TOS_VERSION, String(version));
  };

  unsetAcceptedTosVersion: void => Promise<void> = () => removeLocalItem(storageKeys.ACCEPTED_TOS_VERSION);

  // Firefox demands us to re-show the data collection consent screen, so change the key for Firefox
  _getIsAnalyticsAllowedKey: () => string = () => {
    let key = storageKeys.IS_ANALYTICS_ALLOWED;
    if (environment.isFirefox()) {
      key += '-firefox';
    }
    return key;
  };

  loadIsAnalyticsAllowed: () => Promise<?boolean> = async () => {
    const json = await getLocalItem(this._getIsAnalyticsAllowedKey());
    if (!json) {
      return undefined;
    }
    return JSON.parse(json);
  };

  saveIsAnalysticsAllowed: (flag: boolean) => Promise<void> = async flag => {
    await setLocalItem(this._getIsAnalyticsAllowedKey(), JSON.stringify(flag));
  };

  unsetIsAnalyticsAllowed: void => Promise<void> = () => removeLocalItem(storageKeys.IS_ANALYTICS_ALLOWED);

  saveCashbackWalletId: number => Promise<void> = id => setLocalItem(storageKeys.CASHBACK_WALLET_ID, String(id));

  getCashbackWalletId: () => Promise<number | null> = async () => {
    const v = await getLocalItem(storageKeys.CASHBACK_WALLET_ID);
    if (!v) {
      return null;
    }
    return Number(v);
  };

  _getShownDisclaimerObject: () => Promise<Object> = async () => {
    const raw = await getLocalItem(storageKeys.SHOWN_DISCLAIMERS);
    const val = raw ? JSON.parse(raw) : {};
    return val;
  };

  setShownDisclaimer: Disclaimer => Promise<void> = async which => {
    const val = await this._getShownDisclaimerObject();
    val[which] = true;
    await setLocalItem(storageKeys.SHOWN_DISCLAIMERS, JSON.stringify(val));
  };

  isDisclaimerShown: Disclaimer => Promise<boolean> = async which => {
    const val = await this._getShownDisclaimerObject();
    return val[which] === true;
  };

  loadCurrentNetworkId: () => Promise<?number> = async () => {
    const raw = await getLocalItem(storageKeys.CURRENT_NETWORK_ID);
    if (raw == null) {
      return undefined;
    }
    return Number(raw);
  };

  saveCurrentNetworkId: number => Promise<void> = async networkId => {
    await setLocalItem(storageKeys.CURRENT_NETWORK_ID, String(networkId));
  };

  loadWalletListOrder: () => Promise<Array<string>> = async () => {
    const raw = await getLocalItem(storageKeys.WALLET_LIST_ORDER);
    if (raw == null) {
      return [];
    }
    return JSON.parse(raw);
  };

  saveWalletListOrder: (Array<string>) => Promise<void> = async publicKeyList => {
    await setLocalItem(storageKeys.WALLET_LIST_ORDER, JSON.stringify(publicKeyList));
  };


  getPushNotificationMetadata: () => Promise<PushNotificationMetadata> = async () => {
    const raw = await getLocalItem(storageKeys.PUSH_NOTIFICATION_METADATA);
    if (!raw) {
      return {...undefined/* just to please flow */};
    }
    return JSON.parse(raw);
  }

  savePushNotificationMetadata: (PushNotificationMetadata) => Promise<void> = async (metadata) => {
    await setLocalItem(storageKeys.PUSH_NOTIFICATION_METADATA, JSON.stringify(metadata));
  }

  async reset(): Promise<void> {

    await this.unsetUserLocale();
    await this.unsetComplexityLevel();
    await this.unsetLastLaunchVersion();
    await this.unsetHideBalance();
    await this.unsetUnitOfAccount();
    await this.unsetCoinPricePubKeyData();
    await this.unsetExternalStorage();
    await this.unsetToggleSidebar();
    await this.unsetAcceptedTosVersion();
    await this.unsetIsAnalyticsAllowed();
    await this.unsetBringSandbox();
    for (const network of Object.values(networks)) {
      // $FlowIgnore[incompatible-use]
      await this.unsetPortfolioFiatPair(network.NetworkId);
    }
  }

  getItem: string => Promise<?string> = key => getLocalItem(key);

  setItem: (string, string) => Promise<void> = (key, value) => setLocalItem(key, value);

  getOldStorage: void => Promise<Storage> = () =>
    new Promise(resolve => {
      resolve(localStorage);
    });

  setStorage: ({ [key: string]: string, ... }) => Promise<void> = async localStorageData => {
    const tabKeys = new Set(Object.values(TabIdKeys));
    await Promise.all(
      Object.keys(localStorageData).map(async key => {
        // changing this key would cause the tab to close
        if (!tabKeys.has(key)) {
          await setLocalItem(key, localStorageData[key]);
        }
      })
    );
  };

  getStorage: void => Promise<string> = () => {
    return getLocalItem(undefined).then(json => {
      if (json == null) {
        return '{}';
      }
      return json;
    });
  };
}

export type PersistedSubmittedTransaction = {|
  networkId: number,
  publicDeriverId: number,
  transaction: CardanoShelleyTransactionCtorData,
  usedUtxos: ?Array<{| txHash: string, index: number |}>,
  isDrepDelegation?: boolean,
|};

const STORAGE_API =
  window.browser?.storage.local || // firefox mv2
  window.chrome?.storage.local; // chrome mv2 and mv3

export async function persistSubmittedTransactions(submittedTransactions: Array<PersistedSubmittedTransaction>): Promise<void> {
  await STORAGE_API.set({
    [storageKeys.SUBMITTED_TRANSACTIONS]: JSON.stringify(submittedTransactions),
  });
}

export async function loadSubmittedTransactions(): Promise<Array<PersistedSubmittedTransaction>> {
  const stored = await new Promise(resolve => STORAGE_API.get(storageKeys.SUBMITTED_TRANSACTIONS, resolve));
  if (stored == null || stored[storageKeys.SUBMITTED_TRANSACTIONS] == null) {
    return [];
  }
  return JSON.parse(stored[storageKeys.SUBMITTED_TRANSACTIONS]).map(
    ({ networkId, publicDeriverId, transaction, usedUtxos, isDrepDelegation }) => ({
      networkId,
      publicDeriverId,
      transaction: deserializeTransactionCtorData(transaction),
      usedUtxos,
      isDrepDelegation,
    })
  );
}

export async function loadCatalystRoundInfo(): Promise<?CatalystRoundInfoResponse> {
  const json = await getLocalItem(storageKeys.CATALYST_ROUND_INFO);
  if (!json) {
    return undefined;
  }
  return JSON.parse(json);
}

export async function saveCatalystRoundInfo(data: CatalystRoundInfoResponse): Promise<void> {
  await setLocalItem(storageKeys.CATALYST_ROUND_INFO, JSON.stringify(data));
}

export function asyncLocalStorageWrapper(): {|
  getItem(key: string): Promise<string | null>,
  setItem(key: string, value: string): Promise<void>,
  removeItem(key: string): Promise<void>,
|} {
  return {
    getItem: key => getLocalItem(key).then(x => x ?? null),
    setItem: setLocalItem,
    removeItem: removeLocalItem,
  };
}

export type StorageField<T> = {|
  get: () => Promise<T>,
  set: T => Promise<void>,
  remove: () => Promise<void>,
  defaultValue: () => T,
|};

export function createStorageField<T>(
  key: string,
  serializer: T => string,
  deserializer: string => T,
  defaultValue: T
): StorageField<T> {
  return Object.freeze({
    get: async () => maybe(await getLocalItem(key), deserializer) ?? defaultValue,
    set: t => setLocalItem(key, serializer(t)),
    remove: () => removeLocalItem(key),
    defaultValue: () => defaultValue,
  });
}

export function createStorageFlag(key: string, defaultValue: boolean): StorageField<boolean> {
  const serializer = String;
  const deserializer = s => s === 'true';
  return createStorageField<boolean>(key, serializer, deserializer, defaultValue);
}

export function createFlagStorage(): StorageAPI {
  return {
    get: async s => (await getLocalItem(s)) ?? null,
    set: setLocalItem,
  };
}
