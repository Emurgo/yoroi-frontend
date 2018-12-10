// @flow
import { observable, computed } from 'mobx';
import BigNumber from 'bignumber.js';
import moment from 'moment/moment';
import bcryptjs from 'bcryptjs';
import Store from '../base/Store';
import Request from '../lib/LocalizedRequest';
import environment from '../../environment';
import { ROUTES } from '../../routes-config';
import globalMessages from '../../i18n/global-messages';

export default class SettingsStore extends Store {

  LANGUAGE_OPTIONS = [
    { value: 'en-US', label: globalMessages.languageEnglish },
    { value: 'ja-JP', label: globalMessages.languageJapanese },
    { value: 'ko-KR', label: globalMessages.languageKorean },
    { value: 'zh-Hans', label: globalMessages.languageChineseSimplified },
    { value: 'zh-Hant', label: globalMessages.languageChineseTraditional },
    { value: 'ru-RU', label: globalMessages.languageRussian },
  ];

  @observable bigNumberDecimalFormat = {
    decimalSeparator: '.',
    groupSeparator: ',',
    groupSize: 3,
    secondaryGroupSize: 0,
    fractionGroupSeparator: ' ',
    fractionGroupSize: 0
  };

  /* eslint-disable max-len */
  @observable getProfileLocaleRequest: Request<string> = new Request(this.api.localStorage.getUserLocale);
  @observable setProfileLocaleRequest: Request<string> = new Request(this.api.localStorage.setUserLocale);
  @observable getTermsOfUseAcceptanceRequest: Request<string> = new Request(this.api.localStorage.getTermsOfUseAcceptance);
  @observable setTermsOfUseAcceptanceRequest: Request<string> = new Request(this.api.localStorage.setTermsOfUseAcceptance);
  @observable getPinCodeRequest: Request<string> = new Request(this.api.localStorage.getPinCode);
  @observable setPinCodeRequest: Request<string> = new Request(this.api.localStorage.setPinCode);
  @observable getLockScreenEnabledRequest: Request<string> = new Request(this.api.localStorage.getLockScreenEnabled);
  @observable setLockScreenEnabledRequest: Request<string> = new Request(this.api.localStorage.setLockScreenEnabled);
  @observable unsetLockScreenEnabledRequest: Request<string> = new Request(this.api.localStorage.unsetLockScreenEnabled);
  @observable checkAppLockedRequest: Request<string> = new Request(this.api.localStorage.checkAppLocked);
  @observable toggleAppLockedRequest: Request<string> = new Request(this.api.localStorage.toggleAppLocked);
  /* eslint-enable max-len */

  setup() {
    this.actions.profile.updateLocale.listen(this._updateLocale);
    this.actions.profile.acceptTermsOfUse.listen(this._acceptTermsOfUse);
    this.actions.profile.toggleLockScreen.listen(this._toggleLockScreen);
    this.actions.profile.setPinCode.listen(this._setPinCode);
    this.actions.profile.checkAppLocked.listen(this._isAppLocked);
    this.actions.profile.toggleAppLocked.listen(this._toggleAppLocked);
    this.registerReactions([
      this._setBigNumberFormat,
      this._updateMomentJsLocaleAfterLocaleChange,
      this._reloadAboutWindowOnLocaleChange,
      this._redirectToLanguageSelectionIfNoLocaleSet,
      this._redirectToTermsOfUseScreenIfTermsNotAccepted,
      this._redirectToMainUiAfterTermsAreAccepted,
    ]);
    this._getTermsOfUseAcceptance();
    this._isAppLocked();
    this._getLockScreenEnabled();
    this._getPinCode();
  }

  teardown() {
    super.teardown();
  }

  _setBigNumberFormat = () => {
    BigNumber.config({ FORMAT: this.bigNumberDecimalFormat });
  };

  @computed get currentLocale(): string {
    const { result } = this.getProfileLocaleRequest.execute();
    if (this.isCurrentLocaleSet) return result;
    return 'en-US'; // default
  }

  @computed get lockScreenEnabled(): boolean {
    const { result } = this.getLockScreenEnabledRequest.execute();
    return result;
  }

  @computed get pinCode(): string {
    const { result } = this.getPinCodeRequest.execute();
    return result;
  }

  @computed get hasLoadedCurrentLocale(): boolean {
    return (
      this.getProfileLocaleRequest.wasExecuted && this.getProfileLocaleRequest.result !== null
    );
  }

  @computed get isCurrentLocaleSet(): boolean {
    return (this.getProfileLocaleRequest.result !== null && this.getProfileLocaleRequest.result !== '');
  }

  @computed get termsOfUse(): string {
    return require(`../../i18n/locales/terms-of-use/${environment.API}/${this.currentLocale}.md`);
  }

  @computed get hasLoadedTermsOfUseAcceptance(): boolean {
    return (
      this.getTermsOfUseAcceptanceRequest.wasExecuted &&
      this.getTermsOfUseAcceptanceRequest.result !== null
    );
  }

  @computed get areTermsOfUseAccepted(): boolean {
    return this.getTermsOfUseAcceptanceRequest.result === true;
  }

  @computed get isAppLocked(): boolean {
    const { result } = this.checkAppLockedRequest.execute();
    return result;
  }

  _toggleAppLocked = async () => {
    await this.toggleAppLockedRequest.execute();
    await this.checkAppLockedRequest.execute();
  }

  _updateLocale = async ({ locale }: { locale: string }) => {
    await this.setProfileLocaleRequest.execute(locale);
    await this.getProfileLocaleRequest.execute(); // eagerly cache
  };

  _toggleLockScreen = async () => {
    this.unsetLockScreenEnabledRequest.execute();
    await this.getLockScreenEnabledRequest.execute();
  }

  _getLockScreenEnabled = () => {
    this.getLockScreenEnabledRequest.execute();
  }

  _getPinCode = () => {
    this.getPinCodeRequest.execute();
  }

  _isAppLocked = () => {
    this.checkAppLockedRequest.execute();
  }

  _setPinCode = async (code: string) => {
    const hashed = await new Promise((resolve, reject) => {
      bcryptjs.hash(code, 10, (err, hash) => {
        if (err) reject(err);
        resolve(hash);
      });
    });
    const date = Date.now();
    await this.setPinCodeRequest.execute(hashed, date);
    await this.getPinCodeRequest.execute();
  }

  _updateMomentJsLocaleAfterLocaleChange = () => {
    moment.locale(this._convertLocaleKeyToMomentJSLocalKey(this.currentLocale));
  };

  _convertLocaleKeyToMomentJSLocalKey = (localeKey: string): string => {
    // REF -> https://github.com/moment/moment/tree/develop/locale
    let momentJSLocalKey = localeKey;
    switch (localeKey) {
      case 'zh-Hans':
        momentJSLocalKey = 'zh-cn';
        break;
      case 'zh-Hant':
        momentJSLocalKey = 'zh-tw';
        break;
      default:
        momentJSLocalKey = localeKey;
        break;
    }
    return momentJSLocalKey;
  }

  _acceptTermsOfUse = async () => {
    await this.setTermsOfUseAcceptanceRequest.execute();
    await this.getTermsOfUseAcceptanceRequest.execute();
  };

  _getTermsOfUseAcceptance = () => {
    this.getTermsOfUseAcceptanceRequest.execute();
  };

  _redirectToLanguageSelectionIfNoLocaleSet = () => {
    const { isLoading } = this.stores.loading;
    if (!isLoading && this.hasLoadedCurrentLocale && !this.isCurrentLocaleSet) {
      this.actions.router.goToRoute.trigger({ route: ROUTES.PROFILE.LANGUAGE_SELECTION });
    }
  };

  _redirectToTermsOfUseScreenIfTermsNotAccepted = () => {
    if (this.isCurrentLocaleSet &&
      this.hasLoadedTermsOfUseAcceptance && !this.areTermsOfUseAccepted) {
      this.actions.router.goToRoute.trigger({ route: ROUTES.PROFILE.TERMS_OF_USE });
    }
  };

  _redirectToRoot = () => {
    this.actions.router.goToRoute.trigger({ route: ROUTES.WALLETS.ROOT });
  };

  _reloadAboutWindowOnLocaleChange = () => {
    // register mobx observer for currentLocale in order to trigger reaction on change
    this.currentLocale; // eslint-disable-line
  };

  _isOnTermsOfUsePage = () => this.stores.app.currentRoute === ROUTES.PROFILE.TERMS_OF_USE;

  _redirectToMainUiAfterTermsAreAccepted = () => {
    if (this.areTermsOfUseAccepted && this._isOnTermsOfUsePage()) {
      this._redirectToRoot();
    }
  };
}
