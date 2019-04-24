// @flow
import Action from './lib/Action';
import type { Themes } from '../types/ThemeType';

// ======= PROFILE ACTIONS =======

export default class ProfileActions {
  acceptTermsOfUse: Action<any> = new Action();
  updateLocale: Action<{ locale: string }> = new Action();
  updateTheme: Action<{ theme: Themes }> = new Action();
  exportTheme: Action<any> = new Action();
  updateMarkup: Action<void> = new Action();
}
