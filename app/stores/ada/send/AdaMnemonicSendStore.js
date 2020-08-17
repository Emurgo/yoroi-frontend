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
  asGetAllAccounting,
} from '../../../api/ada/lib/storage/models/PublicDeriver/traits';
import { ROUTES } from '../../../routes-config';
import type { ISignRequest } from '../../../api/common/lib/transactions/ISignRequest';
import { getApiForNetwork, ApiOptions } from '../../../api/common/utils';
import { buildCheckAndCall } from '../../lib/check';
import { genOwnStakingKey } from '../../../api/ada/index';
import { RustModule } from '../../../api/ada/lib/cardanoCrypto/rustLoader';

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
    publicDeriver: PublicDeriver<>,
  |} => Promise<{| txId: string |}> = async (request) => {
    try {
      const withSigning = (asGetSigningKey(request.publicDeriver));
      if (withSigning == null) {
        throw new Error(`${nameof(this.signAndBroadcast)} public deriver missing signing functionality.`);
      }

      const { neededStakingKeyHashes } = request.signRequest;
      if (neededStakingKeyHashes.neededHashes.size - neededStakingKeyHashes.wits.size >= 2) {
        throw new Error(`${nameof(this.signAndBroadcast)} Too many missing witnesses`);
      }
      if (neededStakingKeyHashes.neededHashes.size !== neededStakingKeyHashes.wits.size) {
        const withStakingKey = asGetAllAccounting(withSigning);
        if (withStakingKey == null) {
          throw new Error(`${nameof(this.signAndBroadcast)} missing staking key functionality`);
        }
        const stakingKey = await genOwnStakingKey({
          publicDeriver: withStakingKey,
          password: request.password,
        });
        if (request.signRequest.neededStakingKeyHashes.neededHashes.has(
          Buffer.from(
            RustModule.WalletV4.StakeCredential.from_keyhash(
              stakingKey.to_public().hash()
            ).to_bytes()
          ).toString('hex')
        )) {
          neededStakingKeyHashes.wits.add(
            Buffer.from(RustModule.WalletV4.make_vkey_witness(
              RustModule.WalletV4.hash_transaction(
                request.signRequest.signRequest.unsignedTx.build()
              ),
              stakingKey
            ).to_bytes()).toString('hex')
          );
        } else {
          throw new Error(`${nameof(this.signAndBroadcast)} Missing witness but it was not ours`);
        }
      }

      return await this.api.ada.signAndBroadcast({
        publicDeriver: withSigning,
        password: request.password,
        signRequest: request.signRequest,
        sendTx: this.stores.substores.ada.stateFetchStore.fetcher.sendTx,
      });
    } catch (error) {
      Logger.error(`${nameof(AdaMnemonicSendStore)}::${nameof(this.signAndBroadcast)} error: ` + stringifyError(error));
      throw error;
    }
  }
}
