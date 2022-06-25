// @flow //
import { observable, runInAction, action } from 'mobx';

export default class ProfileStore {
  @observable currentLocale: string;
  appVersion: string;

  constructor(locale: string, appVersion: string) {
    this.appVersion = appVersion;
    runInAction(() => {
      this.currentLocale = locale;
    });
  }

  @action('Changing Locale')
  setLocale: (string) => void = (locale) => {
    this.currentLocale = locale;
  }
}
