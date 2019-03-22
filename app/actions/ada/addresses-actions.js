// @flow
import Action from '../lib/Action';

import type {
  BIP32Path
} from '@cardano-foundation/ledgerjs-hw-app-cardano';
import Wallet from '../../domain/Wallet';

// ======= ADDRESSES ACTIONS =======

export default class AddressesActions {
  createAddress: Action<void> = new Action();
  closeAddressDetailDialog: Action<void> = new Action();
  selectAddress: Action<{ address: string, path: BIP32Path }> = new Action();
  verifyAddress: Action<{ wallet: Wallet }> = new Action();
  resetErrors: Action<any> = new Action();
}
