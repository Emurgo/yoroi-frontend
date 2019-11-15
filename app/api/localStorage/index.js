// @flow

import environment from '../../environment';

import {
  getLocalItem,
  setLocalItem,
  removeLocalItem,
  isEmptyStorage,
} from './primitives';
import {
  OPEN_TAB_ID_KEY,
} from '../../utils/tabManager';

const networkForLocalStorage = String(environment.NETWORK);
const storageKeys = {
  USER_LOCALE: networkForLocalStorage + '-USER-LOCALE',
  TERMS_OF_USE_ACCEPTANCE: networkForLocalStorage + '-TERMS-OF-USE-ACCEPTANCE',
  URI_SCHEME_ACCEPTANCE: networkForLocalStorage + '-URI-SCHEME-ACCEPTANCE',
  THEME: networkForLocalStorage + '-THEME',
  CUSTOM_THEME: networkForLocalStorage + '-CUSTOM-THEME',
  VERSION: networkForLocalStorage + '-LAST-LAUNCH-VER',
  HIDE_BALANCE: networkForLocalStorage + '-HIDE-BALANCE',
};

export type SetCustomUserThemeRequest = {|
  customThemeVars: string,
  currentThemeVars: Object,
|};

/**
 * This api layer provides access to the electron local storage
 * for user settings that are not synced with any coin backend.
 */

export default class LocalStorageApi {

  // ========== Locale ========== //

  getUserLocale: void => Promise<?string> = () => getLocalItem(storageKeys.USER_LOCALE);

  setUserLocale: string => Promise<void> = (
    locale
  ) => setLocalItem(storageKeys.USER_LOCALE, locale);

  unsetUserLocale: void => Promise<void> = () => removeLocalItem(storageKeys.USER_LOCALE);

  // ========== Terms of Use ========== //

  getTermsOfUseAcceptance: void => Promise<boolean> = () => getLocalItem(
    storageKeys.TERMS_OF_USE_ACCEPTANCE
  ).then((accepted) => accepted === 'true');

  setTermsOfUseAcceptance: void => Promise<void> = () => setLocalItem(
    storageKeys.TERMS_OF_USE_ACCEPTANCE, JSON.stringify(true)
  );

  unsetTermsOfUseAcceptance: void => Promise<void> = () => removeLocalItem(
    storageKeys.TERMS_OF_USE_ACCEPTANCE
  );

  // ========== URI Scheme acceptance ========== //

  getUriSchemeAcceptance: void => Promise<boolean> = () => getLocalItem(
    storageKeys.URI_SCHEME_ACCEPTANCE
  ).then((accepted) => {
    if (accepted !== 'true') return false;
    return JSON.parse(accepted);
  });

  setUriSchemeAcceptance: void => Promise<void> = () => setLocalItem(
    storageKeys.URI_SCHEME_ACCEPTANCE, JSON.stringify(true)
  );

  unsetUriSchemeAcceptance: void => Promise<void> = () => removeLocalItem(
    storageKeys.URI_SCHEME_ACCEPTANCE
  );

  // ========== User Theme ========== //

  getUserTheme: void => Promise<?string> = () => getLocalItem(storageKeys.THEME);

  setUserTheme: string => Promise<void> = (theme) => setLocalItem(storageKeys.THEME, theme);

  unsetUserTheme: void => Promise<void> = () => removeLocalItem(storageKeys.THEME);

  // ========== Custom User Theme ========== //

  getCustomUserTheme: void => Promise<?string> = () => getLocalItem(storageKeys.CUSTOM_THEME);

  setCustomUserTheme: SetCustomUserThemeRequest => Promise<void> = (
    request
  ) => new Promise((resolve, reject) => {
    try {
      // Convert CSS String into Javascript Object
      const vars = request.customThemeVars.split(';');
      const themeObject = {};
      vars.forEach(v => {
        const varData = v.split(':');
        const key = varData[0];
        const value = varData[1];
        if (key && value && request.currentThemeVars[key.trim()] !== value.trim()) {
          themeObject[key.trim()] = value.trim();
        }
      });
      // Save Theme Object
      return setLocalItem(storageKeys.CUSTOM_THEME, JSON.stringify(themeObject));
    } catch (error) {
      return reject(error);
    }
  });

  unsetCustomUserTheme: void => Promise<void> = () => removeLocalItem(storageKeys.CUSTOM_THEME);

  // ========== Last Launch Version Number ========== //

  getLastLaunchVersion: void => Promise<string> = () => getLocalItem(
    storageKeys.VERSION
  ).then((versionNum) => {
    if (versionNum == null) return '0.0.0';
    return versionNum;
  });

  setLastLaunchVersion: string => Promise<void> = (version: string) => setLocalItem(
    storageKeys.VERSION, version
  );

  unsetLastLaunchVersion: void => Promise<void> = () => removeLocalItem(storageKeys.VERSION);

  isEmpty: void => Promise<boolean> = () => isEmptyStorage();

  clear: void => Promise<void> = async () => {
    const storage = JSON.parse(await this.getStorage());
    await Object.keys(storage).forEach(async key => {
      // changing this key would cause the tab to close
      if (key !== OPEN_TAB_ID_KEY) {
        await removeLocalItem(key);
      }
    });
  }

  // ========== Show/hide Balance ========== //

  getHideBalance: void => Promise<boolean> = () => getLocalItem(
    storageKeys.HIDE_BALANCE
  ).then((accepted) => {
    if (accepted !== 'true') return false;
    return JSON.parse(accepted);
  });

  setHideBalance: boolean => Promise<void> = (hideBalance) => setLocalItem(
    storageKeys.HIDE_BALANCE, JSON.stringify(!hideBalance)
  );

  unsetHideBalance: void => Promise<void> = () => removeLocalItem(storageKeys.HIDE_BALANCE);

  async reset(): Promise<void> {
    await this.unsetUserLocale();
    await this.unsetTermsOfUseAcceptance();
    await this.unsetUserTheme();
    await this.unsetLastLaunchVersion();
    await this.unsetHideBalance();
  }

  getItem: string => Promise<?string> = (key) => getLocalItem(key);

  setItem: (string, string) => Promise<void> = (key, value) => setLocalItem(key, value);

  getOldStorage: void => Promise<Storage> = () => new Promise((resolve) => {
    resolve(localStorage);
  });

  setStorage: { [key: string]: string } => Promise<void> = async (localStorageData) => {
    await Object.keys(localStorageData).forEach(async key => {
      // changing this key would cause the tab to close
      if (key !== OPEN_TAB_ID_KEY) {
        await setLocalItem(key, localStorageData[key]);
      }
    });
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
