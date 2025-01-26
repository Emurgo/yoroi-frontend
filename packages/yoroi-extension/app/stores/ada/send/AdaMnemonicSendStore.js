// @flow

import Store from '../../base/Store';
import { HaskellShelleyTxSignRequest } from '../../../api/ada/transactions/shelley/HaskellShelleyTxSignRequest';
import {
  fullErrStr,
  Logger,
} from '../../../utils/logging';
import type { StoresMap } from '../../index';
import { signAndBroadcastTransaction } from '../../../api/thunk';

export default class AdaMnemonicSendStore extends Store<StoresMap> {
  signAndBroadcast: {|
    signRequest: HaskellShelleyTxSignRequest,
    password: string,
    publicDeriverId: number,
  |} => Promise<{| txId: string |}> = async (request) => {
    try {
      const { txId } = await signAndBroadcastTransaction(request);
      return { txId };
    } catch (error) {
      Logger.error(`${nameof(AdaMnemonicSendStore)}::${nameof(this.signAndBroadcast)} error: ${fullErrStr(error)}` );
      throw error;
    }
  }
}
