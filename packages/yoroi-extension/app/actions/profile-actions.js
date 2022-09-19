// @flow
import { AsyncAction, Action } from './lib/Action';
import type { NetworkRow } from '../api/ada/lib/storage/database/primitives/tables';
import BaseProfileActions from './base/base-profile-actions';
import type { WalletsNavigation } from '../api/localStorage';
// ======= PROFILE ACTIONS =======

export default class ProfileActions extends BaseProfileActions {
  acceptTermsOfUse: AsyncAction<void> = new AsyncAction();
  acceptUriScheme: AsyncAction<void> = new AsyncAction();
  toggleSidebar: AsyncAction<void> = new AsyncAction();
  updateSortedWalletList: AsyncAction<WalletsNavigation> = new AsyncAction();
  setSelectedNetwork: Action<void | $ReadOnly<NetworkRow>> = new Action();
}
