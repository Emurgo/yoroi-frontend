// @flow

import { action } from 'mobx';
import Store from '../base/Store';

import type { RestoreModeType } from '../../actions/common/wallet-restore-actions';
import { ApiMethodNotYetImplementedError } from '../lib/Request';
import type {
  Address,
  Addressing,
} from '../../api/ada/lib/storage/models/PublicDeriver/interfaces';
import type { ActionsMap } from '../../actions/index';
import type { StoresMap } from '../index';
import AdaApi from '../../api/ada';

export default class AdaWalletRestoreStore extends Store<StoresMap, ActionsMap> {
  setup(): void {
    super.setup();
    this.reset();
    const actions = this.actions.walletRestore;
    actions.transferFromLegacy.listen(this._transferFromLegacy);
    actions.startRestore.listen(this._restoreToDb);
    actions.restoreWallet.listen(this._restoreWallet);
    actions.reset.listen(this.reset);
  }

  _transferFromLegacy: void => Promise<void> = async () => {
    const phrase = this.stores.walletRestore.recoveryResult?.phrase;
    if (phrase == null) {
      throw new Error(
        `${nameof(this._transferFromLegacy)} no recovery phrase set. Should never happen`
      );
    }
    const network = this.stores.profile.selectedNetwork;
    if (network == null) {
      throw new Error(`${nameof(this._transferFromLegacy)} no network selected`);
    }
    await this.actions.yoroiTransfer.transferFunds.trigger({
      next: async () => {
        await this._restoreToDb();
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

  _restoreToDb: void => Promise<void> = async () => {
    if (
      this.stores.walletRestore.recoveryResult == null ||
      this.stores.walletRestore.walletRestoreMeta == null
    ) {
      throw new Error(
        `${nameof(
          this._restoreToDb
        )} Cannot submit wallet restoration! No values are available in context!`
      );
    }
    const { phrase } = this.stores.walletRestore.recoveryResult;
    const { walletName, walletPassword } = this.stores.walletRestore.walletRestoreMeta;
    const persistentDb = this.stores.loading.getDatabase();
    if (persistentDb == null) {
      throw new Error(`${nameof(this._restoreToDb)} db not loaded. Should never happen`);
    }
    const { selectedNetwork } = this.stores.profile;
    if (selectedNetwork == null)
      throw new Error(`${nameof(this._restoreToDb)} no network selected`);

    const accountIndex = this.stores.walletRestore.selectedAccount;
    await this.stores.wallets.restoreRequest.execute(async () => {
      const wallet = await this.api.ada.restoreWallet({
        db: persistentDb,
        recoveryPhrase: phrase,
        walletName,
        walletPassword,
        network: selectedNetwork,
        accountIndex,
      });
      return wallet;
    }).promise;
  };

  _restoreWallet: ({|
    walletName: string,
    walletPassword: string,
    recoveryPhrase: string,
  |}) => Promise<void> = async ({ walletName, walletPassword, recoveryPhrase }) => {
    const persistentDb = this.stores.loading.getDatabase();
    if (persistentDb == null) {
      throw new Error(`${nameof(this._restoreToDb)} db not loaded. Should never happen`);
    }
    const { selectedNetwork } = this.stores.profile;
    if (selectedNetwork == null)
      throw new Error(`${nameof(this._restoreToDb)} no network selected`);

    const accountIndex = this.stores.walletRestore.selectedAccount;
    await this.stores.wallets.restoreRequest.execute(async () => {
      const wallet = await this.api.ada.restoreWallet({
        db: persistentDb,
        recoveryPhrase,
        walletName,
        walletPassword,
        network: selectedNetwork,
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

  // =================== VALIDITY CHECK ==================== //

  isValidMnemonic: ({|
    mnemonic: string,
    mode: RestoreModeType,
  |}) => boolean = request => {
    const { mnemonic } = request;
    if (request.mode.extra === 'paper') {
      // <TODO:PENDING_REMOVAL> paper
      return this.api.ada.isValidPaperMnemonic({ mnemonic, numberOfWords: request.mode.length });
    }
    return AdaApi.isValidMnemonic({
      mnemonic,
      // $FlowIgnore[prop-missing]
      numberOfWords: request.mode.length ?? 0,
    });
  };
}
