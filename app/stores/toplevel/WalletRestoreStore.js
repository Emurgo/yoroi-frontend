// @flow

import { observable, action, runInAction, } from 'mobx';
import Store from '../base/Store';

import environment from '../../environment';
import type {
  WalletRestoreMeta,
  RestoreModeType,
} from '../../actions/common/wallet-restore-actions';
import { RestoreMode } from '../../actions/common/wallet-restore-actions';
import type { PlateResponse } from '../../api/common/lib/crypto/plate';
import {
  unscramblePaperAdaMnemonic,
} from '../../api/ada/lib/cardanoCrypto/paperWallet';
import {
  generateByronPlate,
  generateShelleyPlate,
} from '../../api/ada/lib/cardanoCrypto/plate';
import {
  generateJormungandrPlate,
} from '../../api/jormungandr/lib/crypto/plate';
import {
  HARD_DERIVATION_START,
} from '../../config/numbersConfig';
import {
  v4Bip32PrivateToV3,
} from '../../api/jormungandr/lib/crypto/utils';
import { getWordsCount } from '../stateless/modeInfo';
import { RustModule } from '../../api/ada/lib/cardanoCrypto/rustLoader';
import {
  generateWalletRootKey,
} from '../../api/ada/lib/cardanoCrypto/cryptoWallet';
import { getApiForNetwork } from '../../api/common/utils';
import type { NetworkRow } from '../../api/ada/lib/storage/database/primitives/tables';
import { isJormungandr, isCardanoHaskell } from '../../api/ada/lib/storage/database/prepackaged/networks';

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

  @observable selectedAccount: number = 0 + HARD_DERIVATION_START;

  @observable step: RestoreStepsType;

  // only to handle the back button
  @observable walletRestoreMeta: void | WalletRestoreMeta;

  @observable mode: RestoreModeType;

  @observable recoveryResult: void | {|
    phrase: string,
    shelleyPlate: void | PlateResponse,
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

    const wordCount = getWordsCount(this.mode);

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
    const { byronPlate, shelleyPlate, jormungandrPlate } = generatePlates(
      rootPk,
      this.selectedAccount,
      this.mode,
      selectedNetwork,
    );

    runInAction(() => {
      this.recoveryResult = {
        phrase: resolvedRecoveryPhrase,
        byronPlate,
        jormungandrPlate,
        shelleyPlate,
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
    this.selectedAccount = 0 + HARD_DERIVATION_START;
  }

  isValidMnemonic: {|
    mnemonic: string,
    numberOfWords: number,
    mode: $PropertyType<typeof RestoreMode, 'REGULAR_15'> | $PropertyType<typeof RestoreMode, 'REGULAR_24'> | $PropertyType<typeof RestoreMode, 'PAPER'>,
  |} => boolean = request => {
    const { selectedNetwork } = this.stores.profile;
    if (selectedNetwork == null) throw new Error(`${nameof(this.isValidMnemonic)} no API selected`);
    const api = getApiForNetwork(selectedNetwork);
    return this.stores.substores[api].walletRestore.isValidMnemonic(request);
  }
}

export function generatePlates(
  rootPk: RustModule.WalletV4.Bip32PrivateKey,
  accountIndex: number,
  mode: RestoreModeType,
  network: $ReadOnly<NetworkRow>,
): {|
  byronPlate: void | PlateResponse,
  shelleyPlate: void | PlateResponse,
  jormungandrPlate: void | PlateResponse,
|} {
  const addressCount = mode === RestoreMode.PAPER
    ? NUMBER_OF_VERIFIED_ADDRESSES_PAPER
    : NUMBER_OF_VERIFIED_ADDRESSES;

  const byronPlate = (mode === RestoreMode.REGULAR_15 || mode === RestoreMode.PAPER) && (
    isCardanoHaskell(network) ||
    isJormungandr(network)
  )
    ? generateByronPlate(
      rootPk,
      accountIndex - HARD_DERIVATION_START,
      addressCount,
      (() => {
        if (network.BaseConfig[0].ByronNetworkId != null) {
          return network.BaseConfig[0].ByronNetworkId;
        }
        throw new Error(`${nameof(generatePlates)} missing Byron network id`);
      })()
    )
    : undefined;

  const shelleyPlate = (
    isCardanoHaskell(network) &&
    !isJormungandr(network) &&
    // TODO: needs to be change to "is cip1852" instead.
    mode === RestoreMode.REGULAR_24
  )
    ? generateShelleyPlate(
      rootPk,
      accountIndex - HARD_DERIVATION_START,
      addressCount,
      (() => {
        if (network.BaseConfig[0].ChainNetworkId != null) {
          return Number.parseInt(network.BaseConfig[0].ChainNetworkId, 10);
        }
        throw new Error(`${nameof(generatePlates)} missing chain network id`);
      })()
    )
    : undefined;
  // TODO: we disable shelley restoration information for paper wallet restoration
  // this is because we've temporarily disabled paper wallet creation for Shelley
  // so no point in showing the Shelley checksum
  const jormungandrPlate = isJormungandr(network) && mode === RestoreMode.REGULAR_15
    ? generateJormungandrPlate(
      v4Bip32PrivateToV3(rootPk),
      accountIndex - HARD_DERIVATION_START,
      addressCount,
      environment.getDiscriminant(),
    )
    : undefined;

  return {
    byronPlate,
    shelleyPlate,
    jormungandrPlate,
  };
}
