// @flow
import { AsyncAction, Action } from '../lib/Action';
import type { ISignRequest } from '../../api/common/lib/transactions/ISignRequest';

export type SendUsingTrezorParams = {|
  signRequest: ISignRequest<any>,
|};

// ======= Sending ADA using Trezor ACTIONS =======

export default class TrezorSendActions {
  cancel: Action<void> = new Action();
  reset: Action<void> = new Action();
  sendUsingTrezor: AsyncAction<{|
    params: SendUsingTrezorParams,
    publicDeriverId: number,
    onSuccess?: void => void,
    stakingAddressing: request.stakingAddressing,
    publicKey: request.publicKey,
    pathToPublic: request.pathToPublic,
    networkId: request.networkId,
  |}> = new AsyncAction();
}
