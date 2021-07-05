// @flow

import Store from '../../base/Store';
import { ErgoTxSignRequest } from '../../../api/ergo/lib/transactions/ErgoTxSignRequest';
import {
  Logger,
  stringifyError,
} from '../../../utils/logging';
import { PublicDeriver } from '../../../api/ada/lib/storage/models/PublicDeriver/index';
import {
  asGetSigningKey,
} from '../../../api/ada/lib/storage/models/PublicDeriver/traits';
import { ROUTES } from '../../../routes-config';
import type { ISignRequest } from '../../../api/common/lib/transactions/ISignRequest';
import { getApiForNetwork, ApiOptions } from '../../../api/common/utils';
import { buildCheckAndCall } from '../../lib/check';
import type { ActionsMap } from '../../../actions/index';
import type { StoresMap } from '../../index';

export default class ErgoMnemonicSendStore extends Store<StoresMap, ActionsMap> {

  setup(): void {
    super.setup();
    const { wallets, } = this.actions;
    const { asyncCheck } = buildCheckAndCall(
      ApiOptions.ergo,
      () => {
        if (this.stores.profile.selectedNetwork == null) return undefined;
        return getApiForNetwork(this.stores.profile.selectedNetwork);
      }
    );
    wallets.sendMoney.listen(asyncCheck(this._sendMoney));
  }

  /** Send money and then return to transaction screen */
  _sendMoney:  {|
    signRequest: ISignRequest<any>,
    password: string,
    publicDeriver: PublicDeriver<>,
    onSuccess?: void => void,
  |} => Promise<void> = async (request) => {
    if (!(request.signRequest instanceof ErgoTxSignRequest)) {
      throw new Error(`${nameof(this._sendMoney)} wrong tx sign request`);
    }

    await this.stores.substores.ergo.wallets.ergoSendAndRefresh({
      broadcastRequest: {
        normal: {
          publicDeriver: request.publicDeriver,
          password: request.password,
          signRequest: request.signRequest,
        },
      },
      refreshWallet: () => this.stores.wallets.refreshWalletFromRemote(request.publicDeriver),
    });

    this.actions.dialogs.closeActiveDialog.trigger();
    this.stores.wallets.sendMoneyRequest.reset();
    this.actions.router.goToRoute.trigger({ route: ROUTES.WALLETS.TRANSACTIONS });
  };

  signAndBroadcast: {|
    signRequest: ErgoTxSignRequest,
    password: string,
    publicDeriver: PublicDeriver<>,
  |} => Promise<{| txId: string |}> = async (request) => {
    try {
      const withSigning = (asGetSigningKey(request.publicDeriver));
      if (withSigning == null) {
        throw new Error(`${nameof(this.signAndBroadcast)} public deriver missing signing functionality.`);
      }

      return await this.api.ergo.signAndBroadcast({
        publicDeriver: withSigning,
        password: request.password,
        signRequest: request.signRequest,
        sendTx: this.stores.substores.ergo.stateFetchStore.fetcher.sendTx,
      });
    } catch (error) {
      Logger.error(`${nameof(ErgoMnemonicSendStore)}::${nameof(this.signAndBroadcast)} error: ` + stringifyError(error));
      throw error;
    }
  }
}
