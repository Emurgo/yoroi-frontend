// @flow
import { observable, computed } from 'mobx';
import BigNumber from 'bignumber.js';
import moment from 'moment/moment';
import Store from '../base/Store';
import Request from '../lib/LocalizedRequest';
import environment from '../../environment';
import { THEMES } from '../../themes';
import type { Theme } from '../../themes';
import { ROUTES } from '../../routes-config';
import globalMessages from '../../i18n/global-messages';
import registerProtocols from '../../uri-protocols';
import type { ExplorerType } from '../../domain/Explorer';
import type {
  GetSelectedExplorerFunc, SaveSelectedExplorerFunc,
} from '../../api/ada';
import type {
  SetCustomUserThemeRequest
} from '../../api/localStorage/index';

export default class ProfileStore extends Store {

  LANGUAGE_OPTIONS = [
    { value: 'en-US', label: globalMessages.languageEnglish, svg: require('../../assets/images/flags/english.inline.svg') },
    { value: 'ja-JP', label: globalMessages.languageJapanese, svg: require('../../assets/images/flags/japanese.inline.svg') },
    { value: 'ko-KR', label: globalMessages.languageKorean, svg: require('../../assets/images/flags/korean.inline.svg') },
    { value: 'zh-Hans', label: globalMessages.languageChineseSimplified, svg: require('../../assets/images/flags/chinese.inline.svg') },
    { value: 'zh-Hant', label: globalMessages.languageChineseTraditional, svg: require('../../assets/images/flags/chinese.inline.svg') },
    { value: 'ru-RU', label: globalMessages.languageRussian, svg: require('../../assets/images/flags/russian.inline.svg') },
    { value: 'de-DE', label: globalMessages.languageGerman, svg: require('../../assets/images/flags/german.inline.svg') },
    { value: 'fr-FR', label: globalMessages.languageFrench, svg: require('../../assets/images/flags/french.inline.svg') },
    { value: 'es-ES', label: globalMessages.languageSpanish, svg: require('../../assets/images/flags/spanish.inline.svg') },
    { value: 'it-IT', label: globalMessages.languageItalian, svg: require('../../assets/images/flags/italian.inline.svg') },
    { value: 'id-ID', label: globalMessages.languageIndonesian, svg: require('../../assets/images/flags/indonesian.inline.svg') },
    ...(!environment.isMainnet()
      ? [
        // add any language that's mid-translation here
      ]
      : [])
  ];

  @observable bigNumberDecimalFormat = {
    decimalSeparator: '.',
    groupSeparator: ',',
    groupSize: 3,
    secondaryGroupSize: 0,
    fractionGroupSeparator: ' ',
    fractionGroupSize: 0
  };

  @observable getProfileLocaleRequest: Request<void => Promise<string>>
    = new Request<void => Promise<string>>(this.api.localStorage.getUserLocale);

  @observable setProfileLocaleRequest: Request<string => Promise<void>>
    = new Request<string => Promise<void>>(this.api.localStorage.setUserLocale);

  @observable getThemeRequest: Request<void => Promise<string>>
    = new Request<void => Promise<string>>(this.api.localStorage.getUserTheme);

  @observable setThemeRequest: Request<string => Promise<void>>
    = new Request<string => Promise<void>>(this.api.localStorage.setUserTheme);

  @observable getCustomThemeRequest: Request<void => Promise<string>>
    = new Request<void => Promise<string>>(this.api.localStorage.getCustomUserTheme);

  @observable setCustomThemeRequest: Request<SetCustomUserThemeRequest => Promise<void>>
    = new Request<SetCustomUserThemeRequest => Promise<void>>(
      this.api.localStorage.setCustomUserTheme
    );

  @observable unsetCustomThemeRequest: Request<void => Promise<void>>
    = new Request<void => Promise<void>>(this.api.localStorage.unsetCustomUserTheme);

  @observable getTermsOfUseAcceptanceRequest: Request<void => Promise<boolean>>
  = new Request<void => Promise<boolean>>(this.api.localStorage.getTermsOfUseAcceptance);

  @observable setTermsOfUseAcceptanceRequest: Request<void => Promise<void>>
    = new Request<void => Promise<void>>(this.api.localStorage.setTermsOfUseAcceptance);

  @observable getLastLaunchVersionRequest: Request<void => Promise<string>>
    = new Request<void => Promise<string>>(this.api.localStorage.getLastLaunchVersion);

  @observable setLastLaunchVersionRequest: Request<string => Promise<void>>
    = new Request<string => Promise<void>>(this.api.localStorage.setLastLaunchVersion);

  @observable getSelectedExplorerRequest: Request<GetSelectedExplorerFunc>
    = new Request<GetSelectedExplorerFunc>(this.api.ada.getSelectedExplorer);

  @observable setSelectedExplorerRequest: Request<SaveSelectedExplorerFunc>
    = new Request<SaveSelectedExplorerFunc>(this.api.ada.saveSelectedExplorer);

  @observable getHideBalanceRequest: Request<void => Promise<boolean>>
    = new Request<void => Promise<boolean>>(this.api.localStorage.getHideBalance);

  @observable setHideBalanceRequest: Request<boolean => Promise<void>>
    = new Request<boolean => Promise<void>>(this.api.localStorage.setHideBalance);

  setup() {
    this.actions.profile.updateLocale.listen(this._updateLocale);
    this.actions.profile.updateSelectedExplorer.listen(this.setSelectedExplorer);
    this.actions.profile.acceptTermsOfUse.listen(this._acceptTermsOfUse);
    this.actions.profile.updateTheme.listen(this._updateTheme);
    this.actions.profile.exportTheme.listen(this._exportTheme);
    this.actions.profile.redirectToTermsOfUse.listen(this._redirectToTermsOfUse);
    this.actions.profile.updateHideBalance.listen(this._updateHideBalance);
    this.registerReactions([
      this._setBigNumberFormat,
      this._updateMomentJsLocaleAfterLocaleChange,
      this._redirectToLanguageSelectionIfNoLocaleSet,
      this._redirectToTermsOfUseScreenIfTermsNotAccepted,
      this._redirectToMainUiAfterTermsAreAccepted,
      this._attemptURIProtocolRegistrationIfNoLocaleSet,
    ]);
    this._getTermsOfUseAcceptance(); // eagerly cache
  }

  teardown() {
    super.teardown();
  }

  _setBigNumberFormat = () => {
    BigNumber.config({ FORMAT: this.bigNumberDecimalFormat });
  };


  static getDefaultLocale() {
    return 'en-US';
  }
  static getDefaultTheme(): Theme {
    return THEMES.YOROI_CLASSIC;
  }

  // ========== Locale ========== //

  @computed get currentLocale(): string {
    const { result } = this.getProfileLocaleRequest.execute();
    if (this.isCurrentLocaleSet && result) return result;
    return ProfileStore.getDefaultLocale();
  }

  @computed get hasLoadedCurrentLocale(): boolean {
    return (
      this.getProfileLocaleRequest.wasExecuted && this.getProfileLocaleRequest.result !== null
    );
  }

  @computed get isCurrentLocaleSet(): boolean {
    return (this.getProfileLocaleRequest.result !== null && this.getProfileLocaleRequest.result !== '');
  }

  _updateLocale = async ({ locale }: { locale: string }) => {
    await this.setProfileLocaleRequest.execute(locale);
    await this.getProfileLocaleRequest.execute(); // eagerly cache
  };

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

  // ========== Current/Custom Theme ========== //

  @computed get currentTheme(): Theme {
    // TODO: Tests were written for the old theme so we need to use it for testing
    if (environment.isTest()) {
      return THEMES.YOROI_CLASSIC;
    }

    const { result } = this.getThemeRequest.execute();
    if (this.isCurrentThemeSet && result) {
      // verify content is an actual theme
      if (Object.values(THEMES).find(theme => theme === result)) {
        // $FlowFixMe: can safely cast
        return result;
      }
    }

    // THEMES.YOROI_MODERN is the default theme
    return THEMES.YOROI_MODERN;
  }

  @computed get isModernTheme(): boolean {
    return this.currentTheme === THEMES.YOROI_MODERN;
  }

  @computed get isClassicTheme(): boolean {
    return this.currentTheme === THEMES.YOROI_CLASSIC;
  }

  /* @Returns Merged Pre-Built Theme and Custom Theme */
  @computed get currentThemeVars() {
    const { result } = this.getCustomThemeRequest.execute();
    const currentThemeVars = this.getThemeVars({ theme: this.currentTheme });
    let customThemeVars = {};
    if (result && result !== '') customThemeVars = JSON.parse(result);
    // Merge Custom Theme and Current Theme
    return { ...currentThemeVars, ...customThemeVars };
  }

  @computed get isCurrentThemeSet(): boolean {
    return (
      this.getThemeRequest.result !== null &&
      this.getThemeRequest.result !== ''
    );
  }

  @computed get hasLoadedCurrentTheme(): boolean {
    return (
      this.getThemeRequest.wasExecuted &&
      this.getThemeRequest.result !== null
    );
  }

  _updateTheme = async ({ theme }: { theme: string }) => {
    // Unset / Clear the Customized Theme from LocalStorage
    await this.unsetCustomThemeRequest.execute();
    await this.getCustomThemeRequest.execute(); // eagerly cache
    await this.setThemeRequest.execute(theme);
    await this.getThemeRequest.execute(); // eagerly cache
  };

  _exportTheme = async () => {
    // TODO: It should be ok to access DOM Style from here
    // but not sure about project conventions about accessing the DOM (Clark)
    const html = document.querySelector('html');
    if (html) {
      const attributes: any = html.attributes;
      await this.unsetCustomThemeRequest.execute();
      await this.setCustomThemeRequest.execute({
        customThemeVars: (attributes.style.value: string),
        currentThemeVars: this.getThemeVars({ theme: this.currentTheme })
      });
      await this.getCustomThemeRequest.execute(); // eagerly cache
    }
  };

  getThemeVars = ({ theme }: { theme: string }) => {
    if (theme) return require(`../../themes/prebuilt/${theme}.js`);
    return require(`../../themes/prebuilt/${ProfileStore.getDefaultTheme()}.js`); // default
  };

  hasCustomTheme = (): boolean => {
    const { result } = this.getCustomThemeRequest.execute();
    return result !== '';
  };

  // ========== Paper Wallets ========== //

  @computed get paperWalletsIntro(): string {
    try {
      return require(`../../i18n/locales/paper-wallets/intro/${this.currentLocale}.md`);
    } catch {
      return require(`../../i18n/locales/paper-wallets/intro/${ProfileStore.getDefaultLocale()}.md`);
    }
  }

  // ========== Terms of Use ========== //

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

  _acceptTermsOfUse = async () => {
    await this.setTermsOfUseAcceptanceRequest.execute();
    await this.getTermsOfUseAcceptanceRequest.execute(); // eagerly cache
  };

  _getTermsOfUseAcceptance = () => {
    this.getTermsOfUseAcceptanceRequest.execute();
  };

  // ========== Last Launch Version ========== //

  @computed get lastLaunchVersion(): string {
    const { result } = this.getLastLaunchVersionRequest.execute();
    return result || '0.0.0';
  }

  setLastLaunchVersion = async (version: string) => {
    await this.setLastLaunchVersionRequest.execute(version);
    await this.getLastLaunchVersionRequest.execute(); // eagerly cache
  };

  @computed get hasLoadedLastLaunchVersion(): boolean {
    return (
      this.getLastLaunchVersionRequest.wasExecuted &&
      this.getLastLaunchVersionRequest.result !== null
    );
  }

  // ========== Selected Explorer ========== //

  @computed get selectedExplorer(): ExplorerType {
    const { result } = this.getSelectedExplorerRequest.execute();
    return result || 'seiza';
  }

  setSelectedExplorer = async ({ explorer }: { explorer: ExplorerType }) => {
    await this.setSelectedExplorerRequest.execute({ explorer });
    await this.getSelectedExplorerRequest.execute(); // eagerly cache
  };

  @computed get hasLoadedSelectedExplorer(): boolean {
    return (
      this.getSelectedExplorerRequest.wasExecuted &&
      this.getSelectedExplorerRequest.result !== null
    );
  }

  // ========== Show/hide Balance ========== //

  @computed get shouldHideBalance(): boolean {
    const { result } = this.getHideBalanceRequest.execute();
    return result === true;
  }

  _updateHideBalance = async () => {
    const shouldHideBalance = this.shouldHideBalance;
    await this.setHideBalanceRequest.execute(shouldHideBalance);
    await this.getHideBalanceRequest.execute();
  };


  // ========== Redirec Logic ========== //

  _redirectToLanguageSelectionIfNoLocaleSet = () => {
    const { isLoading } = this.stores.loading;
    if (!isLoading && !this.areTermsOfUseAccepted && !this.isCurrentLocaleSet) {
      this.actions.router.goToRoute.trigger({ route: ROUTES.PROFILE.LANGUAGE_SELECTION });
    }
  };

  _redirectToTermsOfUseScreenIfTermsNotAccepted = () => {
    if (this.isCurrentLocaleSet && !this.areTermsOfUseAccepted &&
      this.stores.app.currentRoute !== ROUTES.PROFILE.TERMS_OF_USE &&
      this.stores.app.currentRoute !== ROUTES.PROFILE.LANGUAGE_SELECTION) {
      this.actions.router.goToRoute.trigger({ route: ROUTES.PROFILE.TERMS_OF_USE });
    }
  }

  _redirectToTermsOfUse = async (values) => {
    // this await call is needed because when the language select from
    // is submitted without changing the default option, then the onChange
    // event never gets called and updateLocale is never triggered.
    await this._updateLocale(values);
    if (!this.areTermsOfUseAccepted && this.isCurrentLocaleSet) {
      this.actions.router.goToRoute.trigger({ route: ROUTES.PROFILE.TERMS_OF_USE });
    }
  };

  _redirectToRoot = () => {
    this.actions.router.goToRoute.trigger({ route: ROUTES.WALLETS.ROOT });
  };

  _isOnTermsOfUsePage = () => this.stores.app.currentRoute === ROUTES.PROFILE.TERMS_OF_USE;

  _redirectToMainUiAfterTermsAreAccepted = () => {
    if (this.areTermsOfUseAccepted && this._isOnTermsOfUsePage()) {
      this._redirectToRoot();
    }
  };

  // ========== URI protocol registration ========== //

  _attemptURIProtocolRegistrationIfNoLocaleSet = () => {
    const { isLoading } = this.stores.loading;
    if (!isLoading && !this.areTermsOfUseAccepted && !this.isCurrentLocaleSet) {
      // this is likely the first time the user launches the app
      registerProtocols();
    }
  };
}
