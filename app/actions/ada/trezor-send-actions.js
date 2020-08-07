// @flow
import { AsyncAction, Action } from '../lib/Action';
import { HaskellShelleyTxSignRequest } from '../../api/ada/transactions/shelley/HaskellShelleyTxSignRequest';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver/index';

export type SendUsingTrezorParams = {|
  signRequest: HaskellShelleyTxSignRequest,
|};

// ======= Sending ADA using Trezor ACTIONS =======

export default class TrezorSendActions {
  cancel: Action<void> = new Action();
  sendUsingTrezor: AsyncAction<{|
    params: SendUsingTrezorParams,
    publicDeriver: PublicDeriver<>,
  |}> = new AsyncAction();
}
