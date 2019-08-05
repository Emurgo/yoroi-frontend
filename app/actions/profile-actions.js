// @flow
import Action from './lib/Action';
import type { ExplorerType } from '../domain/Explorer';
import type { CoinPriceCurrencySettingType } from '../types/coinPriceType';

// ======= PROFILE ACTIONS =======

export default class ProfileActions {
  acceptTermsOfUse: Action<void> = new Action();
  acceptUriScheme: Action<void> = new Action();
  updateTentativeLocale: Action<{ locale: string }> = new Action();
  updateLocale: Action<{ locale: string }> = new Action();
  updateSelectedExplorer: Action<{ explorer: ExplorerType }> = new Action();
  updateTheme: Action<{ theme: string }> = new Action();
  exportTheme: Action<void> = new Action();
  commitLocaleToStorage: Action<{ locale: string }> = new Action();
  updateHideBalance: Action<void> = new Action();
  updateCoinPriceCurrency: Action<CoinPriceCurrencySettingType> = new Action();
}
