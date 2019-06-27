// @flow
import Action from './lib/Action';
import type { ExplorerType } from '../domain/Explorer';

// ======= PROFILE ACTIONS =======

export default class ProfileActions {
  acceptTermsOfUse: Action<void> = new Action();
  updateLocale: Action<{ locale: string }> = new Action();
  updateSelectedExplorer: Action<{ explorer: ExplorerType }> = new Action();
  updateTheme: Action<{ theme: string }> = new Action();
  exportTheme: Action<any> = new Action();
  redirectToTermsOfUse: Action<{ locale: string }> = new Action();
}
