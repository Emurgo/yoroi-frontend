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
  TransferTx
} from '../../types/TransferTypes';
import { TransferStatus } from '../../types/TransferTypes';
import { generateYoroiTransferTx } from '../../api/ada/transactions/byron/yoroiTransfer';
import environment from '../../environment';
import type { SignedResponse } from '../../api/ada/lib/state-fetch/types';
import { RustModule } from '../../api/ada/lib/cardanoCrypto/rustLoader';
import {
  HARD_DERIVATION_START,
  BIP44_PURPOSE,
  CARDANO_COINTYPE,
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

type TransferFundsRequest = {
  signedTx: RustModule.WalletV2.SignedTransaction,
};
type TransferFundsResponse = SignedResponse;
type TransferFundsFunc = (
  request: TransferFundsRequest
) => Promise<TransferFundsResponse>;


export default class YoroiTransferStore extends Store {

  @observable status: TransferStatusT = TransferStatus.UNINITIALIZED;
  @observable disableTransferFunds: boolean = true;
  @observable transferFundsRequest: Request<TransferFundsFunc>
    = new Request<TransferFundsFunc>(this._transferFundsRequest);
  @observable restoreForTransferRequest: Request<RestoreWalletForTransferFunc>
    = new Request(this.api.ada.restoreWalletForTransfer);
  @observable error: ?LocalizableError = null;
  @observable transferTx: ?TransferTx = null;
  @observable recoveryPhrase: string = '';

  _errorWrapper = <PT, RT>(func: PT=>Promise<RT>): (PT => Promise<RT>) => (async (payload) => {
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

  setup(): void {
    this.registerReactions([
      this._enableDisableTransferFunds
    ]);
    const actions = this.actions.ada.yoroiTransfer;
    actions.startTransferFunds.listen(this._startTransferFunds);
    actions.startTransferPaperFunds.listen(this._startTransferPaperFunds);
    actions.setupTransferFundsWithMnemonic.listen(
      this._errorWrapper(this._setupTransferFundsWithMnemonic)
    );
    actions.setupTransferFundsWithPaperMnemonic.listen(
      this._errorWrapper(this._setupTransferFundsWithPaperMnemonic)
    );
    actions.checkAddresses.listen(
      this._errorWrapper(this._checkAddresses)
    );
    actions.backToUninitialized.listen(this._backToUninitialized);
    actions.transferFunds.listen(this._errorWrapper(this._transferFunds));
    actions.cancelTransferFunds.listen(this.reset);
  }

  teardown(): void {
    super.teardown();
    this.reset();
  }

  _startTransferFunds = () => {
    this._updateStatus(TransferStatus.GETTING_MNEMONICS);
  }

  _startTransferPaperFunds = () => {
    this._updateStatus(TransferStatus.GETTING_PAPER_MNEMONICS);
  }

  /** @Attention:
      You should check wallets state outside of the runInAction,
      because this method run as a reaction.
  */
  _enableDisableTransferFunds = (): void => {
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

  _generateTransferTxFromMnemonic = async (
    recoveryPhrase: string,
    updateStatusCallback: void => void,
    publicDeriver: PublicDeriverWithCachedMeta,
  ): Promise<TransferTx> => {
    // 1) get receive address
    const withChains = asHasUtxoChains(publicDeriver.self);
    if (!withChains) throw new Error('_setupTransferWebSocket missing chains functionality');
    const nextInternal = await withChains.nextInternal();
    if (nextInternal.addressInfo == null) {
      throw new Error('_setupTransferWebSocket no internal addresses left. Should never happen');
    }
    const nextInternalAddress = nextInternal.addressInfo.addr.Hash;

    // 2) Perform restoration
    const accountIndex = 0 + HARD_DERIVATION_START;
    const { masterKey, addresses } = await this._restoreWalletForTransfer(
      recoveryPhrase,
      accountIndex
    );

    updateStatusCallback();

    // 3) Calculate private keys for restored wallet utxo
    const accountKey = RustModule.WalletV3.Bip32PrivateKey
      .from_bytes(Buffer.from(masterKey, 'hex'))
      .derive(BIP44_PURPOSE)
      .derive(CARDANO_COINTYPE)
      .derive(accountIndex);

    // 4) generate transaction

    // Possible exception: NotEnoughMoneyToSendError
    return await generateYoroiTransferTx({
      addresses,
      outputAddr: nextInternalAddress,
      keyLevel: Bip44DerivationLevels.ACCOUNT.level,
      signingKey: accountKey,
      getUTXOsForAddresses:
        this.stores.substores.ada.stateFetchStore.fetcher.getUTXOsForAddresses,
      filterSenders: true
    });
  }

  _setupTransferFundsWithPaperMnemonic = async (payload: {
    recoveryPhrase: string,
    paperPassword: string,
    publicDeriver: PublicDeriverWithCachedMeta,
  }): Promise<void> => {
    const result = unscramblePaperAdaMnemonic(
      payload.recoveryPhrase,
      config.wallets.YOROI_PAPER_RECOVERY_PHRASE_WORD_COUNT,
      payload.paperPassword
    );
    const recoveryPhrase = result[0];
    if (recoveryPhrase == null) {
      throw new Error('_setupTransferFundsWithPaperMnemonic paper wallet failed');
    }
    await this._setupTransferFundsWithMnemonic({
      recoveryPhrase,
      publicDeriver: payload.publicDeriver,
    });
  }

  _setupTransferFundsWithMnemonic = async (payload: {
    recoveryPhrase: string,
    publicDeriver: PublicDeriverWithCachedMeta,
  }): Promise<void> => {
    runInAction(() => {
      this.recoveryPhrase = payload.recoveryPhrase;
    });
    this._updateStatus(TransferStatus.DISPLAY_CHECKSUM);
  }

  _checkAddresses = async (payload: {
    publicDeriver: PublicDeriverWithCachedMeta,
  }): Promise<void> => {
    this._updateStatus(TransferStatus.CHECKING_ADDRESSES);
    const transferTx = await this._generateTransferTxFromMnemonic(
      this.recoveryPhrase,
      () => this._updateStatus(TransferStatus.GENERATING_TX),
      payload.publicDeriver
    );
    runInAction(() => {
      this.transferTx = transferTx;
    });

    this._updateStatus(TransferStatus.READY_TO_TRANSFER);
  }

  _backToUninitialized = (): void => {
    this._updateStatus(TransferStatus.UNINITIALIZED);
  }

  /** Updates the status that we show to the user as transfer progresses */
  @action.bound
  _updateStatus(s: TransferStatusT): void {
    this.status = s;
  }

  /** Broadcast the transfer transaction if one exists and proceed to continuation */
  _transferFunds = async (payload: {
    next: void => void,
    publicDeriver: PublicDeriverWithCachedMeta,
  }): Promise<void> => {
    /*
     Always re-recover from the mnemonics to reduce the chance that the wallet
     changes before the tx is submit (we can't really eliminate it).
     */
    const transferTx = await this._generateTransferTxFromMnemonic(
      this.recoveryPhrase, () => {},
      payload.publicDeriver,
    );
    if (!this.transferTx) {
      throw new NoTransferTxError();
    }
    if (this._isWalletChanged(transferTx, this.transferTx)) {
      return this._handleWalletChanged(transferTx);
    }

    try {
      const { next } = payload;

      await this.transferFundsRequest.execute({
        signedTx: transferTx.signedTx
      });
      this._updateStatus(TransferStatus.SUCCESS);
      await next();
      this.reset();
    } catch (error) {
      if (error.id === 'api.errors.sendTransactionApiError') {
        /* See if the error is due to wallet change since last recovery.
           This should be very rare because the window is short.
        */
        const newTransferTx = await this._generateTransferTxFromMnemonic(
          this.recoveryPhrase, () => {},
          payload.publicDeriver,
        );
        if (this._isWalletChanged(newTransferTx, transferTx)) {
          return this._handleWalletChanged(newTransferTx);
        }
      }

      Logger.error(`YoroiTransferStore::transferFunds ${stringifyError(error)}`);
      runInAction(() => {
        this.error = new TransferFundsError();
      });
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
  }

  _restoreWalletForTransfer = async (
    recoveryPhrase: string,
    accountIndex: number,
  ): Promise<RestoreWalletForTransferResponse> => {
    this.restoreForTransferRequest.reset();

    const stateFetcher = this.stores.substores[environment.API].stateFetchStore.fetcher;
    const restoreResult = await this.restoreForTransferRequest.execute({
      recoveryPhrase,
      accountIndex,
      checkAddressesInUse: stateFetcher.checkAddressesInUse,
    }).promise;
    if (!restoreResult) throw new Error('Restored wallet was not received correctly');
    return restoreResult;
  };

  /** Send a transaction to the backend-service to be broadcast into the network */
  _transferFundsRequest = async (request: {
    signedTx: RustModule.WalletV2.SignedTransaction,
  }): Promise<SignedResponse> => (
    this.stores.substores.ada.stateFetchStore.fetcher.sendTx({ signedTx: request.signedTx })
  )

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
