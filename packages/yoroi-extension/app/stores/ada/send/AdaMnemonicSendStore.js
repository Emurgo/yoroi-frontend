// @flow

import Store from '../../base/Store';
import { HaskellShelleyTxSignRequest } from '../../../api/ada/transactions/shelley/HaskellShelleyTxSignRequest';
import {
  fullErrStr,
  Logger,
} from '../../../utils/logging';
import { ROUTES } from '../../../routes-config';
import type { ISignRequest } from '../../../api/common/lib/transactions/ISignRequest';
import { genOwnStakingKey } from '../../../api/ada/index';
import { RustModule } from '../../../api/ada/lib/cardanoCrypto/rustLoader';
import type { ActionsMap } from '../../../actions/index';
import type { StoresMap } from '../../index';
import { signAndBroadcast } from '../../../api/thunk';

export default class AdaMnemonicSendStore extends Store<StoresMap, ActionsMap> {

  setup(): void {
    super.setup();
    const { wallets, } = this.actions;
    wallets.sendMoney.listen(this._sendMoney);
  }

  /** Send money and then return to transaction screen */
  _sendMoney:  {|
    signRequest: ISignRequest<any>,
    password: string,
    publicDeriverId: number,
    onSuccess?: void => void,
  |} => Promise<void> = async (request) => {
    if (!(request.signRequest instanceof HaskellShelleyTxSignRequest)) {
      throw new Error(`${nameof(this._sendMoney)} wrong tx sign request`);
    }

    await this.stores.substores.ada.wallets.adaSendAndRefresh({
      broadcastRequest: {
        normal: {
          publicDeriverId: request.publicDeriverId,
          password: request.password,
          signRequest: request.signRequest,
        },
      },
      refreshWallet: () => this.stores.wallets.refreshWalletFromRemote(request.publicDeriverId),
    });

    this.actions.dialogs.closeActiveDialog.trigger();
    this.stores.wallets.sendMoneyRequest.reset();
    if (request.onSuccess) {
      request.onSuccess();
    } else {
      this.actions.router.goToRoute.trigger({ route: ROUTES.WALLETS.TRANSACTIONS });
    }
  };

  signAndBroadcast: {|
    signRequest: HaskellShelleyTxSignRequest,
    password: string,
    publicDeriverId: number,
  |} => Promise<{| txId: string |}> = async (request) => {
    try {
      const { txId } = await signAndBroadcast(request);
      return { txId };
    } catch (error) {
      Logger.error(`${nameof(AdaMnemonicSendStore)}::${nameof(this.signAndBroadcast)} error: ${fullErrStr(error)}` );
      throw error;
    }
  }
}
