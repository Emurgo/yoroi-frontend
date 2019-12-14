// @flow

import Action from '../lib/Action';

export default class DelegationActions {
  startWatch: Action<void> = new Action();
  reset: Action<void> = new Action();
}
