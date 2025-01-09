// @flow

import Store from '../../base/Store';
import { HaskellShelleyTxSignRequest } from '../../../api/ada/transactions/shelley/HaskellShelleyTxSignRequest';
import {
  fullErrStr,
  Logger,
} from '../../../utils/logging';
import { ROUTES } from '../../../routes-config';
import type { ISignRequest } from '../../../api/common/lib/transactions/ISignRequest';
import type { StoresMap } from '../../index';
import { signAndBroadcastTransaction } from '../../../api/thunk';

export default class AdaMnemonicSendStore extends Store<StoresMap> {

  /** Send money and then return to transaction screen */
  sendMoney:  {|
    signRequest: ISignRequest<any>,
    password: string,
    +wallet: {
      publicDeriverId: number,
      +plate: { TextPart: string, ... },
      ...
    },
    onSuccess?: void => void,
  |} => Promise<void> = async (request) => {
    if (!(request.signRequest instanceof HaskellShelleyTxSignRequest)) {
      throw new Error(`${nameof(this.sendMoney)} wrong tx sign request`);
    }

    const { stores } = this;
    await stores.substores.ada.wallets.adaSendAndRefresh({
      broadcastRequest: {
        normal: {
          wallet: request.wallet,
          password: request.password,
          signRequest: request.signRequest,
        },
      },
      refreshWallet: () => stores.wallets.refreshWalletFromRemote(request.wallet.publicDeriverId),
    });

    this.stores.uiDialogs.closeActiveDialog();
    stores.wallets.sendMoneyRequest.reset();
    if (request.onSuccess) {
      request.onSuccess();
    } else {
      stores.app.goToRoute({ route: ROUTES.WALLETS.TRANSACTIONS });
    }
  };

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
