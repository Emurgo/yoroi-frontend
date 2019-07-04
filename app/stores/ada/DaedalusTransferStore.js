// @flow
import { observable, action, runInAction } from 'mobx';
import { defineMessages } from 'react-intl';
import {
  Logger,
  stringifyError
} from '../../utils/logging';
import Store from '../base/Store';
import Request from '../lib/LocalizedRequest';
import type { ConfigType } from '../../../config/config-types';
import LocalizableError, {
  localizedError
} from '../../i18n/LocalizableError';
import type {
  TransferStatus,
  TransferTx
} from '../../types/TransferTypes';
import {
  getAddressesKeys,
  generateTransferTx
} from '../../api/ada/daedalusTransfer';
import environment from '../../environment';
import type { SignedResponse } from '../../api/ada/lib/state-fetch/types';
import { getReceiverAddress } from '../../api/ada/lib/storage/adaAddress';
import {
  getCryptoDaedalusWalletFromMnemonics,
  getCryptoDaedalusWalletFromMasterKey
} from '../../api/ada/lib/cardanoCrypto/cryptoWallet';
import { RustModule } from '../../api/ada/lib/cardanoCrypto/rustLoader';

declare var CONFIG: ConfigType;
const websocketUrl = CONFIG.network.websocketUrl;
const MSG_TYPE_RESTORE = 'RESTORE';
const WS_CODE_NORMAL_CLOSURE = 1000;

type TransferFundsRequest = {
  signedTx: RustModule.Wallet.SignedTransaction,
};
type TransferFundsResponse = SignedResponse;
type TransferFundsFunc = (
  request: TransferFundsRequest
) => Promise<TransferFundsResponse>;

export default class DaedalusTransferStore extends Store {

  @observable status: TransferStatus = 'uninitialized';
  @observable disableTransferFunds: boolean = true;
  @observable error: ?LocalizableError = null;
  @observable transferTx: ?TransferTx = null;
  @observable transferFundsRequest: Request<TransferFundsFunc>
    = new Request<TransferFundsFunc>(this._transferFundsRequest);

  @observable ws: ?WebSocket = null;

  setup(): void {
    this.registerReactions([
      this._enableDisableTransferFunds
    ]);
    const actions = this.actions.ada.daedalusTransfer;
    actions.startTransferFunds.listen(this._startTransferFunds);
    actions.startTransferPaperFunds.listen(this._startTransferPaperFunds);
    actions.startTransferMasterKey.listen(this._startTransferMasterKey);
    actions.setupTransferFundsWithMnemonic.listen(this._setupTransferFundsWithMnemonic);
    actions.setupTransferFundsWithMasterKey.listen(this._setupTransferFundsWithMasterKey);
    actions.backToUninitialized.listen(this._backToUninitialized);
    actions.transferFunds.listen(this._transferFunds);
    actions.cancelTransferFunds.listen(this._reset);
  }

  teardown(): void {
    super.teardown();
    this._reset();
  }

  _startTransferFunds = (): void => {
    this._updateStatus('gettingMnemonics');
  }

  _startTransferPaperFunds = (): void => {
    this._updateStatus('gettingPaperMnemonics');
  }

  _startTransferMasterKey = (): void => {
    this._updateStatus('gettingMasterKey');
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

  /**
   * Call the backend service to fetch all the UTXO then find which belong to the Daedalus wallet.
   * Finally, generate the tx to transfer the wallet to Yoroi
   */
  _setupTransferWebSocket = (
    wallet: RustModule.Wallet.DaedalusWallet,
  ): void => {
    this._updateStatus('restoringAddresses');
    runInAction(() => {
      this.ws = new WebSocket(websocketUrl);
    });
    if (!this.ws) { throw new Error('Invalid WebSocket'); }
    const ws = this.ws; // assert non-null

    ws.addEventListener('open', () => {
      Logger.info('[ws::connected]');
      if (!this.ws) { throw new Error('Invalid WebSocket'); }
      this.ws.send(JSON.stringify({
        msg: MSG_TYPE_RESTORE,
      }));
    });
    /*  TODO: Remove 'any' from event
        There is an open issue with this https://github.com/facebook/flow/issues/3116
    */
    ws.addEventListener('message', async (event: any) => {
      try {
        // Note: we only expect a single message from our WS so we can close it right away.
        // Not closing it right away will cause a WS timeout as we don't keep the connection alive.
        if (!this.ws) { throw new Error('Invalid WebSocket'); }
        this.ws.close(WS_CODE_NORMAL_CLOSURE);

        const data = JSON.parse(event.data);
        Logger.info(`[ws::message] on: ${data.msg}`);
        if (data.msg === MSG_TYPE_RESTORE) {
          this._updateStatus('checkingAddresses');
          const checker = RustModule.Wallet.DaedalusAddressChecker.new(wallet);
          const addressKeys = getAddressesKeys({ checker, fullUtxo: data.addresses });
          this._updateStatus('generatingTx');
          const outputAddr = await getReceiverAddress();
          const transferTx = await generateTransferTx({
            outputAddr,
            addressKeys,
            getUTXOsForAddresses:
              this.stores.substores.ada.stateFetchStore.fetcher.getUTXOsForAddresses,
          });
          runInAction(() => {
            this.transferTx = transferTx;
          });
          this._updateStatus('readyToTransfer');
        }
      } catch (error) {
        Logger.error(`DaedalusTransferStore::_setupTransferWebSocket ${stringifyError(error)}`);
        runInAction(() => {
          this.status = 'error';
          this.error = localizedError(error);
        });
      }
    });

    if (!this.ws) { throw new Error('Invalid WebSocket'); }
    this.ws.addEventListener('close', (event: any) => {
      if (event.code !== WS_CODE_NORMAL_CLOSURE) {
        // if connection was not closed normally, we log this as an error. Otherwise it's an info
        Logger.error(
          `[ws::close] CODE: ${event.code} - REASON: ${event.reason} - was clean? ${event.wasClean}`
        );

        runInAction(() => {
          this.status = 'error';
          this.error = new WebSocketRestoreError();
        });
      } else {
        Logger.info(
          `[ws::close] CODE: ${event.code} - REASON: ${event.reason} - was clean? ${event.wasClean}`
        );
      }
    });
  };

  _setupTransferFundsWithMnemonic = async (payload: { recoveryPhrase: string }): Promise<void> => {
    let { recoveryPhrase: secretWords } = payload;
    if (secretWords.split(' ').length === 27) {
      const [newSecretWords, unscrambledLen] =
        await this.api.ada.unscramblePaperMnemonic({
          mnemonic: secretWords,
          numberOfWords: 27
        });
      if (!newSecretWords || !unscrambledLen) {
        throw new Error('Failed to unscramble paper mnemonics!');
      }
      secretWords = newSecretWords;
    }

    this._setupTransferWebSocket(
      getCryptoDaedalusWalletFromMnemonics(secretWords)
    );
  }

  _setupTransferFundsWithMasterKey = (payload: { masterKey: string }): void => {
    const { masterKey: key } = payload;

    this._setupTransferWebSocket(
      getCryptoDaedalusWalletFromMasterKey(key)
    );
  }

  _backToUninitialized = (): void => {
    this._updateStatus('uninitialized');
  }

  /** Updates the status that we show to the user as transfer progresses */
  @action.bound
  _updateStatus(s: TransferStatus): void {
    this.status = s;
  }

  /** Send a transaction to the backend-service to be broadcast into the network */
  _transferFundsRequest = async (request: {
    signedTx: RustModule.Wallet.SignedTransaction,
  }): Promise<SignedResponse> => (
    this.stores.substores.ada.stateFetchStore.fetcher.sendTx({ signedTx: request.signedTx })
  )

  /** Broadcast the transfer transaction if one exists and proceed to continuation */
  _transferFunds = async (payload: {
    next: Function
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
      Logger.error(`DaedalusTransferStore::transferFunds ${stringifyError(error)}`);
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
    if (this.ws) {
      this.ws.close(WS_CODE_NORMAL_CLOSURE);
      this.ws = null;
    }
  }
}

const messages = defineMessages({
  transferFundsError: {
    id: 'daedalusTransfer.error.transferFundsError',
    defaultMessage: '!!!Unable to transfer funds.',
  },
  noTransferTxError: {
    id: 'daedalusTransfer.error.noTransferTxError',
    defaultMessage: '!!!There is no transfer transaction to send.',
  },
  webSocketRestoreError: {
    id: 'daedalusTransfer.error.webSocketRestoreError',
    defaultMessage: '!!!Error while restoring blockchain addresses',
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

export class WebSocketRestoreError extends LocalizableError {
  constructor() {
    super({
      id: messages.webSocketRestoreError.id,
      defaultMessage: messages.webSocketRestoreError.defaultMessage || '',
      description: messages.webSocketRestoreError.description,
    });
  }
}
