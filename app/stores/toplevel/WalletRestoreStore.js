// @flow

import { observable, action, runInAction, } from 'mobx';
import Store from '../base/Store';

import environment from '../../environment';
import type {
  WalletRestoreMeta,
  RestoreModeType,
} from '../../actions/common/wallet-restore-actions';
import { RestoreMode } from '../../actions/common/wallet-restore-actions';
import type { PlateResponse } from '../../api/ada/lib/cardanoCrypto/plate';
import {
  unscramblePaperAdaMnemonic,
} from '../../api/ada/lib/cardanoCrypto/paperWallet';
import {
  generateStandardPlate,
} from '../../api/ada/lib/cardanoCrypto/plate';
import config from '../../config';
import { RustModule } from '../../api/ada/lib/cardanoCrypto/rustLoader';
import {
  generateWalletRootKey,
} from '../../api/ada/lib/cardanoCrypto/cryptoWallet';
import { getApiForNetwork } from '../../api/common/utils';
import type { NetworkRow } from '../../api/ada/lib/storage/database/primitives/tables';
import { isJormungandr } from '../../api/ada/lib/storage/database/prepackaged/networks';

export const NUMBER_OF_VERIFIED_ADDRESSES = 1;
export const NUMBER_OF_VERIFIED_ADDRESSES_PAPER = 5;

export const RestoreSteps = Object.freeze({
  START: 0,
  VERIFY_MNEMONIC: 1,
  LEGACY_EXPLANATION: 2,
  TRANSFER_TX_GEN: 3,
});
export type RestoreStepsType = $Values<typeof RestoreSteps>;

export default class AdaWalletRestoreStore extends Store {

  @observable step: RestoreStepsType;

  // only to handle the back button
  @observable walletRestoreMeta: void | WalletRestoreMeta;

  @observable mode: RestoreModeType;

  @observable recoveryResult: void | {|
    phrase: string,
    byronPlate: void | PlateResponse,
    jormungandrPlate: void | PlateResponse,
  |};

  setup(): void {
    super.setup();
    this.reset();
    const actions = this.actions.walletRestore;
    actions.submitFields.listen(this._processRestoreMeta);
    actions.verifyMnemonic.listen(this._verifyMnemonic);
    actions.setMode.listen((mode) => runInAction(() => { this.mode = mode; }));
    actions.reset.listen(this.reset);
    actions.back.listen(this._back);
  }

  @action
  _verifyMnemonic: void => Promise<void> = async () => {
    const { selectedNetwork } = this.stores.profile;
    if (selectedNetwork == null) throw new Error(`${nameof(this._processRestoreMeta)} no network selected`);
    if (isJormungandr(selectedNetwork)) {
      runInAction(() => { this.step = RestoreSteps.LEGACY_EXPLANATION; });
    } else {
      await this.actions.walletRestore.startRestore.trigger();
    }
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
    const rootPk = generateWalletRootKey(resolvedRecoveryPhrase);
    const { selectedNetwork } = this.stores.profile;
    if (selectedNetwork == null) throw new Error(`${nameof(this._processRestoreMeta)} no network selected`);
    const { byronPlate, jormungandrPlate } = generatePlates(
      rootPk,
      this.mode,
      selectedNetwork
    );

    runInAction(() => {
      this.recoveryResult = {
        phrase: resolvedRecoveryPhrase,
        byronPlate,
        jormungandrPlate,
      };
    });
  }

  teardown(): void {
    super.teardown();
    this.reset();
  }

  @action
  _back: void => void = () => {
    if (this.step === RestoreSteps.VERIFY_MNEMONIC) {
      this.recoveryResult = undefined;
      this.step = RestoreSteps.START;
      return;
    }
    if (this.step === RestoreSteps.LEGACY_EXPLANATION) {
      this.step = RestoreSteps.VERIFY_MNEMONIC;
    }
  }

  @action.bound
  reset(): void {
    this.mode = RestoreMode.UNSET;
    this.step = RestoreSteps.START;
    this.walletRestoreMeta = undefined;
    this.recoveryResult = undefined;
  }

  isValidMnemonic: {|
    mnemonic: string,
    numberOfWords: number,
    mode: $PropertyType<typeof RestoreMode, 'REGULAR'> | $PropertyType<typeof RestoreMode, 'PAPER'>,
  |} => boolean = request => {
    const { selectedNetwork } = this.stores.profile;
    if (selectedNetwork == null) throw new Error(`${nameof(this.isValidMnemonic)} no API selected`);
    const api = getApiForNetwork(selectedNetwork);
    return this.stores.substores[api].walletRestore.isValidMnemonic(request);
  }
}

export function generatePlates(
  rootPk: RustModule.WalletV3.Bip32PrivateKey,
  mode: RestoreModeType,
  network: $ReadOnly<NetworkRow>,
): {|
  byronPlate: PlateResponse,
  jormungandrPlate: void | PlateResponse,
|} {
  const byronPlate = generateStandardPlate(
    rootPk,
    0, // show addresses for account #0
    mode === RestoreMode.PAPER
      ? NUMBER_OF_VERIFIED_ADDRESSES_PAPER
      : NUMBER_OF_VERIFIED_ADDRESSES,
    environment.getDiscriminant(),
    true,
  );
  // TODO: we disable shelley restoration information for paper wallet restoration
  // this is because we've temporarily disabled paper wallet creation for Shelley
  // so no point in showing the Shelley checksum
  const jormungandrPlate = !isJormungandr(network) || mode === RestoreMode.PAPER
    ? undefined
    : generateStandardPlate(
      rootPk,
      0, // show addresses for account #0
      mode === RestoreMode.PAPER
        ? NUMBER_OF_VERIFIED_ADDRESSES_PAPER
        : NUMBER_OF_VERIFIED_ADDRESSES,
      environment.getDiscriminant(),
      false,
    );

  return {
    byronPlate,
    jormungandrPlate,
  };
}
