// @flow
import Action from '../lib/Action';

export type SendUsingTrezorParams = {
  receiver: string,
  amount: string
};

// ======= Sending ADA using Trezor ACTIONS =======

export default class TrezorSendAdaActions {
  cancel: Action<void> = new Action();
  sendUsingTrezor: Action<SendUsingTrezorParams> = new Action();
}
