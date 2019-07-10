// @flow
import { action, observable, computed, runInAction } from 'mobx';
import BigNumber from 'bignumber.js';
import moment from 'moment/moment';
import Store from '../base/Store';
import Request from '../lib/LocalizedRequest';
import environment from '../../environment';
import { THEMES } from '../../themes';
import type { Theme } from '../../themes';
import { ROUTES } from '../../routes-config';
import globalMessages from '../../i18n/global-messages';
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

  /**
   * Need to store the selected language in-memory for when the user
   * is at the language select screen. Only commit to storage once the user accepts.
   */
  @observable
  inMemoryLanguage: null | string = null;

  /**
   * We only want to redirect users once when the app launches
   */
  @observable
  hasRedirected: boolean = false;

  /** Linear list of steps that need to be completed before app start */
  @observable
  SETUP_STEPS = [
    {
      isDone: () => (this.isCurrentLocaleSet),
      action: () => {
        const route = ROUTES.PROFILE.LANGUAGE_SELECTION;
        if (this.stores.app.currentRoute === route) {
          return;
        }
        this.actions.router.goToRoute.trigger({ route });
      },
    },
    {
      isDone: () => this.areTermsOfUseAccepted,
      action: () => {
        const route = ROUTES.PROFILE.TERMS_OF_USE;
        if (this.stores.app.currentRoute === route) {
          return;
        }
        this.actions.router.goToRoute.trigger({ route });
      },
    },
    {
      isDone: () => {
        return !environment.userAgentInfo.canRegisterProtocol() || this.isUriSchemeAccepted;
      },
      action: () => {
        const route = ROUTES.PROFILE.URI_PROMPT;
        if (this.stores.app.currentRoute === route) {
          return;
        }
        this.actions.router.goToRoute.trigger({ route });
      },
    },
    {
      isDone: () => this.hasRedirected,
      action: async () => {
        const { wallets } = this.stores.substores[environment.API];
        await wallets.refreshWalletsData();
        if (wallets.first) {
          const firstWallet = wallets.first;

          if (this.stores.loading.fromUriScheme) {
            this.actions.router.goToRoute.trigger({ route: ROUTES.SEND_FROM_URI.ROOT });
          } else {
            this.actions.router.goToRoute.trigger({
              route: ROUTES.WALLETS.TRANSACTIONS,
              params: { id: firstWallet.id }
            });
          }
        } else {
          this.actions.router.goToRoute.trigger({ route: ROUTES.WALLETS.ADD });
        }
        runInAction(() => {
          this.hasRedirected = true;
        });
      }
    },
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

  @observable unsetProfileLocaleRequest: Request<void => Promise<void>>
    = new Request<void => Promise<void>>(this.api.localStorage.unsetUserLocale);

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

  @observable getUriSchemeAcceptanceRequest: Request<void => Promise<boolean>>
  = new Request<void => Promise<boolean>>(this.api.localStorage.getUriSchemeAcceptance);

  @observable setUriSchemeAcceptanceRequest: Request<void => Promise<void>>
    = new Request<void => Promise<void>>(this.api.localStorage.setUriSchemeAcceptance);

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
    this.actions.profile.updateTentativeLocale.listen(this._updateTentativeLocale);
    this.actions.profile.updateSelectedExplorer.listen(this.setSelectedExplorer);
    this.actions.profile.acceptTermsOfUse.listen(this._acceptTermsOfUse);
    this.actions.profile.acceptUriScheme.listen(this._acceptUriScheme);
    this.actions.profile.updateTheme.listen(this._updateTheme);
    this.actions.profile.exportTheme.listen(this._exportTheme);
    this.actions.profile.commitLocaleToStorage.listen(this._acceptLocale);
    this.actions.profile.updateHideBalance.listen(this._updateHideBalance);
    this.registerReactions([
      this._setBigNumberFormat,
      this._updateMomentJsLocaleAfterLocaleChange,
      this._checkSetupSteps,
    ]);
    this._getTermsOfUseAcceptance(); // eagerly cache
    this._getUriSchemeAcceptance(); // eagerly cache
  }

  teardown() {
    super.teardown();
  }

  _setBigNumberFormat = () => {
    BigNumber.config({ FORMAT: this.bigNumberDecimalFormat });
  };


  static getDefaultLocale(): string {
    return 'en-US';
  }
  static getDefaultTheme(): Theme {
    return THEMES.YOROI_CLASSIC;
  }

  // ========== Locale ========== //

  @computed get currentLocale(): string {
    // allow to override the language shown to allow user to pick a language during first app start
    if (this.inMemoryLanguage !== null) {
      return this.inMemoryLanguage;
    }
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

  @action
  _updateTentativeLocale = ({ locale }: { locale: string }) => {
    this.inMemoryLanguage = locale;
  };

  _updateLocale = async ({ locale }: { locale: string }) => {
    await this.setProfileLocaleRequest.execute(locale);
    await this.getProfileLocaleRequest.execute(); // eagerly cache
  };

  _acceptLocale = async () => {
    // commit in-memory language to storage
    await this.setProfileLocaleRequest.execute(
      this.inMemoryLanguage
        ? this.inMemoryLanguage
        : ProfileStore.getDefaultLocale()
    );
    await this.getProfileLocaleRequest.execute(); // eagerly cache
    runInAction(() => {
      this.inMemoryLanguage = null;
    });
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

  // ========== URI Scheme acceptance ========== //

  @computed get hasLoadedUriSchemeAcceptance(): boolean {
    return (
      this.getUriSchemeAcceptanceRequest.wasExecuted &&
      this.getUriSchemeAcceptanceRequest.result !== null
    );
  }

  @computed get isUriSchemeAccepted(): boolean {
    return this.getUriSchemeAcceptanceRequest.result === true;
  }

  _acceptUriScheme = async () => {
    await this.setUriSchemeAcceptanceRequest.execute();
    await this.getUriSchemeAcceptanceRequest.execute(); // eagerly cache
  };

  _getUriSchemeAcceptance = () => {
    this.getUriSchemeAcceptanceRequest.execute();
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

  _checkSetupSteps = async () => {
    const { isLoading } = this.stores.loading;
    if (isLoading) {
      return;
    }
    for (const step of this.SETUP_STEPS) {
      if (!step.isDone()) {
        await step.action();
        return;
      }
    }
  }
}
