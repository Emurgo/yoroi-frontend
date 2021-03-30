// @flow

import { action, } from 'mobx';
import Store from '../base/Store';
import { getApiForNetwork, ApiOptions } from '../../api/common/utils';
import type { RestoreModeType } from '../../actions/common/wallet-restore-actions';
import {
  buildCheckAndCall,
} from '../lib/check';
import type { ActionsMap } from '../../actions/index';
import type { StoresMap } from '../index';

export default class ErgoRestoreStore extends Store<StoresMap, ActionsMap> {

  setup(): void {
    super.setup();
    this.reset();
    const actions = this.actions.walletRestore;
    const { asyncCheck, syncCheck, } = buildCheckAndCall(
      ApiOptions.ergo,
      () => {
        if (this.stores.profile.selectedNetwork == null) return undefined;
        return getApiForNetwork(this.stores.profile.selectedNetwork);
      }
    );
    actions.startRestore.listen(asyncCheck(this._restoreToDb));
    actions.reset.listen(syncCheck(this.reset));
  }

  @action.bound
  reset(): void {
  }

  // =================== VALIDITY CHECK ==================== //

  isValidMnemonic: {|
    mnemonic: string,
    mode: RestoreModeType,
  |} => boolean = request => {
    const { mnemonic } = request;
    if (!request.mode.length) {
      throw new Error(`${nameof(ErgoRestoreStore)}::${nameof(this.isValidMnemonic)} missing length`);
    }
    return this.api.ergo.constructor.isValidMnemonic({
      mnemonic,
      numberOfWords: request.mode.length
    });
  }

  _restoreToDb: void => Promise<void> = async () => {
    if (
      this.stores.walletRestore.recoveryResult == null ||
      this.stores.walletRestore.walletRestoreMeta == null
    ) {
      throw new Error(
        `${nameof(this._restoreToDb)} Cannot submit wallet restoration! No values are available in context!`
      );
    }
    const { phrase } = this.stores.walletRestore.recoveryResult;
    const { walletName, walletPassword } = this.stores.walletRestore.walletRestoreMeta;
    const persistentDb = this.stores.loading.getDatabase();
    if (persistentDb == null) {
      throw new Error(`${nameof(this._restoreToDb)} db not loaded. Should never happen`);
    }
    const { selectedNetwork } = this.stores.profile;
    if (selectedNetwork == null) throw new Error(`${nameof(this._restoreToDb)} no network selected`);
    await this.stores.wallets.restoreRequest.execute(async () => {
      const wallet = await this.api.ergo.restoreWallet({
        db: persistentDb,
        recoveryPhrase: phrase,
        walletName,
        walletPassword,
        network: selectedNetwork,
        accountIndex: this.stores.walletRestore.selectedAccount,
      });
      return wallet;
    }).promise;
  };
}
