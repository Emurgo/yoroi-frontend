// @flow
import { AsyncAction, Action } from '../lib/Action';
import {
  PublicDeriver,
} from '../../api/ada/lib/storage/models/PublicDeriver/index';

// ======= ADDRESSES ACTIONS =======

export default class AddressesActions {
  createAddress: AsyncAction<PublicDeriver<>> = new AsyncAction();
  resetErrors: Action<void> = new Action();
}
