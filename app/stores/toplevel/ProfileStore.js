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
import { LANGUAGES } from '../../i18n/translations';
import type { LanguageType } from '../../i18n/translations';
import type { ExplorerType } from '../../domain/Explorer';
import type {
  GetSelectedExplorerFunc, SaveSelectedExplorerFunc,
} from '../../api/ada';
import type {
  SetCustomUserThemeRequest
} from '../../api/localStorage/index';
import { unitOfAccountDisabledValue } from '../../types/unitOfAccountType';
import type { UnitOfAccountSettingType } from '../../types/unitOfAccountType';
import { SUPPORTED_CURRENCIES } from '../../config/unitOfAccount';
import type { ApiOptionType, SelectedApiType } from '../../api/common/utils';
import type { ComplexityLevelType } from '../../types/complexityLevelType';
import { getApiMeta } from '../../api/common/utils';

export default class ProfileStore extends Store {

  LANGUAGE_OPTIONS: Array<LanguageType> = [
    ...LANGUAGES,
    ...(!environment.isProduction()
      ? [
        // add any language that's mid-translation here
      ]
      : [])
  ];

  UNIT_OF_ACCOUNT_OPTIONS: typeof SUPPORTED_CURRENCIES = SUPPORTED_CURRENCIES;

  @observable __selectedAPI: void | SelectedApiType = undefined;

  /**
   * Need to store the selected language in-memory for when the user
   * is at the language select screen. Only commit to storage once the user accepts.
   */
  @observable
  inMemoryLanguage: null | string = null;

  @observable
  acceptedNightly: boolean = false;

  /**
   * We only want to redirect users once when the app launches
   */
  @observable
  hasRedirected: boolean = false;

  /** Linear list of steps that need to be completed before app start */
  @observable
  SETUP_STEPS: Array<{| isDone: void => boolean, action: void => Promise<void> |}> = [
    {
      isDone: () => (this.isCurrentLocaleSet),
      action: async () => {
        const route = ROUTES.PROFILE.LANGUAGE_SELECTION;
        if (this.stores.app.currentRoute === route) {
          return;
        }
        this.actions.router.goToRoute.trigger({ route });
      },
    },
    {
      isDone: () => this.areTermsOfUseAccepted,
      action: async () => {
        const route = ROUTES.PROFILE.TERMS_OF_USE;
        if (this.stores.app.currentRoute === route) {
          return;
        }
        this.actions.router.goToRoute.trigger({ route });
      },
    },
    {
      isDone: () => this.isComplexityLevelSelected,
      action: async () => {
        const route = ROUTES.PROFILE.COMPLEXITY_LEVEL;
        if (this.stores.app.currentRoute === route) {
          return;
        }
        this.actions.router.goToRoute.trigger({ route });
      },
    },
    {
      isDone: () => !environment.isNightly() || this.acceptedNightly,
      action: async () => {
        const route = ROUTES.NIGHTLY_INFO;
        if (this.stores.app.currentRoute === route) {
          return;
        }
        this.actions.router.goToRoute.trigger({ route });
      },
    },
    {
      isDone: () => (
        environment.isJormungandr() || // disable for Shelley to avoid overriding mainnet Yoroi URI
        !environment.userAgentInfo.canRegisterProtocol() ||
        this.isUriSchemeAccepted
      ),
      action: async () => {
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
        const { wallets } = this.stores;

        // note: we want to load memos BEFORE we start syncing wallets
        // this is because syncing wallets will also try and sync memos with external storage
        await this.stores.memos.loadFromStorage();
        await this.stores.coinPriceStore.loadFromStorage();
        await this.stores.coinPriceStore.refreshCurrentCoinPrice();

        await wallets.restoreWalletsFromStorage();
        if (wallets.hasAnyPublicDeriver && this.stores.loading.fromUriScheme) {
          this.actions.router.goToRoute.trigger({ route: ROUTES.SEND_FROM_URI.ROOT });
        } else {
          const firstWallet = wallets.first;
          if (firstWallet == null) {
            this.actions.router.goToRoute.trigger({ route: ROUTES.WALLETS.ADD });
          } else if (wallets.publicDerivers.length === 1) {
            // if user only has 1 wallet, just go to it directly as a shortcut
            this.actions.router.goToRoute.trigger({
              route: ROUTES.WALLETS.TRANSACTIONS,
              params: { id: firstWallet.getPublicDeriverId() }
            });
          } else {
            this.actions.router.goToRoute.trigger({
              route: ROUTES.MY_WALLETS,
            });
          }
        }
        if (this.stores.loading.shouldRedirect) {
          this.actions.loading.redirect.trigger();
        }
        runInAction(() => {
          this.hasRedirected = true;
        });
      }
    },
  ];

  @observable bigNumberDecimalFormat: {|
    decimalSeparator: string,
    groupSeparator: string,
    groupSize: number,
    secondaryGroupSize: number,
    fractionGroupSeparator: string,
    fractionGroupSize: number,
  |} = {
    decimalSeparator: '.',
    groupSeparator: ',',
    groupSize: 3,
    secondaryGroupSize: 0,
    fractionGroupSeparator: ' ',
    fractionGroupSize: 0
  };

  @observable getProfileLocaleRequest: Request<void => Promise<?string>>
    = new Request<void => Promise<?string>>(this.api.localStorage.getUserLocale);

  @observable setProfileLocaleRequest: Request<string => Promise<void>>
    = new Request<string => Promise<void>>(this.api.localStorage.setUserLocale);

  @observable unsetProfileLocaleRequest: Request<void => Promise<void>>
    = new Request<void => Promise<void>>(this.api.localStorage.unsetUserLocale);

  @observable getThemeRequest: Request<void => Promise<?string>>
    = new Request<void => Promise<?string>>(this.api.localStorage.getUserTheme);

  @observable setThemeRequest: Request<string => Promise<void>>
    = new Request<string => Promise<void>>(this.api.localStorage.setUserTheme);

  @observable getCustomThemeRequest: Request<void => Promise<?string>>
    = new Request<void => Promise<?string>>(this.api.localStorage.getCustomUserTheme);

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

  @observable getComplexityLevelRequest: Request<void => Promise<?ComplexityLevelType>>
  = new Request<void => Promise<?ComplexityLevelType>>(this.api.localStorage.getComplexityLevel);

  @observable setComplexityLevelRequest: Request<ComplexityLevelType => Promise<void>>
    = new Request<ComplexityLevelType => Promise<void>>(this.api.localStorage.setComplexityLevel);

  @observable unsetComplexityLevelRequest: Request<void => Promise<void>>
    = new Request<void => Promise<void>>(this.api.localStorage.unsetComplexityLevel);

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

  @observable setUnitOfAccountRequest: Request<UnitOfAccountSettingType => Promise<void>>
    = new Request(this.api.localStorage.setUnitOfAccount);

  @observable getUnitOfAccountRequest: Request<void => Promise<UnitOfAccountSettingType>>
    = new Request(this.api.localStorage.getUnitOfAccount);

  @observable getToggleSidebarRequest: Request<void => Promise<boolean>>
    = new Request<void => Promise<boolean>>(this.api.localStorage.getToggleSidebar);

  @observable setToggleSidebarRequest: Request<boolean => Promise<void>>
    = new Request<boolean => Promise<void>>(this.api.localStorage.setToggleSidebar);

  setup(): void {
    super.setup();
    this.actions.profile.updateLocale.listen(this._updateLocale);
    this.actions.profile.resetLocale.listen(this._resetLocale);
    this.actions.profile.updateTentativeLocale.listen(this._updateTentativeLocale);
    this.actions.profile.updateSelectedExplorer.listen(this.setSelectedExplorer);
    this.actions.profile.acceptTermsOfUse.listen(this._acceptTermsOfUse);
    this.actions.profile.acceptUriScheme.listen(this._acceptUriScheme);
    this.actions.profile.selectComplexityLevel.listen(this._selectComplexityLevel);
    this.actions.profile.updateTheme.listen(this._updateTheme);
    this.actions.profile.exportTheme.listen(this._exportTheme);
    this.actions.profile.commitLocaleToStorage.listen(this._acceptLocale);
    this.actions.profile.updateHideBalance.listen(this._updateHideBalance);
    this.actions.profile.updateUnitOfAccount.listen(this._updateUnitOfAccount);
    this.actions.profile.toggleSidebar.listen(this._toggleSidebar);
    this.actions.profile.acceptNightly.listen(this._acceptNightly);
    this.actions.profile.setSelectedAPI.listen(this._setSelectedAPI);
    this.registerReactions([
      this._setBigNumberFormat,
      this._updateMomentJsLocaleAfterLocaleChange,
      this._checkSetupSteps,
    ]);
    this._getTermsOfUseAcceptance(); // eagerly cache
    this._getSelectComplexityLevel(); // eagerly cache
    this._getUriSchemeAcceptance(); // eagerly cache
    this.currentTheme; // eagerly cache (note: don't remove -- getter is stateful)
  }

  teardown(): void {
    super.teardown();
  }

  _setBigNumberFormat: void => void = () => {
    BigNumber.config({ FORMAT: this.bigNumberDecimalFormat });
  };


  static getDefaultLocale(): string {
    return 'en-US';
  }

  // ========== Locale ========== //

  @computed get currentLocale(): string {
    // allow to override the language shown to allow user to pick a language during first app start
    if (this.inMemoryLanguage !== null) {
      return this.inMemoryLanguage;
    }
    const { result } = this.getProfileLocaleRequest.execute();
    if (this.isCurrentLocaleSet && result != null && result !== '') return result;

    return ProfileStore.getDefaultLocale();
  }

  @computed get hasLoadedCurrentLocale(): boolean {
    return (
      this.getProfileLocaleRequest.wasExecuted && this.getProfileLocaleRequest.result !== null
    );
  }

  @computed get isCurrentLocaleSet(): boolean {
    return (
      this.getProfileLocaleRequest.result !== null
      &&
      this.getProfileLocaleRequest.result !== undefined
    );
  }

  @action
  _updateTentativeLocale: {| locale: string |} => void = (request) => {
    this.inMemoryLanguage = request.locale;
  };

  _updateLocale: {| locale: string |} => Promise<void> = async ({ locale }) => {
    await this.setProfileLocaleRequest.execute(locale);
    await this.getProfileLocaleRequest.execute(); // eagerly cache
  };

  _resetLocale: void => Promise<void> = async () => {
    await this.unsetProfileLocaleRequest.execute();
    await this.getProfileLocaleRequest.execute();
  };

  _acceptLocale: void => Promise<void> = async () => {
    // commit in-memory language to storage
    await this.setProfileLocaleRequest.execute(
      this.inMemoryLanguage != null
        ? this.inMemoryLanguage
        : ProfileStore.getDefaultLocale()
    );
    await this.getProfileLocaleRequest.execute(); // eagerly cache
    runInAction(() => {
      this.inMemoryLanguage = null;
    });
  }

  _updateMomentJsLocaleAfterLocaleChange: void => void = () => {
    moment.locale(this._convertLocaleKeyToMomentJSLocalKey(this.currentLocale));
    // moment.relativeTimeThreshold('ss', -1);
  };

  _convertLocaleKeyToMomentJSLocalKey: string => string = (localeKey) => {
    // REF -> https://github.com/moment/moment/tree/develop/locale
    let momentJSLocalKey;
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
    if (this.isCurrentThemeSet && result != null) {
      // verify content is an actual theme
      if (Object.values(THEMES).find(theme => theme === result)) {
        // $FlowExpectedError[incompatible-return]: can safely cast
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

  @computed get isShelleyTestnetTheme(): boolean {
    return environment.isJormungandr();
  }

  /* @Returns Merged Pre-Built Theme and Custom Theme */
  @computed get currentThemeVars(): { [key: string]: string, ... } {
    const { result } = this.getCustomThemeRequest.execute();
    const currentThemeVars = this.getThemeVars({ theme: this.currentTheme });
    let customThemeVars = {};
    if (result != null) customThemeVars = JSON.parse(result);
    // Merge Custom Theme and Current Theme
    return { ...currentThemeVars, ...customThemeVars };
  }

  @computed get isCurrentThemeSet(): boolean {
    return (
      this.getThemeRequest.result !== null &&
      this.getThemeRequest.result !== undefined
    );
  }

  @computed get hasLoadedCurrentTheme(): boolean {
    return (
      this.getThemeRequest.wasExecuted &&
      this.getThemeRequest.result !== null
    );
  }

  _updateTheme: {| theme: string |} => Promise<void> = async ({ theme }) => {
    // Unset / Clear the Customized Theme from LocalStorage
    await this.unsetCustomThemeRequest.execute();
    await this.getCustomThemeRequest.execute(); // eagerly cache
    await this.setThemeRequest.execute(theme);
    await this.getThemeRequest.execute(); // eagerly cache
  };

  _exportTheme: void => Promise<void> = async () => {
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

  getThemeVars: {| theme: string |} => { [key: string]: string, ... } = (request) => {
    return getVarsForTheme(request);
  };

  hasCustomTheme: void => boolean = (): boolean => {
    const { result } = this.getCustomThemeRequest.execute();
    return result !== undefined;
  };

  // ========== Active API ========== //

  @computed get selectedAPI(): void | SelectedApiType {
    return this.__selectedAPI;
  }

  @action _setSelectedAPI: (ApiOptionType | void) => void  = (type) => {
    this.__selectedAPI = getApiMeta(type);
  }

  // ========== Paper Wallets ========== //

  @computed get paperWalletsIntro(): string {
    return getPaperWalletIntro(
      this.currentLocale,
      ProfileStore.getDefaultLocale()
    );
  }

  // ========== Terms of Use ========== //

  @computed get termsOfUse(): string {
    return getTermsOfUse('ada', this.currentLocale);
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

  _acceptTermsOfUse: void => Promise<void> = async () => {
    await this.setTermsOfUseAcceptanceRequest.execute();
    await this.getTermsOfUseAcceptanceRequest.execute(); // eagerly cache
  };

  _getTermsOfUseAcceptance: void => void = () => {
    this.getTermsOfUseAcceptanceRequest.execute();
  };

  // ========== Complexity Level Choice ========== //

  @computed get selectedComplexityLevel(): ?ComplexityLevelType {
    const { result } = this.getComplexityLevelRequest.execute();
    return result;
  }

  @computed get isComplexityLevelSelected(): boolean {
    return !!this.getComplexityLevelRequest.result;
  }

  _selectComplexityLevel: ComplexityLevelType => Promise<void> = async (
    level: ComplexityLevelType
  ) :Promise<void> => {
    await this.setComplexityLevelRequest.execute(level);
    await this.getComplexityLevelRequest.execute();
  }
  _getSelectComplexityLevel: void => void = () => {
    this.getComplexityLevelRequest.execute();
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

  _acceptUriScheme: void => Promise<void> = async () => {
    await this.setUriSchemeAcceptanceRequest.execute();
    await this.getUriSchemeAcceptanceRequest.execute(); // eagerly cache
  };

  _getUriSchemeAcceptance: void => void = () => {
    this.getUriSchemeAcceptanceRequest.execute();
  };

  // ========== Last Launch Version ========== //

  @computed get lastLaunchVersion(): string {
    const { result } = this.getLastLaunchVersionRequest.execute();
    return result != null ? result : '0.0.0';
  }

  setLastLaunchVersion: string => Promise<void> = async (
    version: string
  ): Promise<void> => {
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
    if (result == null || result === '') return 'seiza';
    return result;
  }

  setSelectedExplorer: {| explorer: ExplorerType |} => Promise<void> = async (
    { explorer }
  ): Promise<void> => {
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

  _updateHideBalance: void => Promise<void> = async () => {
    const shouldHideBalance = this.shouldHideBalance;
    await this.setHideBalanceRequest.execute(shouldHideBalance);
    await this.getHideBalanceRequest.execute();
  };

  // ========== Expand / Retract Sidebar ========== //

  @computed get isSidebarExpanded(): boolean {
    const { result } = this.getToggleSidebarRequest.execute();
    return result === true;
  }

  _toggleSidebar: void => Promise<void> = async () => {
    const isSidebarExpanded = this.isSidebarExpanded;
    await this.setToggleSidebarRequest.execute(isSidebarExpanded);
    await this.getToggleSidebarRequest.execute();
  };

  @action
  _acceptNightly: void => void = () => {
    this.acceptedNightly = true;
  }

  // ========== Redirect Logic ========== //

  _checkSetupSteps: void => Promise<void> = async () => {
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

  // ========== Coin Price Currency ========== //

  @computed.struct get unitOfAccount(): UnitOfAccountSettingType {
    const { result } = this.getUnitOfAccountRequest.execute();
    return result || unitOfAccountDisabledValue;
  }

  _updateUnitOfAccount: UnitOfAccountSettingType => Promise<void> = async (currency) => {
    await this.setUnitOfAccountRequest.execute(currency);
    await this.getUnitOfAccountRequest.execute(); // eagerly cache

    await this.stores.coinPriceStore.refreshCurrentUnit.execute().promise;
  };

  @computed get hasLoadedUnitOfAccount(): boolean {
    return (
      this.getUnitOfAccountRequest.wasExecuted &&
      this.getUnitOfAccountRequest.result !== null
    );
  }

}

export const getVarsForTheme: {|
  theme: string
|} => { [key: string]: string, ... } = ({ theme }) => {
  const { getThemeVars } = require(`../../themes/prebuilt/${theme}.js`);
  if (environment.isJormungandr()) {
    return getThemeVars('shelley');
  }
  return getThemeVars(undefined);
};

export function getPaperWalletIntro(
  currentLocale: string,
  defaultLocale: string,
): string {
  try {
    return require(`../../i18n/locales/paper-wallets/intro/${currentLocale}.md`);
  } catch {
    return require(`../../i18n/locales/paper-wallets/intro/${defaultLocale}.md`);
  }
}

export function getTermsOfUse(
  api: 'ada',
  currentLocale: string,
): string {
  const tos = require(`../../i18n/locales/terms-of-use/${api}/${currentLocale}.md`);
  if (environment.isJormungandr()) {
    const testnetAddition = require(`../../i18n/locales/terms-of-use/itn/${currentLocale}.md`);
    return tos + '\n\n' + testnetAddition;
  }
  return tos;
}
