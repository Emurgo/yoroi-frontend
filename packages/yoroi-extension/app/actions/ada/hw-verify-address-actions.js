// @flow
import { AsyncAction, Action } from '../lib/Action';

import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver/index';
import type { StandardAddress } from '../../types/AddressFilterTypes';

// ======= ADDRESSES ACTIONS =======

export default class HWVerifyAddressActions {
  closeAddressDetailDialog: Action<void> = new Action();
  selectAddress: AsyncAction<$ReadOnly<StandardAddress>> = new AsyncAction();
  verifyAddress: AsyncAction<PublicDeriver<>> = new AsyncAction();
}
