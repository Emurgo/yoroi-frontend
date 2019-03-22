// @flow
import Action from '../lib/Action';

import type {
  BIP32Path
} from '@cardano-foundation/ledgerjs-hw-app-cardano';

// ======= ADDRESSES ACTIONS =======

export default class AddressesActions {
  createAddress: Action<void> = new Action();
  closeVerifyAddressDialog: Action<void> = new Action();
  verifyAddress: Action<{ address: string, derivedPath: string }> = new Action();
  resetErrors: Action<any> = new Action();
}
