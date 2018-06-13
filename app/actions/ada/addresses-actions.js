// @flow
import Action from '../lib/Action';

// ======= ADDRESSES ACTIONS =======

export default class AddressesActions {
  createAddress: Action<any> = new Action();
  resetErrors: Action<any> = new Action();
}
