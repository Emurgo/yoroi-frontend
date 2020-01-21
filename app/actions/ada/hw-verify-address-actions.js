// @flow
import { AsyncAction, Action } from '../lib/Action';

import type {
  BIP32Path
} from '@cardano-foundation/ledgerjs-hw-app-cardano';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver/index';

// ======= ADDRESSES ACTIONS =======

export default class HWVerifyAddressActions {
  closeAddressDetailDialog: Action<void> = new Action();
  selectAddress: AsyncAction<{| address: string, path: BIP32Path |}> = new AsyncAction();
  verifyAddress: AsyncAction<PublicDeriver<>> = new AsyncAction();
}
