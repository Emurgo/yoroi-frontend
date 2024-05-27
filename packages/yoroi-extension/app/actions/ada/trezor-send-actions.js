// @flow
import { AsyncAction, Action } from '../lib/Action';
import type { ISignRequest } from '../../api/common/lib/transactions/ISignRequest';
import type { Addressing } from '../../api/ada/lib/storage/models/PublicDeriver/interfaces';

export type SendUsingTrezorParams = {|
  signRequest: ISignRequest<any>,
|};

// ======= Sending ADA using Trezor ACTIONS =======

export default class TrezorSendActions {
  cancel: Action<void> = new Action();
  reset: Action<void> = new Action();
  sendUsingTrezor: AsyncAction<{|
    params: SendUsingTrezorParams,
    onSuccess?: void => void,
    wallet: {
      publicDeriverId: number,
      stakingAddressing: Addressing,
      publicKey: string,
      pathToPublic: Array<number>,
      networkId: number,
      hardwareWalletDeviceId: ?string,
      ...
    },
  |}> = new AsyncAction();
}
