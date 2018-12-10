// @flow
import Action from './lib/Action';

// ======= PROFILE ACTIONS =======

export default class ProfileActions {
  acceptTermsOfUse: Action<any> = new Action();
  updateLocale: Action<{ locale: string }> = new Action();
  toggleLockScreen: Action<any> = new Action();
  setPinCode: Action<string> = new Action();
  checkAppLocked: Action<any> = new Action();
  toggleAppLocked: Action<any> = new Action();
}
