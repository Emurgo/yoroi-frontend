// @flow
import { AsyncAction, Action } from './lib/Action';
import type { NetworkRow } from '../api/ada/lib/storage/database/primitives/tables';
import BaseProfileActions from './base/base-profile-actions';

// ======= PROFILE ACTIONS =======

export default class ProfileActions extends BaseProfileActions {
  acceptTermsOfUse: AsyncAction<void> = new AsyncAction();
  acceptUriScheme: AsyncAction<void> = new AsyncAction();
  toggleSidebar: AsyncAction<void> = new AsyncAction();
  updateSortedWalletList: AsyncAction<{|
    sortedWallets: Array<number>,
  |}> = new AsyncAction();
  setSelectedNetwork: Action<void | $ReadOnly<NetworkRow>> = new Action();
}
