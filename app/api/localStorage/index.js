// @flow

import environment from '../../environment';

const networkForLocalStorage = String(environment.NETWORK);
const storageKeys = {
  USER_LOCALE: networkForLocalStorage + '-USER-LOCALE',
  TERMS_OF_USE_ACCEPTANCE: networkForLocalStorage + '-TERMS-OF-USE-ACCEPTANCE',
  THEME: networkForLocalStorage + '-THEME',
  CUSTOM_THEME: networkForLocalStorage + '-CUSTOM-THEME',
  VERSION: networkForLocalStorage + '-LAST-LAUNCH-VER'
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
    customThemeVars: string,
    currentThemeVars: Object
  ): Promise<void> => new Promise((resolve, reject) => {
    try {
      // Convert CSS String into Javascript Object
      const vars = customThemeVars.split(';');
      const themeObject = {};
      vars.forEach(v => {
        const varData = v.split(':');
        const key = varData[0];
        const value = varData[1];
        if (key && value && currentThemeVars[key.trim()] !== value.trim()) {
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

  async reset() {
    await this.unsetUserLocale();
    await this.unsetTermsOfUseAcceptance();
    await this.unsetUserTheme();
    await this.unsetLastLaunchVersion();
  }
}
