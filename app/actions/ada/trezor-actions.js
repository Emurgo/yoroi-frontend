// @flow
import Action from '../lib/Action';

export default class TrezorActions {
  sendWithTrezor: Action<{receiver: string, amount: string}> = new Action();
}
