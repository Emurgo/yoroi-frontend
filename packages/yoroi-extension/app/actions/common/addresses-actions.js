// @flow
import { AsyncAction, Action } from '../lib/Action';
import {
  PublicDeriver,
} from '../../api/ada/lib/storage/models/PublicDeriver/index';
import type { AddressFilterKind } from '../../types/AddressFilterTypes';

// ======= ADDRESSES ACTIONS =======

export default class AddressesActions {
  createAddress: AsyncAction<PublicDeriver<>> = new AsyncAction();
  resetErrors: Action<void> = new Action();
  setFilter: Action<AddressFilterKind> = new Action();
  resetFilter: Action<void> = new Action();
}
