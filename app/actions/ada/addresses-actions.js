// @flow
import { AsyncAction, Action } from '../lib/Action';
import PublicDeriverWithCachedMeta from '../../domain/PublicDeriverWithCachedMeta';

// ======= ADDRESSES ACTIONS =======

export default class AddressesActions {
  createAddress: AsyncAction<PublicDeriverWithCachedMeta> = new AsyncAction();
  resetErrors: Action<void> = new Action();
}
