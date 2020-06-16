// @flow

import { action, } from 'mobx';
import Store from '../base/Store';
import { ApiOptions } from '../../api/common/utils';
import { RestoreMode } from '../../actions/common/wallet-restore-actions';
import {
  buildCheckAndCall,
} from '../lib/check';

export default class ErgoRestoreStore extends Store {

  setup(): void {
    super.setup();
    this.reset();
    const actions = this.actions.walletRestore;
    const { asyncCheck, syncCheck, } = buildCheckAndCall(
      ApiOptions.ergo,
      () => this.stores.profile.selectedAPI,
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
    numberOfWords: number,
    mode: $PropertyType<typeof RestoreMode, 'REGULAR'> | $PropertyType<typeof RestoreMode, 'PAPER'>,
  |} => boolean = request => {
    const { mnemonic, numberOfWords } = request;
    if (request.mode === RestoreMode.REGULAR) {
      return this.api.ergo.constructor.isValidMnemonic({ mnemonic, numberOfWords });
    }
    throw new Error(`${nameof(this.isValidMnemonic)} unexpected mode ${request.mode}`);
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
    const persistentDb = this.stores.loading.loadPersitentDbRequest.result;
    if (persistentDb == null) {
      throw new Error(`${nameof(this._restoreToDb)} db not loaded. Should never happen`);
    }
    await this.stores.wallets.restoreRequest.execute(async () => {
      const wallet = await this.api.ergo.restoreWallet({
        db: persistentDb,
        ...{ recoveryPhrase: phrase, walletName, walletPassword },
      });
      return wallet;
    }).promise;
  };
}
