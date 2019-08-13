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
  TransferStatus,
  TransferTx
} from '../../types/TransferTypes';
import { generateTransferTx } from '../../api/ada/daedalusTransfer';
import environment from '../../environment';
import type { SignedResponse } from '../../api/ada/lib/state-fetch/types';
import { getReceiverAddress } from '../../api/ada/lib/storage/adaAddress';
import { getCryptoWalletFromEncryptedMasterKey } from '../../api/ada/lib/cardanoCrypto/cryptoWallet';
import { RustModule } from '../../api/ada/lib/cardanoCrypto/rustLoader';
import { HARD_DERIVATION_START } from '../../config/numbersConfig';
import type { RestoreWalletForTransferResponse, RestoreWalletForTransferFunc } from '../../api/ada/index';

type TransferFundsRequest = {
  signedTx: RustModule.Wallet.SignedTransaction,
};
type TransferFundsResponse = SignedResponse;
type TransferFundsFunc = (
  request: TransferFundsRequest
) => Promise<TransferFundsResponse>;


export default class YoroiTransferStore extends Store {

  @observable status: TransferStatus = 'uninitialized';
  @observable disableTransferFunds: boolean = true;
  @observable transferFundsRequest: Request<TransferFundsFunc>
    = new Request<TransferFundsFunc>(this._transferFundsRequest);
  @observable restoreForTransferRequest: Request<RestoreWalletForTransferFunc>
    = new Request(this.api.ada.restoreWalletForTransfer);
  @observable error: ?LocalizableError = null;
  @observable transferTx: ?TransferTx = null;
  recoveryPhrase: string = '';

  _errorWrapper = <PT, RT>(func: PT=>Promise<RT>): (PT => Promise<RT>) => (async (payload) => {
    try {
      return await func(payload);
    } catch (error) {
      Logger.error(`YoroiTransferStore ${stringifyError(error)}`);
      runInAction(() => {
        this.status = 'error';
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
    actions.setupTransferFundsWithMnemonic.listen(
      this._errorWrapper(this._setupTransferFundsWithMnemonic)
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
    this._updateStatus('gettingMnemonics');
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

  _generateTransferTxFromMnemonic = async (recoveryPhrase: string,
    updateStatusCallback: void=>void) => {
    const { masterKey, addresses } = await this._restoreWalletForTransfer(recoveryPhrase);

    updateStatusCallback();

    const cryptoWallet = getCryptoWalletFromEncryptedMasterKey(masterKey, '');
    const addressKeys = {};
    addresses.forEach(({ address, accountIndex, addressType, index }) => {
      const account = cryptoWallet.bip44_account(
        RustModule.Wallet.AccountIndex.new(accountIndex | HARD_DERIVATION_START)
      );
      const chainPrv = account.bip44_chain(addressType === 'Internal');
      const keyPrv = chainPrv.address_key(RustModule.Wallet.AddressKeyIndex.new(index));
      addressKeys[address] = keyPrv;
    });

    const outputAddr = await getReceiverAddress();
    // Possible exception: NotEnoughMoneyToSendError
    return generateTransferTx({
      outputAddr,
      addressKeys,
      getUTXOsForAddresses:
        this.stores.substores.ada.stateFetchStore.fetcher.getUTXOsForAddresses,
      filterSenders: true
    });
  }

  _setupTransferFundsWithMnemonic = async (payload: { recoveryPhrase: string }): Promise<void> => {
    this._updateStatus('checkingAddresses');
    this.recoveryPhrase = payload.recoveryPhrase;
    const transferTx = await this._generateTransferTxFromMnemonic(
      payload.recoveryPhrase,
      () => this._updateStatus('generatingTx')
    );
    runInAction(() => {
      this.transferTx = transferTx;
    });

    this._updateStatus('readyToTransfer');
  }

  _backToUninitialized = (): void => {
    this._updateStatus('uninitialized');
  }

  /** Updates the status that we show to the user as transfer progresses */
  @action.bound
  _updateStatus(s: TransferStatus): void {
    this.status = s;
  }

  /** Broadcast the transfer transaction if one exists and proceed to continuation */
  _transferFunds = async (payload: {
    next: void => void
  }): Promise<void> => {
    /*
     Always re-recover from the mnemonics to reduce the chance that the wallet
     changes before the tx is submit (we can't really eliminate it).
     */
    const transferTx = await this._generateTransferTxFromMnemonic(
      this.recoveryPhrase, () => {}
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
      this._updateStatus('success');
      await next();
      this.reset();
    } catch (error) {
      if (error.id === 'api.errors.sendTransactionApiError') {
        /* See if the error is due to wallet change since last recovery.
           This should be very rare because the window is short.
        */
        const newTransferTx = await this._generateTransferTxFromMnemonic(
          this.recoveryPhrase, () => {}
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
    this.status = 'uninitialized';
    this.error = null;
    this.transferTx = null;
    this.transferFundsRequest.reset();
    this.restoreForTransferRequest.reset();
    this.recoveryPhrase = '';
  }

  _restoreWalletForTransfer = async (recoveryPhrase: string) :
    Promise<RestoreWalletForTransferResponse> => {
    this.restoreForTransferRequest.reset();

    const stateFetcher = this.stores.substores[environment.API].stateFetchStore.fetcher;
    const restoreResult = await this.restoreForTransferRequest.execute({
      recoveryPhrase,
      checkAddressesInUse: stateFetcher.checkAddressesInUse,
    }).promise;
    if (!restoreResult) throw new Error('Restored wallet was not received correctly');
    return restoreResult;
  };

  /** Send a transaction to the backend-service to be broadcast into the network */
  _transferFundsRequest = async (request: {
    signedTx: RustModule.Wallet.SignedTransaction,
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
