// @flow
import { AsyncAction, Action } from '../lib/Action';
import type { UnitOfAccountSettingType } from '../../types/unitOfAccountType';
import type { ComplexityLevelType } from '../../types/complexityLevelType';

// ======= PROFILE ACTIONS =======

export default class BaseProfileActions {
  selectComplexityLevel: AsyncAction<ComplexityLevelType> = new AsyncAction();
  updateTentativeLocale: Action<{| locale: string |}> = new Action();
  updateLocale: AsyncAction<{| locale: string |}> = new AsyncAction();
  resetLocale: AsyncAction<void> = new AsyncAction();
  commitLocaleToStorage: AsyncAction<void> = new AsyncAction();
  updateHideBalance: AsyncAction<void> = new AsyncAction();
  acceptNightly: Action<void> = new Action();
  updateUnitOfAccount: AsyncAction<UnitOfAccountSettingType> = new AsyncAction();
  optForAnalytics: Action<boolean> = new Action();
  markRevampAsAnnounced: AsyncAction < void> = new AsyncAction();
}
