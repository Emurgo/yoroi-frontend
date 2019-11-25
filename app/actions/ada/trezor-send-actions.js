// @flow
import Action from '../lib/Action';
import type { BaseSignRequest } from '../../api/ada/transactions/types';
import { RustModule } from '../../api/ada/lib/cardanoCrypto/rustLoader';

export type SendUsingTrezorParams = {
  signRequest: BaseSignRequest<RustModule.WalletV2.Transaction>,
};

// ======= Sending ADA using Trezor ACTIONS =======

export default class TrezorSendActions {
  cancel: Action<void> = new Action();
  sendUsingTrezor: Action<SendUsingTrezorParams> = new Action();
}
