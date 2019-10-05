// @flow
import Action from '../lib/Action';

import type {
  BIP32Path
} from '@cardano-foundation/ledgerjs-hw-app-cardano';

// ======= ADDRESSES ACTIONS =======

export default class HWVerifyAddressActions {
  closeAddressDetailDialog: Action<void> = new Action();
  selectAddress: Action<{ address: string, path: BIP32Path }> = new Action();
  verifyAddress: Action<{ wallet: Wallet }> = new Action();
}
