// @flow
import { AsyncAction, Action } from '../lib/Action';
import type { AddressFilterKind } from '../../types/AddressFilterTypes';
import type { WalletState } from '../../../chrome/extension/background/types';

// ======= ADDRESSES ACTIONS =======

export default class AddressesActions {
  createAddress: AsyncAction<WalletState> = new AsyncAction();
  resetErrors: Action<void> = new Action();
  setFilter: Action<AddressFilterKind> = new Action();
  resetFilter: Action<void> = new Action();
}
