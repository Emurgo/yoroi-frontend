// @flow
import { observable, computed } from 'mobx';
import Request from '../../../stores/lib/LocalizedRequest';
import environment from '../../../environment';
import { THEMES } from '../../../themes';
import type { Theme } from '../../../themes';
import { LANGUAGES } from '../../../i18n/translations';
import type { LanguageType } from '../../../i18n/translations';
import type { SetCustomUserThemeRequest } from '../../../api/localStorage/index';
import { SUPPORTED_CURRENCIES } from '../../../config/unitOfAccount';
import Store from '../../../stores/base/Store';

export default class ProfileStore extends Store {
  LANGUAGE_OPTIONS: Array<LanguageType> = [
    ...LANGUAGES,
    ...(!environment.isProduction()
      ? [
          // add any language that's mid-translation here
        ]
      : []),
  ];

  UNIT_OF_ACCOUNT_OPTIONS: typeof SUPPORTED_CURRENCIES = SUPPORTED_CURRENCIES;

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


  @observable getToggleSidebarRequest: Request<(void) => Promise<boolean>> = new Request<
    (void) => Promise<boolean>
  >(this.api.localStorage.getToggleSidebar);

  @observable setToggleSidebarRequest: Request<(boolean) => Promise<void>> = new Request<
    (boolean) => Promise<void>
  >(this.api.localStorage.setToggleSidebar);

  setup(): void {
    super.setup();
    this.actions.profile.toggleSidebar.listen(this._toggleSidebar);
    this.currentTheme; // eagerly cache (note: don't remove -- getter is stateful)
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


  // ========== Expand / Retract Sidebar ========== //

  @computed get isSidebarExpanded(): boolean {
    let { result } = this.getToggleSidebarRequest;
    if (result == null) {
      result = this.getToggleSidebarRequest.execute().result;
    }
    return result === true;
  }

  _toggleSidebar: void => Promise<void> = async () => {
    const isSidebarExpanded = this.isSidebarExpanded;
    await this.setToggleSidebarRequest.execute(isSidebarExpanded);
    await this.getToggleSidebarRequest.execute();
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
