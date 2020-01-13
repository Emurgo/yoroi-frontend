// @flow
import { AsyncAction, Action } from '../lib/Action';

// ======= ADDRESSES ACTIONS =======

export default class AddressesActions {
  createAddress: AsyncAction<void> = new AsyncAction();
  resetErrors: Action<void> = new Action();
}
