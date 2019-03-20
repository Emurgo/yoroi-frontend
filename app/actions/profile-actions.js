// @flow
import Action from './lib/Action';

// ======= PROFILE ACTIONS =======

export default class ProfileActions {
  acceptTermsOfUse: Action<any> = new Action();
  updateLocale: Action<{ locale: string }> = new Action();
  updateTheme: Action<{ theme: string }> = new Action();
  exportTheme: Action<any> = new Action();
}
