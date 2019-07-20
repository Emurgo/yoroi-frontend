// @flow

import environment from '../../environment';

import {
  getLocalItem,
  setLocalItem,
  removeLocalItem,
  isEmptyStorage
} from './primitives';

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

export type SetCustomUserThemeRequest = {
  customThemeVars: string,
  currentThemeVars: Object,
};

/**
 * This api layer provides access to the electron local storage
 * for user settings that are not synced with any coin backend.
 */

export default class LocalStorageApi {

  // ========== Locale ========== //

  getUserLocale = (): Promise<string> => getLocalItem(storageKeys.USER_LOCALE);

  setUserLocale = (locale: string): Promise<void> => setLocalItem(storageKeys.USER_LOCALE, locale);

  unsetUserLocale = (): Promise<void> => removeLocalItem(storageKeys.USER_LOCALE);

  // ========== Terms of Use ========== //

  getTermsOfUseAcceptance = (): Promise<boolean> => getLocalItem(
    storageKeys.TERMS_OF_USE_ACCEPTANCE
  ).then((accepted) => accepted === 'true');

  setTermsOfUseAcceptance = (): Promise<void> => setLocalItem(
    storageKeys.TERMS_OF_USE_ACCEPTANCE, JSON.stringify(true)
  );

  unsetTermsOfUseAcceptance = (): Promise<void> => removeLocalItem(
    storageKeys.TERMS_OF_USE_ACCEPTANCE
  );

  // ========== URI Scheme acceptance ========== //

  getUriSchemeAcceptance = (): Promise<boolean> => getLocalItem(
    storageKeys.URI_SCHEME_ACCEPTANCE
  ).then((accepted) => {
    if (accepted !== 'true') return false;
    return JSON.parse(accepted);
  });

  setUriSchemeAcceptance = (): Promise<void> => setLocalItem(
    storageKeys.URI_SCHEME_ACCEPTANCE, JSON.stringify(true)
  );

  unsetUriSchemeAcceptance = (): Promise<void> => removeLocalItem(
    storageKeys.URI_SCHEME_ACCEPTANCE
  );

  // ========== User Theme ========== //

  getUserTheme = (): Promise<string> => getLocalItem(storageKeys.THEME);

  setUserTheme = (theme: string): Promise<void> => setLocalItem(storageKeys.THEME, theme);

  unsetUserTheme = (): Promise<void> => removeLocalItem(storageKeys.THEME);

  // ========== Custom User Theme ========== //

  getCustomUserTheme = (): Promise<string> => getLocalItem(storageKeys.CUSTOM_THEME);

  setCustomUserTheme = (
    request: {
      customThemeVars: string,
      currentThemeVars: Object,
    }
  ): Promise<void> => new Promise((resolve, reject) => {
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

  unsetCustomUserTheme = (): Promise<void> => removeLocalItem(storageKeys.CUSTOM_THEME);

  // ========== Last Launch Version Number ========== //

  getLastLaunchVersion = (): Promise<string> => getLocalItem(
    storageKeys.VERSION
  ).then((versionNum) => {
    if (versionNum === '') return '0.0.0';
    return versionNum;
  });

  setLastLaunchVersion = (version: string): Promise<void> => setLocalItem(
    storageKeys.VERSION, version
  );

  unsetLastLaunchVersion = (): Promise<void> => removeLocalItem(storageKeys.VERSION);

  isEmpty = (): Promise<boolean> => isEmptyStorage();

  // ========== Show/hide Balance ========== //

  getHideBalance = (): Promise<boolean> => getLocalItem(
    storageKeys.HIDE_BALANCE
  ).then((accepted) => {
    if (accepted !== 'true') return false;
    return JSON.parse(accepted);
  });

  setHideBalance = (hideBalance: boolean): Promise<void> => setLocalItem(
    storageKeys.HIDE_BALANCE, JSON.stringify(!hideBalance)
  );

  unsetHideBalance = (): Promise<void> => removeLocalItem(storageKeys.HIDE_BALANCE);

  async reset() {
    await this.unsetUserLocale();
    await this.unsetTermsOfUseAcceptance();
    await this.unsetUserTheme();
    await this.unsetLastLaunchVersion();
    await this.unsetHideBalance();
  }

  getItem = (key: string): Promise<string> => getLocalItem(key);

  setItem = (key: string, value: string): Promise<void> => setLocalItem(key, value);

  getOldStorage = (): Promise<string> => new Promise((resolve) => {
    resolve(JSON.stringify(localStorage));
  });

  setStorage = (localStorageData: any): Promise<void> => new Promise(async (resolve) => {
    await Object.keys(localStorageData).forEach(async key => {
      await setLocalItem(key, localStorageData[key]);
    });
    resolve();
  });

  getStorage = (): Promise<string> => new Promise((resolve) => {
    resolve(getLocalItem(null));
  });

}
