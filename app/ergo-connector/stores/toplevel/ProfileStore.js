// @flow
import { observable, computed, runInAction, action } from 'mobx';
import Request from '../../../stores/lib/LocalizedRequest';
import environment from '../../../environment';
import { THEMES } from '../../../themes';
import type { Theme } from '../../../themes';
import { LANGUAGES } from '../../../i18n/translations';
import type { LanguageType } from '../../../i18n/translations';
import type { SetCustomUserThemeRequest } from '../../../api/localStorage/index';
import { SUPPORTED_CURRENCIES } from '../../../config/unitOfAccount';
import Store from '../../../stores/base/Store';
import moment from 'moment/moment';
import type { ActionsMap } from '../../actions/index';
import type { StoresMap } from '../index';
import { getTermsOfUse } from '../../../stores/toplevel/ProfileStore';

export default class ProfileStore extends Store<StoresMap, ActionsMap> {
  LANGUAGE_OPTIONS: Array<LanguageType> = [
    ...LANGUAGES,
    ...(!environment.isProduction()
      ? [
          // add any language that's mid-translation here
        ]
      : []),
  ];

  UNIT_OF_ACCOUNT_OPTIONS: typeof SUPPORTED_CURRENCIES = SUPPORTED_CURRENCIES;
  @observable
  inMemoryLanguage: null | string = null;

  @observable getThemeRequest: Request<(void) => Promise<?string>> = new Request<
    (void) => Promise<?string>
  >(this.api.localStorage.getUserTheme);

  @observable getCustomThemeRequest: Request<(void) => Promise<?string>> = new Request<
    (void) => Promise<?string>
  >(this.api.localStorage.getCustomUserTheme);

  @observable setCustomThemeRequest: Request<
    (SetCustomUserThemeRequest) => Promise<void>
  > = new Request<(SetCustomUserThemeRequest) => Promise<void>>(
    this.api.localStorage.setCustomUserTheme
  );

  @observable getProfileLocaleRequest: Request<(void) => Promise<?string>> = new Request<
    (void) => Promise<?string>
  >(this.api.localStorage.getUserLocale);

  @observable setProfileLocaleRequest: Request<(string) => Promise<void>> = new Request<
    (string) => Promise<void>
  >(this.api.localStorage.setUserLocale);

  @observable unsetProfileLocaleRequest: Request<(void) => Promise<void>> = new Request<
    (void) => Promise<void>
  >(this.api.localStorage.unsetUserLocale);

  setup(): void {
    super.setup();
    this.actions.profile.updateLocale.listen(this._updateLocale);
    this.actions.profile.resetLocale.listen(this._resetLocale);
    this.actions.profile.updateTentativeLocale.listen(this._updateTentativeLocale);
    this.currentTheme;
  }

  teardown(): void {
    super.teardown();
  }

  static getDefaultLocale(): string {
    return 'en-US';
  }

  // ========== Current/Custom Theme ========== //

  @computed get currentTheme(): Theme {
    // TODO: Tests were written for the old theme so we need to use it for testing
    if (environment.isTest()) {
      return THEMES.YOROI_CLASSIC;
    }

    let { result } = this.getThemeRequest;
    if (result == null) {
      result = this.getThemeRequest.execute().result;
    }
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

  /* @Returns Merged Pre-Built Theme and Custom Theme */
  @computed get currentThemeVars(): { [key: string]: string, ... } {
    const currentThemeVars = this.getThemeVars({ theme: this.currentTheme });
    let { result } = this.getCustomThemeRequest;
    if (result == null) {
      result = this.getCustomThemeRequest.execute().result;
    }
    let customThemeVars = {};
    if (result != null) customThemeVars = JSON.parse(result);
    // Merge Custom Theme and Current Theme
    return { ...currentThemeVars, ...customThemeVars };
  }

  @computed get isCurrentThemeSet(): boolean {
    return this.getThemeRequest.result !== null && this.getThemeRequest.result !== undefined;
  }

  @computed get hasLoadedCurrentTheme(): boolean {
    return this.getThemeRequest.wasExecuted && this.getThemeRequest.result !== null;
  }

  getThemeVars: ({| theme: string |}) => { [key: string]: string, ... } = request => {
    return getVarsForTheme(request);
  };

  hasCustomTheme: void => boolean = (): boolean => {
    let { result } = this.getCustomThemeRequest;
    if (result == null) {
      result = this.getCustomThemeRequest.execute().result;
    }
    return result !== undefined;
  };

  // ========== Terms of Use ========== //

  @computed get termsOfUse(): string {
    return getTermsOfUse('ada', this.currentLocale);
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

    return ProfileStore.getDefaultLocale();
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
      this.inMemoryLanguage != null ? this.inMemoryLanguage : ProfileStore.getDefaultLocale()
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
}

export const getVarsForTheme: ({|
  theme: string,
|}) => { [key: string]: string, ... } = ({ theme }) => {
  const { getThemeVars } = require(`../../../themes/prebuilt/${theme}.js`);
  // we used this theme for the Shelley version of the Yoroi extension
  // however, going forward, Yoroi will be a mono-project containing all sub-networks
  // eslint-disable-next-line no-constant-condition
  if (false) {
    return getThemeVars('shelley');
  }
  return getThemeVars(undefined);
};
