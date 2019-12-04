// @flow

import { observable, action, runInAction, } from 'mobx';
import Store from '../base/Store';

import environment from '../../environment';
import type {
  WalletRestoreMeta,
  RestoreModeType,
} from '../../actions/ada/wallet-restore-actions';
import { RestoreMode } from '../../actions/ada/wallet-restore-actions';
import type { PlateResponse } from '../../api/ada/lib/cardanoCrypto/plate';
import {
  unscramblePaperAdaMnemonic,
} from '../../api/ada/lib/cardanoCrypto/paperWallet';
import {
  generateStandardPlate,
} from '../../api/ada/lib/cardanoCrypto/plate';
import config from '../../config';
import { RustModule } from '../../api/ada/lib/cardanoCrypto/rustLoader';

const NUMBER_OF_VERIFIED_ADDRESSES = 1;
const NUMBER_OF_VERIFIED_ADDRESSES_PAPER = 5;

export const RestoreSteps = Object.freeze({
  START: 0,
  VERIFY_MNEMONIC: 1,
});
export type RestoreStepsType = $Values<typeof RestoreSteps>;

export default class WalletRestoreStore extends Store {

  @observable step: RestoreStepsType;

  // only to handle the back button
  @observable walletRestoreMeta: void | WalletRestoreMeta;

  @observable mode: RestoreModeType;

  @observable recoveryResult: void | {|
    phrase: string,
    byronPlate: void | PlateResponse,
    shelleyPlate: void | PlateResponse,
  |};

  setup(): void {
    super.setup();
    this.reset();
    const actions = this.actions.ada.walletRestore;
    actions.submitFields.listen(this._processRestoreMeta);
    actions.startRestore.listen(this._startRestore);
    actions.setMode.listen((mode) => runInAction(() => { this.mode = mode; }));
    actions.reset.listen(this.reset);
    actions.back.listen(this._back);
  }

  @action
  _processRestoreMeta: (WalletRestoreMeta) => void = (restoreMeta) => {
    this.walletRestoreMeta = restoreMeta;
    this.step = RestoreSteps.VERIFY_MNEMONIC;

    const wordCount = this.mode === RestoreMode.PAPER
      ? config.wallets.YOROI_PAPER_RECOVERY_PHRASE_WORD_COUNT
      : config.wallets.WALLET_RECOVERY_PHRASE_WORD_COUNT;

    let resolvedRecoveryPhrase = restoreMeta.recoveryPhrase;

    if (this.mode === RestoreMode.UNSET) {
      throw new Error(
        `${nameof(this._processRestoreMeta)} ${nameof(this.mode)} unset`
      );
    }
    if (this.mode === RestoreMode.PAPER) {
      const [newPhrase] = unscramblePaperAdaMnemonic(
        restoreMeta.recoveryPhrase,
        wordCount,
        restoreMeta.paperPassword
      );
      if (newPhrase == null) {
        throw new Error(`
          ${nameof(this._processRestoreMeta)} Failed to restore a paper wallet! Invalid recovery phrase!
        `);
      }
      resolvedRecoveryPhrase = newPhrase;
    }
    const byronPlate = generateStandardPlate(
      resolvedRecoveryPhrase,
      0, // show addresses for account #0
      this.mode === RestoreMode.PAPER
        ? NUMBER_OF_VERIFIED_ADDRESSES_PAPER
        : NUMBER_OF_VERIFIED_ADDRESSES,
      environment.isMainnet()
        ? RustModule.WalletV3.AddressDiscrimination.Production
        : RustModule.WalletV3.AddressDiscrimination.Test,
      true,
    );
    // TODO: we disable shelley restoration information for paper wallet restoration
    // this is because we've temporarily disabled paper wallet creation for Shelley
    // so no point in showing the Shelley checksum
    const shelleyPlate = !environment.isShelley() || this.mode === RestoreMode.PAPER
      ? undefined
      : generateStandardPlate(
        resolvedRecoveryPhrase,
        0, // show addresses for account #0
        this.mode === RestoreMode.PAPER
          ? NUMBER_OF_VERIFIED_ADDRESSES_PAPER
          : NUMBER_OF_VERIFIED_ADDRESSES,
        environment.isMainnet()
          ? RustModule.WalletV3.AddressDiscrimination.Production
          : RustModule.WalletV3.AddressDiscrimination.Test,
        false,
      );

    runInAction(() => {
      this.recoveryResult = {
        phrase: resolvedRecoveryPhrase,
        byronPlate,
        shelleyPlate,
      };
    });
  }

  @action
  _startRestore: void => void = () => {
    if (this.recoveryResult == null || this.walletRestoreMeta == null) {
      throw new Error(
        `${nameof(this._startRestore)} Cannot submit wallet restoration! No values are available in context!`
      );
    }
    this.actions[environment.API].wallets.restoreWallet.trigger({
      recoveryPhrase: this.recoveryResult.phrase,
      walletName: this.walletRestoreMeta.walletName,
      walletPassword: this.walletRestoreMeta.walletPassword
    });
  }

  teardown(): void {
    super.teardown();
    this.reset();
  }

  @action
  _back: void => void = () => {
    this.recoveryResult = undefined;
    this.step = RestoreSteps.START;
  }

  @action.bound
  reset(): void {
    this.mode = RestoreMode.UNSET;
    this.step = RestoreSteps.START;
    this.walletRestoreMeta = undefined;
    this.recoveryResult = undefined;
  }
}
