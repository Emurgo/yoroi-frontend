// @flow
import { observable, action, runInAction } from 'mobx';
import { defineMessages } from 'react-intl';
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
import { getCryptoWalletFromMasterKey } from '../../api/ada/lib/cardanoCrypto/cryptoWallet';
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

  @observable status: TransferStatus = 'gettingMnemonics';
  @observable transferFundsRequest: Request<TransferFundsFunc>
    = new Request<TransferFundsFunc>(this._transferFundsRequest);
  @observable restoreForTransferRequest: Request<RestoreWalletForTransferFunc>
    = new Request(this.api.ada.restoreWalletForTransfer);
  @observable error: ?LocalizableError = null;
  @observable transferTx: ?TransferTx = null;

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
    const actions = this.actions.ada.yoroiTransfer;
    actions.setupTransferFundsWithMnemonic.listen(
      this._errorWrapper(this._setupTransferFundsWithMnemonic)
    );
    actions.backToUninitialized.listen(this._backToUninitialized);
    actions.transferFunds.listen(this._errorWrapper(this._transferFunds));
    actions.cancelTransferFunds.listen(this._reset);
  }

  teardown(): void {
    super.teardown();
    this._reset();
  }

  _setupTransferFundsWithMnemonic = async (payload: { recoveryPhrase: string }): Promise<void> => {
    this._updateStatus('checkingAddresses');

    const { masterKey, addresses } = await this._restoreWalletForTransfer(payload.recoveryPhrase);

    this._updateStatus('generatingTx');

    const cryptoWallet = getCryptoWalletFromMasterKey(masterKey, '');
    const addressKeys = {};
    addresses.forEach(({ address, accountIndex, addressType, index }) => {
      const account = cryptoWallet.bip44_account(
        RustModule.Wallet.AccountIndex.new(accountIndex | HARD_DERIVATION_START)
      );
      const chainPrv = account.bip44_chain(addressType === 'Interanl');
      const keyPrv = chainPrv.address_key(RustModule.Wallet.AddressKeyIndex.new(index));
      addressKeys[address] = keyPrv;
    });

    const outputAddr = await getReceiverAddress();
    // Possible exception: NotEnoughMoneyToSendError
    const transferTx = await generateTransferTx({
      outputAddr,
      addressKeys,
      getUTXOsForAddresses:
        this.stores.substores.ada.stateFetchStore.fetcher.getUTXOsForAddresses,
      filterSenders: true
    });

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
    try {
      const { next } = payload;

      if (!this.transferTx) {
        throw new NoTransferTxError();
      }
      await this.transferFundsRequest.execute({
        signedTx: this.transferTx.signedTx
      });
      // TBD: why do we need a continuation instead of just pustting the code here directly?
      next();
      this._reset();
    } catch (error) {
      Logger.error(`YoroiTransferStore::transferFunds ${stringifyError(error)}`);
      runInAction(() => {
        this.error = new TransferFundsError();
      });
    }
  }

  @action.bound
  _reset(): void {
    this.status = 'uninitialized';
    this.error = null;
    this.transferTx = null;
    this.transferFundsRequest.reset();
    this.restoreForTransferRequest.reset();
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
