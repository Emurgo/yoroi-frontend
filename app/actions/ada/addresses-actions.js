// @flow
import Action from '../lib/Action';

// ======= ADDRESSES ACTIONS =======

export default class AddressesActions {
  createAddress: Action<void> = new Action();
  resetErrors: Action<void> = new Action();
}
