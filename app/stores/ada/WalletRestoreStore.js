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
import { TransferSource } from '../../types/TransferTypes';
import {
  HARD_DERIVATION_START,
  WalletTypePurpose,
  CoinTypes,
  ChainDerivations,
  STAKING_KEY_INDEX,
} from '../../config/numbersConfig';
import {
  generateWalletRootKey,
} from '../../api/ada/lib/cardanoCrypto/cryptoWallet';

const NUMBER_OF_VERIFIED_ADDRESSES = 1;
const NUMBER_OF_VERIFIED_ADDRESSES_PAPER = 5;

export const RestoreSteps = Object.freeze({
  START: 0,
  VERIFY_MNEMONIC: 1,
  LEGACY_EXPLANATION: 2,
  TRANSFER_TX_GEN: 3,
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
    actions.verifyMnemonic.listen(this._verifyMnemonic);
    actions.startCheck.listen(this._startCheck);
    actions.transferFromLegacy.listen(this._transferFromLegacy);
    actions.setMode.listen((mode) => runInAction(() => { this.mode = mode; }));
    actions.reset.listen(this.reset);
    actions.back.listen(this._back);
  }

  _transferFromLegacy: void => void = () => {
    const phrase = this.recoveryResult?.phrase;
    if (phrase == null) {
      throw new Error(`${nameof(this._transferFromLegacy)} no recovery phrase set. Should never happen`);
    }
    this.actions.ada.yoroiTransfer.transferFunds.trigger({
      next: async () => { this._startRestore(); },
      getDestinationAddress: () => Promise.resolve(this._getFirstInternalAddr(phrase)),
      transferSource: TransferSource.BYRON,
      // funds in genesis block should be either entirely claimed or not claimed
      // so if another wallet instance claims the funds, it's not a big deal
      rebuildTx: false,
    });
  }

  _getFirstInternalAddr: string => string = (recoveryPhrase) => {
    const accountKey = generateWalletRootKey(recoveryPhrase)
      .derive(WalletTypePurpose.CIP1852)
      .derive(CoinTypes.CARDANO)
      .derive(0 + HARD_DERIVATION_START);

    const internalKey = accountKey
      .derive(ChainDerivations.INTERNAL)
      .derive(0)
      .to_public()
      .to_raw_key();

    const stakingKey = accountKey
      .derive(ChainDerivations.CHIMERIC_ACCOUNT)
      .derive(STAKING_KEY_INDEX)
      .to_public()
      .to_raw_key();
    const internalAddr = RustModule.WalletV3.Address.delegation_from_public_key(
      internalKey,
      stakingKey,
      environment.isMainnet()
        ? RustModule.WalletV3.AddressDiscrimination.Production
        : RustModule.WalletV3.AddressDiscrimination.Test,
    );
    const internalAddrHash = Buffer.from(internalAddr.as_bytes()).toString('hex');
    return internalAddrHash;
  }

  @action
  _startCheck: void => void = () => {
    const phrase = this.recoveryResult?.phrase;
    if (phrase == null) {
      throw new Error(`${nameof(this._startCheck)} no recovery phrase set. Should never happen`);
    }
    this.actions.ada.yoroiTransfer.setupTransferFundsWithMnemonic.trigger({
      recoveryPhrase: phrase
    });
    runInAction(() => { this.step = RestoreSteps.TRANSFER_TX_GEN; });

    const internalAddrHash = this._getFirstInternalAddr(phrase);
    this.actions.ada.yoroiTransfer.checkAddresses.trigger({
      getDestinationAddress: () => Promise.resolve(internalAddrHash),
      transferSource: TransferSource.BYRON,
    });
  }

  @action
  _verifyMnemonic: void => void = () => {
    if (environment.isShelley()) {
      runInAction(() => { this.step = RestoreSteps.LEGACY_EXPLANATION; });
    } else {
      this._startRestore();
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
    this.stores.substores.ada.yoroiTransfer.reset();
  }
}
