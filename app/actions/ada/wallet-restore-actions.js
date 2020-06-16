// @flow

import { AsyncAction, } from '../lib/Action';

export default class WalletRestoreActions {
  transferFromLegacy: AsyncAction<void> = new AsyncAction();
}
