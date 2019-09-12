// @flow

import environment from '../../environment';
import { unitOfAccountDisabledValue } from '../../types/unitOfAccountType';
import type { UnitOfAccountSettingType } from '../../types/unitOfAccountType';

const networkForLocalStorage = String(environment.NETWORK);
const storageKeys = {
  USER_LOCALE: networkForLocalStorage + '-USER-LOCALE',
  TERMS_OF_USE_ACCEPTANCE: networkForLocalStorage + '-TERMS-OF-USE-ACCEPTANCE',
  URI_SCHEME_ACCEPTANCE: networkForLocalStorage + '-URI-SCHEME-ACCEPTANCE',
  THEME: networkForLocalStorage + '-THEME',
  CUSTOM_THEME: networkForLocalStorage + '-CUSTOM-THEME',
  VERSION: networkForLocalStorage + '-LAST-LAUNCH-VER',
  HIDE_BALANCE: networkForLocalStorage + '-HIDE-BALANCE',
  UNIT_OF_ACCOUNT: networkForLocalStorage + '-UNIT-OF-ACCOUNT',
  COIN_PRICE_PUB_KEY_DATA: networkForLocalStorage + '-COIN-PRICE-PUB-KEY-DATA', 
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

  getUserLocale = (): Promise<string> => new Promise((resolve, reject) => {
    try {
      const locale = localStorage.getItem(storageKeys.USER_LOCALE);
      if (!locale) return resolve('');
      resolve(locale);
    } catch (error) {
      return reject(error);
    }
  });

  setUserLocale = (locale: string): Promise<void> => new Promise((resolve, reject) => {
    try {
      localStorage.setItem(storageKeys.USER_LOCALE, locale);
      resolve();
    } catch (error) {
      return reject(error);
    }
  });

  unsetUserLocale = (): Promise<void> => new Promise((resolve) => {
    try {
      localStorage.removeItem(storageKeys.USER_LOCALE);
      resolve();
    } catch (error) {} // eslint-disable-line
  });

  // ========== Terms of Use ========== //

  getTermsOfUseAcceptance = (): Promise<boolean> => new Promise((resolve, reject) => {
    try {
      const accepted = localStorage.getItem(storageKeys.TERMS_OF_USE_ACCEPTANCE);
      if (!accepted) return resolve(false);
      resolve(JSON.parse(accepted));
    } catch (error) {
      return reject(error);
    }
  });

  setTermsOfUseAcceptance = (): Promise<void> => new Promise((resolve, reject) => {
    try {
      localStorage.setItem(storageKeys.TERMS_OF_USE_ACCEPTANCE, JSON.stringify(true));
      resolve();
    } catch (error) {
      return reject(error);
    }
  });

  unsetTermsOfUseAcceptance = (): Promise<void> => new Promise((resolve) => {
    try {
      localStorage.removeItem(storageKeys.TERMS_OF_USE_ACCEPTANCE);
      resolve();
    } catch (error) {} // eslint-disable-line
  });

  // ========== URI Scheme acceptance ========== //

  getUriSchemeAcceptance = (): Promise<boolean> => new Promise((resolve, reject) => {
    try {
      const accepted = localStorage.getItem(storageKeys.URI_SCHEME_ACCEPTANCE);
      if (!accepted) return resolve(false);
      resolve(JSON.parse(accepted));
    } catch (error) {
      return reject(error);
    }
  });

  setUriSchemeAcceptance = (): Promise<void> => new Promise((resolve, reject) => {
    try {
      localStorage.setItem(storageKeys.URI_SCHEME_ACCEPTANCE, JSON.stringify(true));
      resolve();
    } catch (error) {
      return reject(error);
    }
  });

  unsetUriSchemeAcceptance = (): Promise<void> => new Promise((resolve) => {
    try {
      localStorage.removeItem(storageKeys.URI_SCHEME_ACCEPTANCE);
      resolve();
    } catch (error) {} // eslint-disable-line
  });

  // ========== User Theme ========== //

  getUserTheme = (): Promise<string> => new Promise((resolve, reject) => {
    try {
      const theme = localStorage.getItem(storageKeys.THEME);
      if (!theme) return resolve('');
      resolve(theme);
    } catch (error) {
      return reject(error);
    }
  });

  setUserTheme = (theme: string): Promise<void> => new Promise((resolve, reject) => {
    try {
      localStorage.setItem(storageKeys.THEME, theme);
      resolve();
    } catch (error) {
      return reject(error);
    }
  });

  unsetUserTheme = (): Promise<void> => new Promise((resolve) => {
    try {
      localStorage.removeItem(storageKeys.THEME);
      resolve();
    } catch (error) {} // eslint-disable-line
  });

  // ========== Custom User Theme ========== //

  getCustomUserTheme = (): Promise<string> => new Promise((resolve, reject) => {
    try {
      const themeVars = localStorage.getItem(storageKeys.CUSTOM_THEME);
      if (!themeVars) return resolve('');
      resolve(themeVars);
    } catch (error) {
      return reject(error);
    }
  });

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
      localStorage.setItem(storageKeys.CUSTOM_THEME, JSON.stringify(themeObject));
      resolve();
    } catch (error) {
      return reject(error);
    }
  });

  unsetCustomUserTheme = (): Promise<void> => new Promise((resolve) => {
    try {
      localStorage.removeItem(storageKeys.CUSTOM_THEME);
      resolve();
    } catch (error) {} // eslint-disable-line
  });

  unsetUserTheme = (): Promise<void> => new Promise((resolve) => {
    try {
      localStorage.removeItem(storageKeys.THEME);
      resolve();
    } catch (error) {} // eslint-disable-line
  });

  // ========== Last Launch Version Number ========== //

  getLastLaunchVersion = (): Promise<string> => new Promise((resolve, reject) => {
    try {
      const versionNum = localStorage.getItem(storageKeys.VERSION);

      // if unset, assume lowest version possible to make sure migration always triggers
      if (!versionNum) return resolve('0.0.0');
      resolve(versionNum);
    } catch (error) {
      return reject(error);
    }
  });

  setLastLaunchVersion = (version: string): Promise<void> => new Promise((resolve, reject) => {
    try {
      localStorage.setItem(storageKeys.VERSION, version);
      resolve();
    } catch (error) {
      return reject(error);
    }
  });

  unsetLastLaunchVersion = (): Promise<void> => new Promise((resolve) => {
    try {
      localStorage.removeItem(storageKeys.VERSION);
      resolve();
    } catch (error) {} // eslint-disable-line
  });

  isEmpty = (): Promise<boolean> => new Promise((resolve) => {
    try {
      resolve(localStorage.length === 0);
    } catch (error) {} // eslint-disable-line
  });

  // ========== Show/hide Balance ========== //

  getHideBalance = (): Promise<boolean> => new Promise((resolve, reject) => {
    try {
      const hideBalance = localStorage.getItem(storageKeys.HIDE_BALANCE);
      if (!hideBalance) resolve(false);
      else resolve(JSON.parse(hideBalance));
    } catch (error) {
      return reject(error);
    }
  });

  setHideBalance = (hideBalance: boolean): Promise<void> => new Promise((resolve, reject) => {
    try {
      localStorage.setItem(storageKeys.HIDE_BALANCE, JSON.stringify(!hideBalance));
      resolve();
    } catch (error) {
      return reject(error);
    }
  });

  unsetHideBalance = (): Promise<void> => new Promise((resolve) => {
    try {
      localStorage.removeItem(storageKeys.HIDE_BALANCE);
      resolve();
    } catch (error) {} // eslint-disable-line
  });

  // ========== Unit of account ========== //

  getUnitOfAccount = (): Promise<UnitOfAccountSettingType> => new Promise((resolve, reject) => {
    try {
      const unitOfAccount = localStorage.getItem(storageKeys.UNIT_OF_ACCOUNT);
      if (!unitOfAccount) resolve(unitOfAccountDisabledValue);
      else resolve(JSON.parse(unitOfAccount));
    } catch (error) {
      return reject(error);
    }
  });

  setUnitOfAccount = (currency: UnitOfAccountSettingType): Promise<void> => new Promise((resolve, reject) => {
    try {
      localStorage.setItem(storageKeys.UNIT_OF_ACCOUNT, JSON.stringify(currency));
      resolve();
    } catch (error) {
      return reject(error);
    }
  });

  unsetUnitOfAccount = (): Promise<void> => new Promise((resolve) => {
    try {
      localStorage.removeItem(storageKeys.UNIT_OF_ACCOUNT);
    } catch (_error) {}
    resolve();
  });

  // ========== Coin price data public key  ========== //
  
  getCoinPricePubKeyData = async (): Promise<?string> => {
    return localStorage.getItem(storageKeys.COIN_PRICE_PUB_KEY_DATA);
  }

  setCoinPricePubKeyData = async (pubKeyData: string): Promise<void> => {
    localStorage.setItem(storageKeys.COIN_PRICE_PUB_KEY_DATA, pubKeyData);
  }

  unsetCoinPricePubKeyData = async (): Promise<void> => {
    try {
      localStorage.removeItem(storageKeys.COIN_PRICE_PUB_KEY_DATA);
    } catch (_) {
    }
  }

  async reset() {
    await this.unsetUserLocale();
    await this.unsetTermsOfUseAcceptance();
    await this.unsetUserTheme();
    await this.unsetLastLaunchVersion();
    await this.unsetHideBalance();
    await this.unsetUnitOfAccount();
    await this.unsetCoinPricePubKeyData();
  }

  setLocalStorage = (localStorageData: any): Promise<void> => new Promise((resolve) => {
    Object.keys(localStorageData).forEach(key => {
      localStorage.setItem(key, localStorageData[key]);
    });
    resolve();
  });

  getLocalStorage = (): Promise<string> => new Promise((resolve) => {
    resolve(JSON.stringify(localStorage));
  });
}
