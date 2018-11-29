// @flow

import TrezorConnect from 'trezor-connect';
import { action } from 'mobx';
import WalletStore from '../base/WalletStore';
import { Logger } from '../../utils/logging';

/** Note: Handles Trezor Signing */
export default class TrezorStore extends WalletStore {

  setup() {
    const actions = this.actions.ada.trezor;
    actions.sendWithTrezor.listen(this._sendWithTrezor);
  }

  /** Generates a payload with Trezor format and tries Trezor signing */
  @action _sendWithTrezor = async (params: {
    receiver: string,
    amount: string,
  }): Promise<void> => {
    const { receiver, amount } = params;
    const { trezorPayload, changeAddress } = await this.api.ada.createTrezorPayload({ amount, receiver });

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
