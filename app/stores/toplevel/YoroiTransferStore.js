// @flow
import { observable, action, runInAction } from 'mobx';
import { defineMessages } from 'react-intl';
import { isEqual } from 'lodash';
import {
  Logger,
  stringifyError
} from '../../utils/logging';
import Store from '../base/Store';
import LocalizableError, {
  localizedError
} from '../../i18n/LocalizableError';
import type {
  TransferStatusT,
  TransferTx,
} from '../../types/TransferTypes';
import { TransferStatus, } from '../../types/TransferTypes';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver/index';
import {
  unscramblePaperAdaMnemonic,
} from '../../api/ada/lib/cardanoCrypto/paperWallet';
import config from '../../config';
import { getApiForNetwork } from '../../api/common/utils';
import type { RestoreModeType } from '../../actions/common/wallet-restore-actions';
import { SendTransactionApiError } from '../../api/common/errors';
import type {
  Address, Addressing
} from '../../api/ada/lib/storage/models/PublicDeriver/interfaces';
import {
  Bip44DerivationLevels,
} from '../../api/ada/lib/storage/database/walletTypes/bip44/api/utils';
import type { NetworkRow } from '../../api/ada/lib/storage/database/primitives/tables';
import { getReceiveAddress } from '../stateless/addressStores';
import type { ActionsMap } from '../../actions/index';
import type { StoresMap } from '../index';

export default class YoroiTransferStore extends Store<StoresMap, ActionsMap> {

  @observable status: TransferStatusT = TransferStatus.UNINITIALIZED;
  @observable error: ?LocalizableError = null;
  @observable transferTx: ?TransferTx = null;
  @observable recoveryPhrase: string = '';
  @observable privateKey: void | string = undefined;
  @observable mode: RestoreModeType | void = undefined;

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
    actions.startHardwareMnemonic.listen(this._startHardwareMnemonic);
    actions.setPrivateKey.listen(this._setPrivateKey);
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
    source: RestoreModeType,
  |} => void = (payload) => {
    runInAction(() => {
      this.mode = payload.source;
    });
    if (payload.source.extra === 'paper') {
      this._updateStatus(TransferStatus.GETTING_PAPER_MNEMONICS);
      return;
    }
    if (payload.source.extra === 'ledger' || payload.source.extra === 'trezor') {
      this._updateStatus(TransferStatus.HARDWARE_DISCLAIMER);
      return;
    }
    if (payload.source.extra === 'privateKey') {
      const { derivationLevel } = payload.source;
      if (derivationLevel === 0) {
        this._updateStatus(TransferStatus.GETTING_MASTER_KEY);
      } else if (derivationLevel === Bip44DerivationLevels.ADDRESS.level) {
        this._updateStatus(TransferStatus.GETTING_WITHDRAWAL_KEY);
      } else {
        throw new Error(`${nameof(this._startTransferFunds)} unexpected level ${derivationLevel}`);
      }
      return;
    }
    this._updateStatus(TransferStatus.GETTING_MNEMONICS);
  }

  _startHardwareMnemonic: void => void = () => {
    this._updateStatus(TransferStatus.GETTING_HARDWARE_MNEMONIC);
  }

  @action
  _setPrivateKey: string => void = (key) => {
    this.privateKey = key;
  }

  nextInternalAddress: (
    PublicDeriver<>
  ) => (void => Promise<{| ...Address, ...InexactSubset<Addressing> |}>) = (
    publicDeriver
  ) => {
    return async () => {
      const nextInternal = await getReceiveAddress(publicDeriver);
      if (nextInternal == null) {
        throw new Error(`${nameof(this.nextInternalAddress)} no internal addresses left. Should never happen`);
      }
      return {
        address: nextInternal.addr.Hash,
        addressing: nextInternal.addressing,
      };
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

  generateTransferTx: {|
    ...({| recoveryPhrase: string, |} | {| privateKey: string |}),
    updateStatusCallback: void => void,
    getDestinationAddress: void => Promise<{| ...Address, ...InexactSubset<Addressing> |}>,
  |} => Promise<TransferTx> = async (request) => {
    if (this.stores.profile.selectedNetwork == null) {
      throw new Error(`${nameof(YoroiTransferStore)}::${nameof(this.generateTransferTx)} no network selected`);
    }
    const selectedApiType = getApiForNetwork(this.stores.profile.selectedNetwork);
    if (!this.stores.substores[selectedApiType].yoroiTransfer) {
      throw new Error(`${nameof(YoroiTransferStore)}::${nameof(this.checkAddresses)} currency doesn't support Yoroi transfer`);
    }
    const { yoroiTransfer } = this.stores.substores[selectedApiType];
    return await yoroiTransfer.generateTransferTx(
      request,
    );
  }

  checkAddresses: {|
    getDestinationAddress: void => Promise<{| ...Address, ...InexactSubset<Addressing> |}>,
  |} => Promise<void> = async (
    payload
  ): Promise<void> => {
    this._updateStatus(TransferStatus.CHECKING_ADDRESSES);
    const keyInfo = this.privateKey != null
      ? { privateKey: this.privateKey }
      : { recoveryPhrase: this.recoveryPhrase };
    const transferTx = await this.generateTransferTx({
      ...keyInfo,
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
    network: $ReadOnly<NetworkRow>,
    getDestinationAddress: void => Promise<{| ...Address, ...InexactSubset<Addressing> |}>,
    /*
     re-recover from the mnemonics to reduce the chance that the wallet
     changes before the tx is submit (we can't really eliminate it).
     */
    rebuildTx: boolean,
  |} => Promise<void> = async (payload) => {
    runInAction(() => {
      this.error = null;
    });
    const oldTx: TransferTx = (() => {
      const tx = this.transferTx;
      if (tx == null) {
        throw new NoTransferTxError();
      }
      return tx;
    })();

    const getTransferTx = async (): Promise<TransferTx> => {
      if (!payload.rebuildTx) {
        return oldTx;
      }
      const keyInfo = this.privateKey != null
        ? { privateKey: this.privateKey }
        : { recoveryPhrase: this.recoveryPhrase };
      const newTx = await this.generateTransferTx({
        ...keyInfo,
        updateStatusCallback: () => {},
        getDestinationAddress: payload.getDestinationAddress,
      });
      if (this._isWalletChanged(oldTx, newTx)) {
        this._handleWalletChanged(newTx);
      }
      return newTx;
    };

    const { next } = payload;

    try {
      await this.stores.wallets.sendAndRefresh({
        publicDeriver: undefined,
        broadcastRequest: async () => {
          const transferTx = await getTransferTx();
          if (transferTx.id == null || transferTx.encodedTx == null) {
            throw new Error(`${nameof(YoroiTransferStore)} transaction not signed`);
          }
          const { id, encodedTx } = transferTx;
          try {
            const txId = await this.stores.substores.ada.stateFetchStore.fetcher.sendTx({
              network: payload.network,
              id,
              encodedTx,
            });
            return txId;
          } catch (error) {
            if (error instanceof SendTransactionApiError) {
              /* See if the error is due to wallet change since last recovery.
                This should be very rare because the window is short.
              */
              await getTransferTx(); // will update the tx if something changed
            }

            throw new TransferFundsError();
          }
        },
        refreshWallet: async () => {
          const selected = this.stores.wallets.selected;
          if (selected == null) return;
          await this.stores.wallets.refreshWalletFromRemote(selected);
        }
      });
    } catch (e) {
      Logger.error(`${nameof(YoroiTransferStore)}::${nameof(this._transferFunds)} ${stringifyError(e)}`);
      runInAction(() => { this.error = e; });
    }
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
    });
    throw new WalletChangedError();
  }

  @action.bound
  reset(): void {
    this.status = TransferStatus.UNINITIALIZED;
    this.error = null;
    this.transferTx = null;
    this.privateKey = undefined;
    this.stores.wallets.sendMoneyRequest.reset();
    this.recoveryPhrase = '';
    this.mode = undefined;

    if (this.stores.profile.selectedNetwork != null) {
      const selectedApiType = getApiForNetwork(this.stores.profile.selectedNetwork);
      if (this.stores.substores[selectedApiType].yoroiTransfer) {
        this.stores.substores[selectedApiType].yoroiTransfer.reset();
      }
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
