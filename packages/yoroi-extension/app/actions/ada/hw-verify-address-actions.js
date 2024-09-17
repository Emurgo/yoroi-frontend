// @flow
import { AsyncAction, Action } from '../lib/Action';

import type { WalletState } from '../../../chrome/extension/background/types';
import type { StandardAddress } from '../../types/AddressFilterTypes';

// ======= ADDRESSES ACTIONS =======

export default class HWVerifyAddressActions {
  closeAddressDetailDialog: Action<void> = new Action();
  selectAddress: AsyncAction<$ReadOnly<StandardAddress>> = new AsyncAction();
  verifyAddress: AsyncAction<WalletState> = new AsyncAction();
}
