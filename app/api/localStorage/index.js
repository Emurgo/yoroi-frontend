import environment from '../../environment';

const networkForLocalStorage = String(environment.NETWORK);
const storageKeys = {
  USER_LOCALE: networkForLocalStorage + '-USER-LOCALE',
  TERMS_OF_USE_ACCEPTANCE: networkForLocalStorage + '-TERMS-OF-USE-ACCEPTANCE',
  SEND_LOGS_CHOICE: networkForLocalStorage + '-SEND-LOGS-CHOICE',
  THEME: networkForLocalStorage + '-THEME'
};

/**
 * This api layer provides access to the electron local storage
 * for user settings that are not synced with any coin backend.
 */

export default class LocalStorageApi {

  getUserLocale = () => new Promise((resolve, reject) => {
    try {
      const locale = localStorage.getItem(storageKeys.USER_LOCALE);
      if (!locale) return resolve('');
      resolve(locale);
    } catch (error) {
      return reject(error);
    }
  });

  setUserLocale = (locale: string) => new Promise((resolve, reject) => {
    try {
      localStorage.setItem(storageKeys.USER_LOCALE, locale);
      resolve();
    } catch (error) {
      return reject(error);
    }
  });

  unsetUserLocale = () => new Promise((resolve) => {
    try {
      localStorage.removeItem(storageKeys.USER_LOCALE);
      resolve();
    } catch (error) {} // eslint-disable-line
  });

  getTermsOfUseAcceptance = () => new Promise((resolve, reject) => {
    try {
      const accepted = localStorage.getItem(storageKeys.TERMS_OF_USE_ACCEPTANCE);
      if (!accepted) return resolve(false);
      resolve(JSON.parse(accepted));
    } catch (error) {
      return reject(error);
    }
  });

  setTermsOfUseAcceptance = () => new Promise((resolve, reject) => {
    try {
      localStorage.setItem(storageKeys.TERMS_OF_USE_ACCEPTANCE, true);
      resolve();
    } catch (error) {
      return reject(error);
    }
  });

  unsetTermsOfUseAcceptance = () => new Promise((resolve) => {
    try {
      localStorage.removeItem(storageKeys.TERMS_OF_USE_ACCEPTANCE);
      resolve();
    } catch (error) {} // eslint-disable-line
  });

  async reset() {
    await this.unsetUserLocale(); // TODO: remove after saving locale to API is restored
    await this.unsetTermsOfUseAcceptance();
  }

}
