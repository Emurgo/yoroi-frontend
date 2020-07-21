// @flow

import { action, runInAction, } from 'mobx';
import Store from '../base/Store';

import { RestoreMode } from '../../actions/common/wallet-restore-actions';
import { RustModule } from '../../api/ada/lib/cardanoCrypto/rustLoader';
import { TransferSource } from '../../types/TransferTypes';
import {
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
import { getCardanoHaskellStaticConfig } from '../../api/ada/lib/storage/database/prepackaged/networks';

export default class AdaWalletRestoreStore extends Store {

  setup(): void {
    super.setup();
    this.reset();
    const actions = this.actions.walletRestore;
    const { syncCheck, asyncCheck } = buildCheckAndCall(
      ApiOptions.ada,
      () => {
        if (this.stores.profile.selectedNetwork == null) return undefined;
        return getApiForNetwork(this.stores.profile.selectedNetwork);
      }
    );
    actions.transferFromLegacy.listen(asyncCheck(this._transferFromLegacy));
    actions.startRestore.listen(asyncCheck(this._restoreToDb));
    actions.reset.listen(syncCheck(this.reset));
  }

  _transferFromLegacy: void => Promise<void> = async () => {
    const phrase = this.stores.walletRestore.recoveryResult?.phrase;
    if (phrase == null) {
      throw new Error(`${nameof(this._transferFromLegacy)} no recovery phrase set. Should never happen`);
    }
    await this.actions.yoroiTransfer.transferFunds.trigger({
      next: async () => { await this._restoreToDb(); },
      getDestinationAddress: () => Promise.resolve(this._getFirstCip1852InternalAddr()),
      // funds in genesis block should be either entirely claimed or not claimed
      // so if another wallet instance claims the funds, it's not a big deal
      rebuildTx: false,
    });
  }

  _getFirstCip1852InternalAddr: void => string = () => {
    const phrase = this.stores.walletRestore.recoveryResult?.phrase;
    if (phrase == null) {
      throw new Error(`${nameof(this._getFirstCip1852InternalAddr)} no recovery phrase set. Should never happen`);
    }

    const { selectedNetwork } = this.stores.profile;
    if (selectedNetwork == null) throw new Error('Should never happen');
    const staticConfigs = getCardanoHaskellStaticConfig(selectedNetwork);
    if (staticConfigs == null) throw new Error('Should never happen');

    const accountKey = generateWalletRootKey(phrase)
      .derive(WalletTypePurpose.CIP1852)
      .derive(CoinTypes.CARDANO)
      .derive(this.stores.walletRestore.selectedAccount);

    const internalKey = accountKey
      .derive(ChainDerivations.INTERNAL)
      .derive(0) // first address
      .to_public()
      .to_raw_key();

    const stakingKey = accountKey
      .derive(ChainDerivations.CHIMERIC_ACCOUNT)
      .derive(STAKING_KEY_INDEX)
      .to_public()
      .to_raw_key();

    const internalAddr = RustModule.WalletV4.BaseAddress.new(
      Number.parseInt(staticConfigs.NetworkId, 10),
      RustModule.WalletV4.StakeCredential.from_keyhash(
        internalKey.hash()
      ),
      RustModule.WalletV4.StakeCredential.from_keyhash(
        stakingKey.hash()
      ),
    );

    const internalAddrHash = Buffer.from(internalAddr.to_address().to_bytes()).toString('hex');
    return internalAddrHash;
  }

  @action
  _startCheck: void => Promise<void> = async () => {
    const phrase = this.stores.walletRestore.recoveryResult?.phrase;
    if (phrase == null) {
      throw new Error(`${nameof(this._startCheck)} no recovery phrase set. Should never happen`);
    }

    this.actions.yoroiTransfer.startTransferFunds.trigger({
      source: TransferSource.BYRON,
    });
    this.actions.yoroiTransfer.setupTransferFundsWithMnemonic.trigger({
      recoveryPhrase: phrase
    });
    runInAction(() => { this.stores.walletRestore.step = RestoreSteps.TRANSFER_TX_GEN; });

    const internalAddrHash = this._getFirstCip1852InternalAddr();
    await this.actions.yoroiTransfer.checkAddresses.trigger({
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
      const wallet = await this.api.ada.restoreWallet({
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
      return this.api.ada.isValidPaperMnemonic({ mnemonic, numberOfWords });
    }
    if (request.mode === RestoreMode.REGULAR) {
      return this.api.ada.constructor.isValidMnemonic({ mnemonic, numberOfWords });
    }
    throw new Error(`${nameof(this.isValidMnemonic)} unexpected mode ${request.mode}`);
  }
}
