// @flow
import { AsyncAction, Action } from '../lib/Action';
import type { ISignRequest } from '../../api/common/lib/transactions/ISignRequest';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver/index';

export type SendUsingTrezorParams = {|
  signRequest: ISignRequest<any>,
|};

// ======= Sending ADA using Trezor ACTIONS =======

export default class TrezorSendActions {
  cancel: Action<void> = new Action();
  reset: Action<void> = new Action();
  sendUsingTrezor: AsyncAction<{|
    params: SendUsingTrezorParams,
    publicDeriver: PublicDeriver<>,
  |}> = new AsyncAction();
}
