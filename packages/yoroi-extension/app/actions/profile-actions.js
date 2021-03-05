// @flow
import { AsyncAction, Action } from './lib/Action';
import type { UnitOfAccountSettingType } from '../types/unitOfAccountType';
import type { ComplexityLevelType } from '../types/complexityLevelType';
import type { NetworkRow } from '../api/ada/lib/storage/database/primitives/tables';

// ======= PROFILE ACTIONS =======

export default class ProfileActions {
  acceptTermsOfUse: AsyncAction<void> = new AsyncAction();
  acceptUriScheme: AsyncAction<void> = new AsyncAction();
  selectComplexityLevel: AsyncAction<ComplexityLevelType> = new AsyncAction();
  updateTentativeLocale: Action<{| locale: string |}> = new Action();
  updateLocale: AsyncAction<{| locale: string |}> = new AsyncAction();
  resetLocale: AsyncAction<void> = new AsyncAction();
  updateTheme: AsyncAction<{| theme: string |}> = new AsyncAction();
  exportTheme: AsyncAction<void> = new AsyncAction();
  commitLocaleToStorage: AsyncAction<void> = new AsyncAction();
  updateHideBalance: AsyncAction<void> = new AsyncAction();
  toggleSidebar: AsyncAction<void> = new AsyncAction();
  acceptNightly: Action<void> = new Action();
  updateUnitOfAccount: AsyncAction<UnitOfAccountSettingType> = new AsyncAction();
  setSelectedNetwork: Action<void | $ReadOnly<NetworkRow>> = new Action();
}
