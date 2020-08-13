// @flow

import Store from '../../base/Store';
import { HaskellShelleyTxSignRequest } from '../../../api/ada/transactions/shelley/HaskellShelleyTxSignRequest';
import {
  Logger,
  stringifyError,
} from '../../../utils/logging';
import { PublicDeriver } from '../../../api/ada/lib/storage/models/PublicDeriver/index';
import {
  asGetSigningKey,
} from '../../../api/ada/lib/storage/models/PublicDeriver/traits';
import { RustModule } from '../../../api/ada/lib/cardanoCrypto/rustLoader';
import { ROUTES } from '../../../routes-config';
import type { ISignRequest } from '../../../api/common/lib/transactions/ISignRequest';
import { getApiForNetwork, ApiOptions } from '../../../api/common/utils';
import { buildCheckAndCall } from '../../lib/check';

export default class AdaMnemonicSendStore extends Store {

  setup(): void {
    super.setup();
    const { wallets, } = this.actions;
    const { asyncCheck } = buildCheckAndCall(
      ApiOptions.ada,
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
  |} => Promise<void> = async (request) => {
    if (!(request.signRequest instanceof HaskellShelleyTxSignRequest)) {
      throw new Error(`${nameof(this._sendMoney)} wrong tx sign request`);
    }

    await this.stores.substores.ada.wallets.adaSendAndRefresh({
      broadcastRequest: {
        normal: {
          publicDeriver: request.publicDeriver,
          password: request.password,
          getStakingWitnesses: () => Promise.resolve(() => []),
          signRequest: request.signRequest,
        },
      },
      refreshWallet: () => this.stores.wallets.refreshWalletFromRemote(request.publicDeriver),
    });

    this.actions.dialogs.closeActiveDialog.trigger();
    this.stores.wallets.sendMoneyRequest.reset();
    this.actions.router.goToRoute.trigger({ route: ROUTES.WALLETS.ROOT });
  };

  signAndBroadcast: {|
    signRequest: HaskellShelleyTxSignRequest,
    password: string,
    getStakingWitnesses: void => Promise<(
      RustModule.WalletV4.TransactionHash => Array<RustModule.WalletV4.Vkeywitness>
    )>,
    publicDeriver: PublicDeriver<>,
  |} => Promise<{| txId: string |}> = async (request) => {
    try {
      const withSigning = (asGetSigningKey(request.publicDeriver));
      if (withSigning == null) {
        throw new Error(`${nameof(this.signAndBroadcast)} public deriver missing signing functionality.`);
      }

      return await this.api.ada.signAndBroadcast({
        publicDeriver: withSigning,
        password: request.password,
        getStakingWitnesses: request.getStakingWitnesses,
        signRequest: request.signRequest,
        sendTx: this.stores.substores.ada.stateFetchStore.fetcher.sendTx,
      });
    } catch (error) {
      Logger.error(`${nameof(AdaMnemonicSendStore)}::${nameof(this.signAndBroadcast)} error: ` + stringifyError(error));
      throw error;
    }
  }
}
