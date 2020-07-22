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
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver/index';
import {
  asHasUtxoChains,
} from '../../api/ada/lib/storage/models/PublicDeriver/traits';
import {
  unscramblePaperAdaMnemonic,
} from '../../api/ada/lib/cardanoCrypto/paperWallet';
import config from '../../config';
import { getApiForNetwork } from '../../api/common/utils';

export default class YoroiTransferStore extends Store {

  @observable status: TransferStatusT = TransferStatus.UNINITIALIZED;
  @observable transferFundsRequest: Request<typeof YoroiTransferStore.prototype._checkAndTransfer>
    = new Request<typeof YoroiTransferStore.prototype._checkAndTransfer>(this._checkAndTransfer);
  @observable error: ?LocalizableError = null;
  @observable transferTx: ?TransferTx = null;
  @observable recoveryPhrase: string = '';
  @observable transferKind: TransferKindType = TransferKind.NORMAL;
  @observable transferSource: TransferSourceType = TransferSource.BYRON;

  // eslint-disable-next-line no-restricted-syntax
  _asyncErrorWrapper: (<PT, RT>(
      func: (PT) => Promise<RT>
    ) => (PT) => Promise<RT>) = <PT, RT>(
      func: PT=>Promise<RT>
    ): (PT => Promise<RT>) => (async (payload) => {
      try {
        return await func(payload);
      } catch (error) {
        Logger.error(`${nameof(YoroiTransferStore)} ${stringifyError(error)}`);
        runInAction(() => {
          this.status = TransferStatus.ERROR;
          this.error = localizedError(error);
        });
        throw error;
      }
    });
  // eslint-disable-next-line no-restricted-syntax
  _errorWrapper: (<PT, RT>(
    func: (PT) => RT
  ) => (PT) => RT) = <PT, RT>(
    func: PT=>RT
  ): (PT => RT) => ((payload) => {
    try {
      return func(payload);
    } catch (error) {
      Logger.error(`${nameof(YoroiTransferStore)} ${stringifyError(error)}`);
      runInAction(() => {
        this.status = TransferStatus.ERROR;
        this.error = localizedError(error);
      });
      throw error;
    }
  });

  setup(): void {
    super.setup();
    const actions = this.actions.yoroiTransfer;
    actions.startTransferFunds.listen(this._startTransferFunds);
    actions.startTransferLegacyHardwareFunds.listen(this._startTransferLegacyHardwareFunds);
    actions.startTransferPaperFunds.listen(this._startTransferPaperFunds);
    actions.startHardwareMnemonic.listen(this._startHardwareMnemonic);
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

  _startHardwareMnemonic: void => void = () => {
    this._updateStatus(TransferStatus.GETTING_HARDWARE_MNEMONIC);
  }

  nextInternalAddress: PublicDeriver<> => (void => Promise<string>) = (
    publicDeriver
  ) => {
    return async () => {
      const withChains = asHasUtxoChains(publicDeriver);
      if (!withChains) throw new Error(`${nameof(this.nextInternalAddress)} missing chains functionality`);
      const nextInternal = await withChains.nextInternal();
      if (nextInternal.addressInfo == null) {
        throw new Error(`${nameof(this.nextInternalAddress)} no internal addresses left. Should never happen`);
      }
      const nextInternalAddress = nextInternal.addressInfo.addr.Hash;
      return nextInternalAddress;
    };
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

  generateTransferTxFromMnemonic: {|
    recoveryPhrase: string,
    updateStatusCallback: void => void,
    getDestinationAddress: void => Promise<string>,
  |} => Promise<TransferTx> = async (request) => {
    if (this.stores.profile.selectedNetwork == null) {
      throw new Error(`${nameof(YoroiTransferStore)}::${nameof(this.generateTransferTxFromMnemonic)} no network selected`);
    }
    const selectedApiType = getApiForNetwork(this.stores.profile.selectedNetwork);
    if (!this.stores.substores[selectedApiType].yoroiTransfer) {
      throw new Error(`${nameof(YoroiTransferStore)}::${nameof(this.checkAddresses)} currency doesn't support Yoroi transfer`);
    }
    const { yoroiTransfer } = this.stores.substores[selectedApiType];
    return await yoroiTransfer.generateTransferTxFromMnemonic(
      request,
    );
  }

  checkAddresses: {|
    getDestinationAddress: void => Promise<string>,
  |} => Promise<void> = async (
    payload
  ): Promise<void> => {
    this._updateStatus(TransferStatus.CHECKING_ADDRESSES);
    const transferTx = await this.generateTransferTxFromMnemonic({
      recoveryPhrase: this.recoveryPhrase,
      updateStatusCallback: () => this._updateStatus(TransferStatus.GENERATING_TX),
      getDestinationAddress: payload.getDestinationAddress,
    });
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
      const newTx = await this.generateTransferTxFromMnemonic({
        recoveryPhrase: this.recoveryPhrase,
        updateStatusCallback: () => {},
        getDestinationAddress: payload.getDestinationAddress,
      });
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
    this.recoveryPhrase = '';
    this.transferKind = TransferKind.NORMAL;
    this.transferSource = TransferSource.BYRON;
  }

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

export class WalletChangedError extends LocalizableError {
  constructor() {
    super({
      id: messages.walletChangedError.id,
      defaultMessage: messages.walletChangedError.defaultMessage || '',
      description: messages.walletChangedError.description,
    });
  }
}
