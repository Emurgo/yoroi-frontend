// @flow
import { action, observable, computed, runInAction } from 'mobx';
import BigNumber from 'bignumber.js';
import moment from 'moment/moment';
import Store from './Store';
import Request from '../lib/LocalizedRequest';
import environment from '../../environment';
import { LANGUAGES } from '../../i18n/translations';
import type { LanguageType } from '../../i18n/translations';
import { unitOfAccountDisabledValue } from '../../types/unitOfAccountType';
import type { UnitOfAccountSettingType } from '../../types/unitOfAccountType';
import { SUPPORTED_CURRENCIES } from '../../config/unitOfAccount';
import type { ComplexityLevelType } from '../../types/complexityLevelType';
import BaseProfileActions from '../../actions/base/base-profile-actions';
import { CURRENT_TOS_VERSION } from '../../i18n/locales/terms-of-use/ada/index';
import { ampli } from '../../../ampli/index';
import type { LoadOptionsWithEnvironment } from '../../../ampli/index';
import { noop } from '../../coreUtils';
import type { Theme } from '../../styles/themes';
import { THEMES } from '../../styles/themes';

interface LoadingStore {
  +registerBlockingLoadingRequest: (promise: Promise<void>, name: string) => void
}

export default class BaseProfileStore
  <
    TStores: {
      +loading: LoadingStore,
      ...
    },
    TActions: { +profile: BaseProfileActions, ... }
  >
  extends Store<TStores, TActions>
{

  LANGUAGE_OPTIONS: Array<LanguageType> = [
    ...LANGUAGES,
    ...(!environment.isProduction()
      ? [
          // add any language that's mid-translation here
        ]
      : []),
  ];

  UNIT_OF_ACCOUNT_OPTIONS: typeof SUPPORTED_CURRENCIES = SUPPORTED_CURRENCIES;

  /**
   * Need to store the selected language in-memory for when the user
   * is at the language select screen. Only commit to storage once the user accepts.
   */
  @observable
  inMemoryLanguage: null | string = null;

  @observable
  acceptedNightly: boolean = false;

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
    fractionGroupSize: 0,
  };

  @observable getProfileLocaleRequest: Request<(void) => Promise<?string>> = new Request<
    (void) => Promise<?string>
  >(this.api.localStorage.getUserLocale);

  @observable setProfileLocaleRequest: Request<(string) => Promise<void>> = new Request<
    (string) => Promise<void>
  >(this.api.localStorage.setUserLocale);

  @observable unsetProfileLocaleRequest: Request<(void) => Promise<void>> = new Request<
    (void) => Promise<void>
  >(this.api.localStorage.unsetUserLocale);

  @observable getUserRevampMigrationStatusRequest: Request<
    (void) => Promise<boolean>
  > = new Request<(void) => Promise<boolean>>(this.api.localStorage.getUserRevampMigrationStatus);

  @observable setUserRevampMigrationStatusRequest: Request<
    (boolean) => Promise<void>
  > = new Request<(boolean) => Promise<void>>(this.api.localStorage.setUserRevampMigrationStatus);

  @observable getUserRevampAnnouncementStatusRequest: Request<
    (void) => Promise<boolean>
  > = new Request<(void) => Promise<boolean>>(
    this.api.localStorage.getUserRevampAnnouncementStatus
  );

  @observable setUserRevampAnnouncementStatusRequest: Request<
    (boolean) => Promise<void>
  > = new Request<(boolean) => Promise<void>>(
    this.api.localStorage.setUserRevampAnnouncementStatus
  );

  @observable getComplexityLevelRequest: Request<
    (void) => Promise<?ComplexityLevelType>
  > = new Request<(void) => Promise<?ComplexityLevelType>>(
    this.api.localStorage.getComplexityLevel
  );

  @observable setComplexityLevelRequest: Request<
    (ComplexityLevelType) => Promise<void>
  > = new Request<(ComplexityLevelType) => Promise<void>>(this.api.localStorage.setComplexityLevel);

  @observable unsetComplexityLevelRequest: Request<(void) => Promise<void>> = new Request<
    (void) => Promise<void>
  >(this.api.localStorage.unsetComplexityLevel);

  @observable getLastLaunchVersionRequest: Request<(void) => Promise<string>> = new Request<
    (void) => Promise<string>
  >(this.api.localStorage.getLastLaunchVersion);

  @observable setLastLaunchVersionRequest: Request<(string) => Promise<void>> = new Request<
    (string) => Promise<void>
  >(this.api.localStorage.setLastLaunchVersion);

  @observable getHideBalanceRequest: Request<(void) => Promise<boolean>> = new Request<
    (void) => Promise<boolean>
  >(this.api.localStorage.getHideBalance);

  @observable setHideBalanceRequest: Request<(boolean) => Promise<void>> = new Request<
    (boolean) => Promise<void>
  >(this.api.localStorage.setHideBalance);

  @observable setUnitOfAccountRequest: Request<
    (UnitOfAccountSettingType) => Promise<void>
  > = new Request(this.api.localStorage.setUnitOfAccount);

  @observable getUnitOfAccountRequest: Request<
    (void) => Promise<UnitOfAccountSettingType>
  > = new Request(this.api.localStorage.getUnitOfAccount);

  @observable getIsAnalyticsAllowed: Request<
    (void) => Promise<?boolean>
  > = new Request(this.api.localStorage.loadIsAnalyticsAllowed);

  @observable _acceptedTosVersion: {| version: ?number |} = { version: undefined };

  setup(): void {
    super.setup();
    this.actions.profile.updateLocale.listen(this._updateLocale);
    this.actions.profile.resetLocale.listen(this._resetLocale);
    this.actions.profile.updateTentativeLocale.listen(this._updateTentativeLocale);
    this.actions.profile.selectComplexityLevel.listen(this._selectComplexityLevel);
    this.actions.profile.commitLocaleToStorage.listen(this._acceptLocale);
    this.actions.profile.updateHideBalance.listen(this._updateHideBalance);
    this.actions.profile.updateUnitOfAccount.listen(this._updateUnitOfAccount);
    this.actions.profile.acceptNightly.listen(this._acceptNightly);
    this.actions.profile.optForAnalytics.listen(this._onOptForAnalytics);
    this.actions.profile.markRevampAsAnnounced.listen(this._markRevampAsAnnounced);
    this.registerReactions([
      this._setBigNumberFormat,
      this._updateMomentJsLocaleAfterLocaleChange,
    ]);
    this._getSelectComplexityLevel(); // eagerly cache
    noop(this.isRevampAnnounced);
    noop(this.didUserMigratedToRevampTheme);
    this.stores.loading.registerBlockingLoadingRequest(
      this._loadAcceptedTosVersion(),
      'load-tos-version',
    );
    this.stores.loading.registerBlockingLoadingRequest(
      this._loadWhetherAnalyticsAllowed(),
      'load-analytics-flag',
    );
  }

  _loadWhetherAnalyticsAllowed: () => Promise<void> = async () => {
    const isAnalyticsAllowed = await this.getIsAnalyticsAllowed.execute();
    const AMPLI_FLUSH_INTERVAL_MS = 5000;
    if (ampli.load == null || typeof ampli.load !== 'function') {
      throw new Error(`ampli.load is not available or not a function (${typeof ampli.load})`)
    }
    await ampli.load(({
      environment: environment.isProduction() ? 'production' : 'development',
      client: {
        configuration: {
          optOut: !isAnalyticsAllowed,
          flushIntervalMillis: AMPLI_FLUSH_INTERVAL_MS,
          trackingOptions: {
            ipAddress: false,
          },
          defaultTracking: false,
        },
      },
    }: LoadOptionsWithEnvironment)).promise;
    if (environment.isDev()) {
      ampli.client.add({
        name: 'info-plugin',
        type: 'enrichment',
        setup: () => Promise.resolve(),
        execute: async (event) => {
          console.info('[metrics]', event.event_type, event.event_properties)
          return Promise.resolve(event)
        },
      });
    }
  }

  teardown(): void {
    super.teardown();
  }

  _setBigNumberFormat: void => void = () => {
    BigNumber.config({
      EXPONENTIAL_AT: (1e9: any),
      FORMAT: this.bigNumberDecimalFormat,
    });
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
    let { result } = this.getProfileLocaleRequest;
    if (result == null) {
      result = this.getProfileLocaleRequest.execute().result;
    }
    if (this.isCurrentLocaleSet && result != null && result !== '') return result;

    return BaseProfileStore.getDefaultLocale();
  }

  @computed get hasLoadedCurrentLocale(): boolean {
    return this.getProfileLocaleRequest.wasExecuted && this.getProfileLocaleRequest.result !== null;
  }

  @computed get isCurrentLocaleSet(): boolean {
    return (
      this.getProfileLocaleRequest.result !== null &&
      this.getProfileLocaleRequest.result !== undefined
    );
  }

  @computed get isRevampAnnounced(): boolean {
    let { result } = this.getUserRevampAnnouncementStatusRequest;

    if (result == null) {
      result = this.getUserRevampAnnouncementStatusRequest.execute().result;
    }

    return result === true;
  }

  @action
  _markRevampAsAnnounced: void => Promise<void> = async () => {
    await this.setUserRevampAnnouncementStatusRequest.execute(true);
    await this.getUserRevampAnnouncementStatusRequest.execute();
  };

  @action
  _updateTentativeLocale: ({| locale: string |}) => void = request => {
    this.inMemoryLanguage = request.locale;
  };

  _updateLocale: ({| locale: string |}) => Promise<void> = async ({ locale }) => {
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
      this.inMemoryLanguage != null ? this.inMemoryLanguage : BaseProfileStore.getDefaultLocale()
    );
    await this.getProfileLocaleRequest.execute(); // eagerly cache
    runInAction(() => {
      this.inMemoryLanguage = null;
    });
  };

  _updateMomentJsLocaleAfterLocaleChange: void => void = () => {
    moment.locale(this._convertLocaleKeyToMomentJSLocalKey(this.currentLocale));
    // moment.relativeTimeThreshold('ss', -1);
  };

  _convertLocaleKeyToMomentJSLocalKey: string => string = localeKey => {
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
  };

  // ========== Current/Custom Theme ========== //

  @computed get currentTheme(): Theme {
    return THEMES.YOROI_BASE;
  }

  /**
   * <TODO:PENDING_REMOVAL>
   */
  @computed get isRevampTheme(): boolean {
    return true;
  }

  /**
   * <TODO:PENDING_REMOVAL>
   */
  @computed get isCurrentThemeSet(): boolean {
    return true;
  }

  /**
   * <TODO:PENDING_REMOVAL>
   */
  @computed get didUserMigratedToRevampTheme(): boolean {
    return true;
  }

  /**
   * <TODO:PENDING_REMOVAL>
   */
  @computed get hasLoadedCurrentTheme(): boolean {
    return true;
  }

  /**
   * <TODO:PENDING_REMOVAL>
   */
  hasCustomTheme: void => boolean = (): boolean => {
    return false;
  };

  // ========== Terms of Use ========== //

  @computed get termsOfUse(): string {
    return getTermsOfUse('ada', this.currentLocale);
  }

  @computed get privacyNotice(): string {
    return getPrivacyNotice(this.currentLocale);
  }

  @computed get areTermsOfUseAccepted(): boolean {
    return this._acceptedTosVersion.version === CURRENT_TOS_VERSION;
  }

  _loadAcceptedTosVersion: () => Promise<void> = async () => {
    const acceptedTosVersion = await this.api.localStorage.loadAcceptedTosVersion();
    runInAction(() => {
      this._acceptedTosVersion.version = acceptedTosVersion;
    });
  }

  _acceptTermsOfUse: void => Promise<void> = async () => {
    runInAction(() => {
      this._acceptedTosVersion.version = CURRENT_TOS_VERSION;
    });
    await this.api.localStorage.saveAcceptedTosVersion(CURRENT_TOS_VERSION);
  }

  // ========== Complexity Level Choice ========== //

  @computed get selectedComplexityLevel(): ?ComplexityLevelType {
    let { result } = this.getComplexityLevelRequest;
    if (result == null) {
      result = this.getComplexityLevelRequest.execute().result;
    }
    return result;
  }

  @computed get isComplexityLevelSelected(): boolean {
    return !!this.getComplexityLevelRequest.result;
  }

  _selectComplexityLevel: ComplexityLevelType => Promise<void> = async (
    level: ComplexityLevelType
  ): Promise<void> => {
    await this.setComplexityLevelRequest.execute(level);
    await this.getComplexityLevelRequest.execute();
  };
  _getSelectComplexityLevel: void => void = () => {
    this.getComplexityLevelRequest.execute();
  };

  // ========== Last Launch Version ========== //

  @computed get lastLaunchVersion(): string {
    let { result } = this.getLastLaunchVersionRequest;
    if (result == null) {
      result = this.getLastLaunchVersionRequest.execute().result;
    }
    return result != null ? result : '0.0.0';
  }

  setLastLaunchVersion: string => Promise<void> = async (version: string): Promise<void> => {
    await this.setLastLaunchVersionRequest.execute(version);
    await this.getLastLaunchVersionRequest.execute(); // eagerly cache
  };

  @computed get hasLoadedLastLaunchVersion(): boolean {
    return (
      this.getLastLaunchVersionRequest.wasExecuted &&
      this.getLastLaunchVersionRequest.result !== null
    );
  }

  // ========== Show/hide Balance ========== //

  @computed get shouldHideBalance(): boolean {
    let { result } = this.getHideBalanceRequest;
    if (result == null) {
      result = this.getHideBalanceRequest.execute().result;
    }
    return result === true;
  }

  _updateHideBalance: void => Promise<void> = async () => {
    const shouldHideBalance = this.shouldHideBalance;
    await this.setHideBalanceRequest.execute(shouldHideBalance);
    await this.getHideBalanceRequest.execute();
  };

  // ========== Accept nightly ========== //

  @action
  _acceptNightly: void => void = () => {
    this.acceptedNightly = true;
  };

  // ========== Coin Price Currency ========== //

  @computed.struct get unitOfAccount(): UnitOfAccountSettingType {
    let { result } = this.getUnitOfAccountRequest;
    if (result == null) {
      result = this.getUnitOfAccountRequest.execute().result;
    }
    return result || unitOfAccountDisabledValue;
  }

  getUnitOfAccountBlock: () => Promise<UnitOfAccountSettingType> = async () => {
    const { result } = this.getUnitOfAccountRequest;
    if (result == null) {
      await this.getUnitOfAccountRequest.execute();
    }
    if (this.getUnitOfAccountRequest.result == null) {
      throw new Error('failed to load unit of account setting');
    }
    return this.getUnitOfAccountRequest.result;
  };

  _updateUnitOfAccount: UnitOfAccountSettingType => Promise<void> = async currency => {
    await this.setUnitOfAccountRequest.execute(currency);
    await this.getUnitOfAccountRequest.execute(); // eagerly cache
  };

  @computed get hasLoadedUnitOfAccount(): boolean {
    return this.getUnitOfAccountRequest.wasExecuted && this.getUnitOfAccountRequest.result !== null;
  }

  _onOptForAnalytics: (boolean) => void = (isAnalyticsAllowed) => {
    this.getIsAnalyticsAllowed.patch(_ => isAnalyticsAllowed);
    this.api.localStorage.saveIsAnalysticsAllowed(isAnalyticsAllowed);
    ampli.client.setOptOut(!isAnalyticsAllowed);
  }

  @computed get isAnalyticsOpted(): boolean {
    return typeof this.getIsAnalyticsAllowed.result === 'boolean';
  }

  @computed get analyticsOption(): boolean {
    const result = this.getIsAnalyticsAllowed.result;
    if (result === null) {
      throw new Error('analytics option still loading');
    }
    if (result === undefined) {
      throw new Error('analytics option not determined');
    }
    return result;
  }
}

export function getTermsOfUse(api: 'ada', currentLocale: string): string {
  try {
    return require(`../../i18n/locales/terms-of-use/${api}/${currentLocale}.md`).default;
  } catch {
    return require(`../../i18n/locales/terms-of-use/${api}/en-US.md`).default;
  }
}

export function getPrivacyNotice(currentLocale: string): string {
  try {
    return require(`../../i18n/locales/privacy-notice/${currentLocale}.md`).default;
  } catch {
    return require(`../../i18n/locales/privacy-notice/en-US.md`).default;
  }
}
