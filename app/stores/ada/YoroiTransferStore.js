// @flow
import { observable, action, runInAction } from 'mobx';
import { defineMessages } from 'react-intl';
import { isEqual } from 'lodash';
import {
  Logger,
  stringifyError
} from '../../utils/logging';
import Store from '../base/Store';
import Request from '../lib/LocalizedRequest';
import LocalizableError, {
  localizedError
} from '../../i18n/LocalizableError';
import type {
  TransferStatusT,
  TransferTx,
  TransferSourceType,
  TransferKindType,
} from '../../types/TransferTypes';
import { TransferStatus, TransferSource, TransferKind, } from '../../types/TransferTypes';
import { generateLegacyYoroiTransferTx } from '../../api/ada/transactions/transfer/legacyYoroi';
import { generateCip1852TransferTx } from '../../api/ada/transactions/transfer/cip1852Transfer';
import environment from '../../environment';
import { RustModule } from '../../api/ada/lib/cardanoCrypto/rustLoader';
import { generateWalletRootKey, generateLedgerWalletRootKey, } from '../../api/ada/lib/cardanoCrypto/cryptoWallet';
import {
  HARD_DERIVATION_START,
  WalletTypePurpose,
  CoinTypes,
} from '../../config/numbersConfig';
import type { RestoreWalletForTransferResponse, RestoreWalletForTransferFunc } from '../../api/ada/index';
import {
  Bip44DerivationLevels,
} from '../../api/ada/lib/storage/database/walletTypes/bip44/api/utils';
import {
  asHasUtxoChains,
} from '../../api/ada/lib/storage/models/PublicDeriver/traits';
import PublicDeriverWithCachedMeta from '../../domain/PublicDeriverWithCachedMeta';
import {
  unscramblePaperAdaMnemonic,
} from '../../api/ada/lib/cardanoCrypto/paperWallet';
import config from '../../config';

export default class YoroiTransferStore extends Store {

  @observable status: TransferStatusT = TransferStatus.UNINITIALIZED;
  @observable disableTransferFunds: boolean = true;
  @observable transferFundsRequest: Request<typeof YoroiTransferStore.prototype._checkAndTransfer>
    = new Request<typeof YoroiTransferStore.prototype._checkAndTransfer>(this._checkAndTransfer);
  @observable restoreForTransferRequest: Request<RestoreWalletForTransferFunc>
    = new Request(this.api.ada.restoreWalletForTransfer);
  @observable error: ?LocalizableError = null;
  @observable transferTx: ?TransferTx = null;
  @observable recoveryPhrase: string = '';
  @observable transferKind: TransferKindType = TransferKind.NORMAL;
  @observable transferSource: TransferSourceType = TransferSource.BYRON;

  // eslint-disable-next-line no-restricted-syntax
  _asyncErrorWrapper = <PT, RT>(func: PT=>Promise<RT>): (PT => Promise<RT>) => (async (payload) => {
    try {
      return await func(payload);
    } catch (error) {
      Logger.error(`YoroiTransferStore ${stringifyError(error)}`);
      runInAction(() => {
        this.status = TransferStatus.ERROR;
        this.error = localizedError(error);
      });
      throw error;
    }
  });
  // eslint-disable-next-line no-restricted-syntax
  _errorWrapper = <PT, RT>(func: PT=>RT): (PT => RT) => ((payload) => {
    try {
      return func(payload);
    } catch (error) {
      Logger.error(`YoroiTransferStore ${stringifyError(error)}`);
      runInAction(() => {
        this.status = TransferStatus.ERROR;
        this.error = localizedError(error);
      });
      throw error;
    }
  });

  setup(): void {
    super.setup();
    this.registerReactions([
      this._enableDisableTransferFunds
    ]);
    const actions = this.actions.ada.yoroiTransfer;
    actions.startTransferFunds.listen(this._startTransferFunds);
    actions.startTransferLegacyHardwareFunds.listen(this._startTransferLegacyHardwareFunds);
    actions.startTransferPaperFunds.listen(this._startTransferPaperFunds);
    actions.startHardwareMnemnoic.listen(this._startHardwareMnemnoic);
    actions.setupTransferFundsWithMnemonic.listen(this.setupTransferFundsWithMnemonic);
    actions.setupTransferFundsWithPaperMnemonic.listen(
      this._errorWrapper(this._setupTransferFundsWithPaperMnemonic)
    );
    actions.checkAddresses.listen(
      this._asyncErrorWrapper(this.checkAddresses)
    );
    actions.backToUninitialized.listen(this._backToUninitialized);
    actions.transferFunds.listen(this._asyncErrorWrapper(this._transferFunds));
    actions.cancelTransferFunds.listen(this.reset);
  }

  teardown(): void {
    super.teardown();
    this.reset();
  }

  _startTransferFunds: {|
    source: TransferSourceType,
  |} => void = (payload) => {
    runInAction(() => {
      this.transferKind = TransferKind.NORMAL;
      this.transferSource = payload.source;
    });
    this._updateStatus(TransferStatus.GETTING_MNEMONICS);
  }

  _startTransferPaperFunds: {|
    source: TransferSourceType,
  |} => void = (payload) => {
    runInAction(() => {
      this.transferKind = TransferKind.PAPER;
      this.transferSource = payload.source;
    });
    this._updateStatus(TransferStatus.GETTING_PAPER_MNEMONICS);
  }

  _startTransferLegacyHardwareFunds: TransferKindType => void = (kind) => {
    runInAction(() => {
      this.transferKind = kind;
      this.transferSource = TransferSource.BYRON;
    });
    this._updateStatus(TransferStatus.HARDWARE_DISCLAIMER);
  }

  _startHardwareMnemnoic: void => void = () => {
    this._updateStatus(TransferStatus.GETTING_HARDWARE_MNEMONIC);
  }

  /** @Attention:
      You should check wallets state outside of the runInAction,
      because this method run as a reaction.
  */
  _enableDisableTransferFunds: void => void = (): void => {
    const { wallets } = this.stores.substores[environment.API];
    // User must first make a Yoroi wallet before being able to transfer a Daedalus wallet
    if (wallets.hasActiveWallet) {
      runInAction(() => {
        this.disableTransferFunds = false;
      });
    } else {
      runInAction(() => {
        this.disableTransferFunds = true;
      });
    }
  }

  nextInternalAddress: PublicDeriverWithCachedMeta => (void => Promise<string>) = (
    publicDeriver
  ) => {
    return async () => {
      const withChains = asHasUtxoChains(publicDeriver.self);
      if (!withChains) throw new Error(`${nameof(this.nextInternalAddress)} missing chains functionality`);
      const nextInternal = await withChains.nextInternal();
      if (nextInternal.addressInfo == null) {
        throw new Error(`${nameof(this.nextInternalAddress)} no internal addresses left. Should never happen`);
      }
      const nextInternalAddress = nextInternal.addressInfo.addr.Hash;
      return nextInternalAddress;
    };
  }

  _generateTransferTxFromMnemonic: (
    string,
    void => void,
    void => Promise<string>
  ) => Promise<TransferTx> = async (
    recoveryPhrase,
    updateStatusCallback,
    getDestinationAddress,
  ) => {
    // 1) get receive address
    const destinationAddress = await getDestinationAddress();

    // 2) Perform restoration
    const accountIndex = 0 + HARD_DERIVATION_START;
    const { masterKey, addresses } = await this._restoreWalletForTransfer(
      recoveryPhrase,
      accountIndex,
    );

    updateStatusCallback();

    const isShelley = this.transferSource === TransferSource.SHELLEY_UTXO ||
      this.transferSource === TransferSource.SHELLEY_CHIMERIC_ACCOUNT;

    // 3) Calculate private keys for restored wallet utxo
    const accountKey = RustModule.WalletV3.Bip32PrivateKey
      .from_bytes(Buffer.from(masterKey, 'hex'))
      .derive(isShelley
        ? WalletTypePurpose.CIP1852
        : WalletTypePurpose.BIP44)
      .derive(CoinTypes.CARDANO)
      .derive(accountIndex);

    // 4) generate transaction
    const baseRequest = {
      addresses,
      outputAddr: destinationAddress,
      keyLevel: Bip44DerivationLevels.ACCOUNT.level,
      signingKey: accountKey,
      getUTXOsForAddresses:
        this.stores.substores.ada.stateFetchStore.fetcher.getUTXOsForAddresses,
    };

    const transferTx = isShelley
      ? await generateCip1852TransferTx(baseRequest)
      : await generateLegacyYoroiTransferTx({
        ...baseRequest,
        legacy: !environment.isShelley(),
      });
    // Possible exception: NotEnoughMoneyToSendError
    return transferTx;
  }

  _setupTransferFundsWithPaperMnemonic: {|
    recoveryPhrase: string,
    paperPassword: string,
  |} => void = (payload) => {
    const result = unscramblePaperAdaMnemonic(
      payload.recoveryPhrase,
      config.wallets.YOROI_PAPER_RECOVERY_PHRASE_WORD_COUNT,
      payload.paperPassword
    );
    const recoveryPhrase = result[0];
    if (recoveryPhrase == null) {
      throw new Error(`${nameof(this._setupTransferFundsWithPaperMnemonic)} paper wallet failed`);
    }
    this.setupTransferFundsWithMnemonic({
      recoveryPhrase,
    });
  }

  setupTransferFundsWithMnemonic: {|
    recoveryPhrase: string,
  |} => void = (
    payload
  ) => {
    runInAction(() => {
      this.recoveryPhrase = payload.recoveryPhrase;
    });
    this._updateStatus(TransferStatus.DISPLAY_CHECKSUM);
  }

  checkAddresses: {|
    getDestinationAddress: void => Promise<string>,
  |} => Promise<void> = async (
    payload
  ): Promise<void> => {
    this._updateStatus(TransferStatus.CHECKING_ADDRESSES);
    const transferTx = await this._generateTransferTxFromMnemonic(
      this.recoveryPhrase,
      () => this._updateStatus(TransferStatus.GENERATING_TX),
      payload.getDestinationAddress,
    );
    runInAction(() => {
      this.transferTx = transferTx;
    });

    this._updateStatus(TransferStatus.READY_TO_TRANSFER);
  }

  _backToUninitialized: void => void = () => {
    this._updateStatus(TransferStatus.UNINITIALIZED);
  }

  /** Updates the status that we show to the user as transfer progresses */
  @action.bound
  _updateStatus(s: TransferStatusT): void {
    this.status = s;
  }

  /** Broadcast the transfer transaction if one exists and proceed to continuation */
  _transferFunds: {|
    next: void => Promise<void>,
    getDestinationAddress: void => Promise<string>,
    /*
     re-recover from the mnemonics to reduce the chance that the wallet
     changes before the tx is submit (we can't really eliminate it).
     */
    rebuildTx: boolean,
  |} => Promise<void> = async (payload) => {
    runInAction(() => {
      this.error = null;
    });
    const oldTx = (() => {
      const tx = this.transferTx;
      if (tx == null) {
        throw new NoTransferTxError();
      }
      return tx;
    })();

    const getTransferTx = async () => {
      if (!payload.rebuildTx) {
        return oldTx;
      }
      const newTx = await this._generateTransferTxFromMnemonic(
        this.recoveryPhrase,
        () => {},
        payload.getDestinationAddress,
      );
      if (this._isWalletChanged(oldTx, newTx)) {
        this._handleWalletChanged(newTx);
        return null;
      }
      return newTx;
    };

    const { next } = payload;

    await this.transferFundsRequest.execute({
      getTransferTx,
    });
    if (this.error == null) {
      this._updateStatus(TransferStatus.SUCCESS);
      await next();
      this.reset();
    }
  }

  _isWalletChanged(transferTx1: TransferTx, transferTx2: TransferTx): boolean {
    return !transferTx1.recoveredBalance.isEqualTo(transferTx2.recoveredBalance) ||
      !isEqual(transferTx1.senders, transferTx2.senders);
  }

  _handleWalletChanged(newTransferTx: TransferTx): void {
    runInAction(() => {
      this.transferTx = newTransferTx;
      this.error = new WalletChangedError();
    });
  }

  @action.bound
  reset(): void {
    this.status = TransferStatus.UNINITIALIZED;
    this.error = null;
    this.transferTx = null;
    this.transferFundsRequest.reset();
    this.restoreForTransferRequest.reset();
    this.recoveryPhrase = '';
    this.transferKind = TransferKind.NORMAL;
    this.transferSource = TransferSource.BYRON;
  }

  _restoreWalletForTransfer: (string, number) => Promise<RestoreWalletForTransferResponse> = async (
    recoveryPhrase,
    accountIndex,
  ) => {
    this.restoreForTransferRequest.reset();

    const rootPk = this.transferKind === TransferKind.LEDGER
      ? generateLedgerWalletRootKey(recoveryPhrase)
      : generateWalletRootKey(recoveryPhrase);
    const stateFetcher = this.stores.substores[environment.API].stateFetchStore.fetcher;
    const restoreResult = await this.restoreForTransferRequest.execute({
      rootPk,
      accountIndex,
      checkAddressesInUse: stateFetcher.checkAddressesInUse,
      transferSource: this.transferSource,
    }).promise;
    if (!restoreResult) throw new Error('Restored wallet was not received correctly');
    return restoreResult;
  };

  _checkAndTransfer: {|
    getTransferTx: void => Promise<?TransferTx>,
  |} => Promise<void> = async (request) => {
    const transferTx = await request.getTransferTx();
    if (transferTx == null) return;

    try {
      await this.stores.substores.ada.stateFetchStore.fetcher.sendTx({
        id: transferTx.id,
        encodedTx: transferTx.encodedTx,
      });
    } catch (error) {
      if (error.id === 'api.errors.sendTransactionApiError') {
        /* See if the error is due to wallet change since last recovery.
           This should be very rare because the window is short.
        */
        const newTx = await request.getTransferTx(); // will update the tx if something changed
        if (newTx == null) {
          return;
        }
      }

      Logger.error(`${nameof(YoroiTransferStore)}::${nameof(this._checkAndTransfer)} ${stringifyError(error)}`);
      runInAction(() => {
        this.error = new TransferFundsError();
      });
    }
  }
}

const messages = defineMessages({
  transferFundsError: {
    id: 'yoroiTransfer.error.transferFundsError',
    defaultMessage: '!!!Unable to transfer funds.',
  },
  noTransferTxError: {
    id: 'yoroiTransfer.error.noTransferTxError',
    defaultMessage: '!!!There is no transfer transaction to send.',
  },
  walletChangedError: {
    id: 'yoroiTransfer.error.walletChangedError',
    defaultMessage: '!!!The wallet has changed. Please re-confirm your transaction.',
  }
});

export class TransferFundsError extends LocalizableError {
  constructor() {
    super({
      id: messages.transferFundsError.id,
      defaultMessage: messages.transferFundsError.defaultMessage || '',
      description: messages.transferFundsError.description,
    });
  }
}

export class NoTransferTxError extends LocalizableError {
  constructor() {
    super({
      id: messages.noTransferTxError.id,
      defaultMessage: messages.noTransferTxError.defaultMessage || '',
      description: messages.noTransferTxError.description,
    });
  }
}

class WalletChangedError extends LocalizableError {
  constructor() {
    super({
      id: messages.walletChangedError.id,
      defaultMessage: messages.walletChangedError.defaultMessage || '',
      description: messages.walletChangedError.description,
    });
  }
}
