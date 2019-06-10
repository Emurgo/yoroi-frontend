// @flow
import Action from '../lib/Action';
import type { BaseSignRequest } from '../../api/ada/adaTypes';

export type SendUsingTrezorParams = {
  signRequest: BaseSignRequest,
};

// ======= Sending ADA using Trezor ACTIONS =======

export default class TrezorSendActions {
  cancel: Action<void> = new Action();
  sendUsingTrezor: Action<SendUsingTrezorParams> = new Action();
}
