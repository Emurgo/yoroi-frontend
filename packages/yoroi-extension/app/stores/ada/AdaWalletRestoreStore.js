// @flow

import { action } from 'mobx';
import Store from '../base/Store';

import { ApiMethodNotYetImplementedError } from '../lib/Request';
import type {
  Address,
  Addressing,
} from '../../api/ada/lib/storage/models/PublicDeriver/interfaces';
import type { ActionsMap } from '../../actions/index';
import type { StoresMap } from '../index';
import { createWallet } from '../../api/thunk';

export default class AdaWalletRestoreStore extends Store<StoresMap, ActionsMap> {
  setup(): void {
    super.setup();
    this.reset();
  }

  transferFromLegacy: void => Promise<void> = async () => {
    const phrase = this.stores.walletRestore.recoveryResult?.phrase;
    if (phrase == null) {
      throw new Error(
        `${nameof(this.transferFromLegacy)} no recovery phrase set. Should never happen`
      );
    }
    const network = this.stores.profile.selectedNetwork;
    if (network == null) {
      throw new Error(`${nameof(this.transferFromLegacy)} no network selected`);
    }
    await this.stores.yoroiTransfer.transferFunds({
      next: async () => {
        await this.startWalletRestore();
      },
      network,
      getDestinationAddress: () => Promise.resolve(this._getFirstCip1852InternalAddr()),
      // funds in genesis block should be either entirely claimed or not claimed
      // so if another wallet instance claims the funds, it's not a big deal
      rebuildTx: false,
    });
  };

  _getFirstCip1852InternalAddr: void => {| ...Address, ...InexactSubset<Addressing> |} = () => {
    throw new ApiMethodNotYetImplementedError();
  };

  startWalletRestore: void => Promise<void> = async () => {
    if (
      this.stores.walletRestore.recoveryResult == null ||
      this.stores.walletRestore.walletRestoreMeta == null
    ) {
      throw new Error(
        `${nameof(
          this.startWalletRestore
        )} Cannot submit wallet restoration! No values are available in context!`
      );
    }
    const { phrase } = this.stores.walletRestore.recoveryResult;
    const { walletName, walletPassword } = this.stores.walletRestore.walletRestoreMeta;

    await this.restoreWallet({ walletName, walletPassword, recoveryPhrase: phrase });
  };

  restoreWallet: ({|
    walletName: string,
    walletPassword: string,
    recoveryPhrase: string,
  |}) => Promise<void> = async ({ walletName, walletPassword, recoveryPhrase }) => {
    const { selectedNetwork } = this.stores.profile;
    if (selectedNetwork == null)
      throw new Error(`${nameof(this.startWalletRestore)} no network selected`);

    const accountIndex = this.stores.walletRestore.selectedAccount;

    await this.stores.wallets.restoreRequest.execute(async () => {
      const wallet = await createWallet({
        recoveryPhrase,
        walletName,
        walletPassword,
        networkId: selectedNetwork.NetworkId,
        accountIndex,
      });
      return wallet;
    }).promise;
  };

  teardown(): void {
    super.teardown();
    this.reset();
  }

  @action.bound
  reset(): void {
    this.stores.walletRestore.stores.yoroiTransfer.reset();
  }
}
