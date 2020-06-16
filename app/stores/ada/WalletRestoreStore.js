// @flow

import { action, runInAction, } from 'mobx';
import Store from '../base/Store';

import environment from '../../environment';
import type {
  WalletRestoreMeta,
} from '../../actions/common/wallet-restore-actions';
import { RestoreMode } from '../../actions/common/wallet-restore-actions';
import {
  unscramblePaperAdaMnemonic,
} from '../../api/ada/lib/cardanoCrypto/paperWallet';
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
import {
  RestoreSteps,
  generatePlates,
} from '../toplevel/WalletRestoreStore';
import {
  buildCheckAndCall,
} from '../lib/check';
import { ApiOptions } from '../../api/common/utils';

export default class WalletRestoreStore extends Store {

  setup(): void {
    super.setup();
    this.reset();
    const adaActions = this.actions.ada.walletRestore;
    const actions = this.actions.walletRestore;
    const { syncCheck, asyncCheck } = buildCheckAndCall(
      ApiOptions.ada,
      () => this.stores.profile.selectedAPI,
    );
    adaActions.transferFromLegacy.listen(asyncCheck(this._transferFromLegacy));
    actions.startRestore.listen(asyncCheck(this._restoreToDb));
    actions.reset.listen(syncCheck(this.reset));
  }

  _transferFromLegacy: void => Promise<void> = async () => {
    const phrase = this.stores.walletRestore.recoveryResult?.phrase;
    if (phrase == null) {
      throw new Error(`${nameof(this._transferFromLegacy)} no recovery phrase set. Should never happen`);
    }
    await this.actions.ada.yoroiTransfer.transferFunds.trigger({
      next: async () => { await this._restoreToDb(); },
      getDestinationAddress: () => Promise.resolve(this._getFirstInternalAddr(phrase)),
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
      environment.getDiscriminant(),
    );
    const internalAddrHash = Buffer.from(internalAddr.as_bytes()).toString('hex');
    return internalAddrHash;
  }

  @action
  _startCheck: void => Promise<void> = async () => {
    const phrase = this.stores.walletRestore.recoveryResult?.phrase;
    if (phrase == null) {
      throw new Error(`${nameof(this._startCheck)} no recovery phrase set. Should never happen`);
    }

    this.actions.ada.yoroiTransfer.startTransferFunds.trigger({
      source: TransferSource.BYRON,
    });
    this.actions.ada.yoroiTransfer.setupTransferFundsWithMnemonic.trigger({
      recoveryPhrase: phrase
    });
    runInAction(() => { this.stores.walletRestore.step = RestoreSteps.TRANSFER_TX_GEN; });

    const internalAddrHash = this._getFirstInternalAddr(phrase);
    await this.actions.ada.yoroiTransfer.checkAddresses.trigger({
      getDestinationAddress: () => Promise.resolve(internalAddrHash),
    });
  }

  @action
  _processRestoreMeta: (WalletRestoreMeta) => void = (restoreMeta) => {
    this.stores.walletRestore.walletRestoreMeta = restoreMeta;
    this.stores.walletRestore.step = RestoreSteps.VERIFY_MNEMONIC;

    const wordCount = this.stores.walletRestore.mode === RestoreMode.PAPER
      ? config.wallets.YOROI_PAPER_RECOVERY_PHRASE_WORD_COUNT
      : config.wallets.WALLET_RECOVERY_PHRASE_WORD_COUNT;

    let resolvedRecoveryPhrase = restoreMeta.recoveryPhrase;

    if (this.stores.walletRestore.mode === RestoreMode.UNSET) {
      throw new Error(
        `${nameof(this._processRestoreMeta)} ${nameof(this.stores.walletRestore.mode)} unset`
      );
    }
    if (this.stores.walletRestore.mode === RestoreMode.PAPER) {
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
    const { byronPlate, shelleyPlate } = generatePlates(rootPk, this.stores.walletRestore.mode);

    runInAction(() => {
      this.stores.walletRestore.recoveryResult = {
        phrase: resolvedRecoveryPhrase,
        byronPlate,
        shelleyPlate,
      };
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
    const persistentDb = this.stores.loading.loadPersitentDbRequest.result;
    if (persistentDb == null) {
      throw new Error(`${nameof(this._restoreToDb)} db not loaded. Should never happen`);
    }
    await this.stores.wallets.restoreRequest.execute(async () => {
      const wallet = await this.api.ada.restoreWallet({
        db: persistentDb,
        ...{ recoveryPhrase: phrase, walletName, walletPassword },
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
    this.stores.walletRestore.stores.substores.ada.yoroiTransfer.reset();
  }

  // =================== VALIDITY CHECK ==================== //

  isValidMnemonic: {|
    mnemonic: string,
    numberOfWords: number,
    mode: $PropertyType<typeof RestoreMode, 'REGULAR'> | $PropertyType<typeof RestoreMode, 'PAPER'>,
  |} => boolean = request => {
    const { mnemonic, numberOfWords } = request;
    if (request.mode === RestoreMode.PAPER) {
      return this.api.ada.isValidPaperMnemonic({ mnemonic, numberOfWords });
    }
    if (request.mode === RestoreMode.REGULAR) {
      return this.api.ada.constructor.isValidMnemonic({ mnemonic, numberOfWords });
    }
    throw new Error(`${nameof(this.isValidMnemonic)} unexpected mode ${request.mode}`);
  }
}
