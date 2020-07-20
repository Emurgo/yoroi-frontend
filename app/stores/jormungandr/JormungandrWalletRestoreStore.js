// @flow

import { action, runInAction, } from 'mobx';
import Store from '../base/Store';

import environment from '../../environment';
import { RestoreMode } from '../../actions/common/wallet-restore-actions';
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
} from '../toplevel/WalletRestoreStore';
import {
  buildCheckAndCall,
} from '../lib/check';
import { ApiOptions, getApiForNetwork } from '../../api/common/utils';

export default class JormungandrWalletRestoreStore extends Store {

  setup(): void {
    super.setup();
    this.reset();
    const { jormungandr } = this.actions;
    const actions = this.actions.walletRestore;
    const { syncCheck, asyncCheck } = buildCheckAndCall(
      ApiOptions.jormungandr,
      () => {
        if (this.stores.profile.selectedNetwork == null) return undefined;
        return getApiForNetwork(this.stores.profile.selectedNetwork);
      }
    );
    jormungandr.walletRestore.transferFromLegacy.listen(this._transferFromLegacy);
    actions.startRestore.listen(asyncCheck(this._restoreToDb));
    actions.reset.listen(syncCheck(this.reset));
  }

  _transferFromLegacy: void => Promise<void> = async () => {
    const phrase = this.stores.walletRestore.recoveryResult?.phrase;
    if (phrase == null) {
      throw new Error(`${nameof(this._transferFromLegacy)} no recovery phrase set. Should never happen`);
    }
    await this.actions.jormungandr.yoroiTransfer.transferFunds.trigger({
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

    this.actions.jormungandr.yoroiTransfer.startTransferFunds.trigger({
      source: TransferSource.BYRON,
    });
    this.actions.jormungandr.yoroiTransfer.setupTransferFundsWithMnemonic.trigger({
      recoveryPhrase: phrase
    });
    runInAction(() => { this.stores.walletRestore.step = RestoreSteps.TRANSFER_TX_GEN; });

    const internalAddrHash = this._getFirstInternalAddr(phrase);
    await this.actions.jormungandr.yoroiTransfer.checkAddresses.trigger({
      getDestinationAddress: () => Promise.resolve(internalAddrHash),
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
    const { selectedNetwork } = this.stores.profile;
    if (selectedNetwork == null) throw new Error(`${nameof(this._restoreToDb)} no network selected`);
    await this.stores.wallets.restoreRequest.execute(async () => {
      const wallet = await this.api.jormungandr.restoreWallet({
        db: persistentDb,
        ...{ recoveryPhrase: phrase, walletName, walletPassword, network: selectedNetwork },
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

  isValidMnemonic: {|
    mnemonic: string,
    numberOfWords: number,
    mode: $PropertyType<typeof RestoreMode, 'REGULAR'> | $PropertyType<typeof RestoreMode, 'PAPER'>,
  |} => boolean = request => {
    const { mnemonic, numberOfWords } = request;
    if (request.mode === RestoreMode.PAPER) {
      // note: validate with ADA since Jormungandr doesn't itself use paper wallets
      return this.api.ada.isValidPaperMnemonic({ mnemonic, numberOfWords });
    }
    if (request.mode === RestoreMode.REGULAR) {
      return this.api.jormungandr.constructor.isValidMnemonic({ mnemonic, numberOfWords });
    }
    throw new Error(`${nameof(this.isValidMnemonic)} unexpected mode ${request.mode}`);
  }
}
