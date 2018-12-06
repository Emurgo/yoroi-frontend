// @flow
import { action } from 'mobx';
import TrezorConnect from 'trezor-connect';
import Store from '../base/Store';
import {
  Logger,
  stringifyError,
} from '../../utils/logging';

/** Note: Handles Trezor Signing */
export default class TrezorSendAdaStore extends Store {

  setup() {
    const actions = this.actions.ada.trezorSendAda;
    actions.sendUsingTrezor.listen(this._sendUsingTrezor);
  }

  /** Generates a payload with Trezor format and tries Trezor signing */
  @action _sendUsingTrezor = async (params: {
    receiver: string,
    amount: string,
  }): Promise<void> => {
    const { receiver, amount } = params;
    const { trezorPayload, changeAddress } =
    await this.api.ada.createTrezorPayload({ amount, receiver });

    TrezorConnect
      .cardanoSignTransaction({ ...trezorPayload })
      .then(response => {
        if (response.success) {
          const payload: any = response.payload;
          return this.api.ada.sendHardwareTransaction({
            signedTxHex: payload.body,
            changeAdaAddr: changeAddress
          });
        }
        // FIXME: Error
        throw new Error('Fix this!');
      })
      .catch((error) => {
        Logger.error('Trezor::cardanoSignTransaction error: ' + stringifyError(error));
        // write to some state so UI can be updated
        // user could press something in UI which would clean up state
      });
  }
}
