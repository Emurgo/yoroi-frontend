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
import {
  sendTx
} from '../../api/ada/lib/yoroi-backend-api';
import LocalizableError, {
  localizedError
} from '../../i18n/LocalizableError';
import type {
  TransferStatus,
  TransferTx,
  TxValidation
} from '../../types/daedalusTransferTypes';
import {
  getAddressesWithFunds,
  generateTransferTx
} from '../../api/ada/daedalusTransfer';
import environment from '../../environment';

declare var CONFIG: ConfigType;
const websocketUrl = CONFIG.network.websocketUrl;
const MSG_TYPE_RESTORE = 'RESTORE';
const WS_CODE_NORMAL_CLOSURE = 1000;

export default class DaedalusTransferStore extends Store {

  @observable status: TransferStatus = 'uninitialized';
  @observable disableTransferFunds: boolean = true;
  @observable error: ?LocalizableError = null;
  @observable transferTx: ?TransferTx = null;
  @observable transferFundsRequest: Request<Array<void>> = new Request(this._transferFundsRequest);
  @observable ws: any = null;

  setup(): void {
    this.registerReactions([
      this._enableDisableTransferFunds
    ]);
    const actions = this.actions.ada.daedalusTransfer;
    actions.startTransferFunds.listen(this._startTransferFunds);
    actions.setupTransferFunds.listen(this._setupTransferFunds);
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

  /** @Attention:
      You should check wallets state outside of the runInAction,
      because this method run as a reaction.
  */
  _enableDisableTransferFunds = (): void => {
    const { wallets } = this.stores.substores[environment.API];
    // User must first make a Yoroi wallet before being able to migrate a Daedalus wallet
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

  /** Call the backend service to fetch all the UTXO then find which belong to the Daedalus wallet.
   * Finally, generate the tx to migrate the wallet to Yoroi
   */
  _setupTransferFunds = (payload: { recoveryPhrase: string }): void => {
    const { recoveryPhrase: secretWords } = payload;
    this._updateStatus('restoringAddresses');
    this.ws = new WebSocket(websocketUrl);
    this.ws.addEventListener('open', () => {
      Logger.info('[ws::connected]');
      this.ws.send(JSON.stringify({
        msg: MSG_TYPE_RESTORE,
      }));
    });
    /*  TODO: Remove 'any' from event
        There is an open issue with this https://github.com/facebook/flow/issues/3116
    */
    this.ws.addEventListener('message', async (event: any) => {
      try {
        // Note: we only expect a single message from our WS so we can close it right away.
        // Not closing it right away will cause a WS timeout as we don't keep the connection alive.
        this.ws.close(WS_CODE_NORMAL_CLOSURE);

        const data = JSON.parse(event.data);
        Logger.info(`[ws::message] on: ${data.msg}`);
        if (data.msg === MSG_TYPE_RESTORE) {
          this._updateStatus('checkingAddresses');
          const addressesWithFunds = getAddressesWithFunds({
            secretWords,
            fullUtxo: data.addresses
          });
          this._updateStatus('generatingTx');
          const transferTx = await generateTransferTx({
            secretWords,
            addressesWithFunds
          });
          runInAction(() => {
            this.transferTx = transferTx;
          });
          this._updateStatus('readyToTransfer');
        }
      } catch (error) {
        Logger.error(`DaedalusTransferStore::setupTransferFunds ${stringifyError(error)}`);
        runInAction(() => {
          this.status = 'error';
          this.error = localizedError(error);
        });
      }
    });

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
  }

  _backToUninitialized = (): void => {
    this._updateStatus('uninitialized');
  }

  /** Updates the status that we show to the user as migration progresses */
  @action.bound
  _updateStatus(s: TransferStatus): void {
    this.status = s;
  }

  /** Send a transaction to the backend-service to be broadcast into the network */
  _transferFundsRequest = async (payload: {
    cborEncodedTx: Array<number>,
    txValidation: TxValidation
  }): Promise<Array<void>> => {
    const { cborEncodedTx, txValidation } = payload;
    const signedTx = Buffer.from(cborEncodedTx).toString('base64');
    return sendTx({ signedTx, txValidation });
  }

  /** Broadcast the migration transaction if one exists and proceed to continuation */
  _transferFunds = async (payload: {
    next: Function
  }): Promise<void> => {
    try {
      const { next } = payload;
      if (!this.transferTx) {
        throw new NoTransferTxError();
      }
      await this.transferFundsRequest.execute({
        cborEncodedTx: this.transferTx.cborEncodedTx,
        txValidation: this.transferTx.txValidation
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
    description: '"Unable to transfer funds." error message',
  },
  noTransferTxError: {
    id: 'daedalusTransfer.error.noTransferTxError',
    defaultMessage: '!!!There is no transfer transaction to send.',
    description: '"There is no transfer transaction to send." error message'
  },
  webSocketRestoreError: {
    id: 'daedalusTransfer.error.webSocketRestoreError',
    defaultMessage: '!!!Error while restoring blockchain addresses',
    description: 'Any reason why the websocket transferring could failed'
  }
});

export class TransferFundsError extends LocalizableError {
  constructor() {
    super({
      id: messages.transferFundsError.id,
      defaultMessage: messages.transferFundsError.defaultMessage,
      description: messages.transferFundsError.description,
    });
  }
}

export class NoTransferTxError extends LocalizableError {
  constructor() {
    super({
      id: messages.noTransferTxError.id,
      defaultMessage: messages.noTransferTxError.defaultMessage,
      description: messages.noTransferTxError.description,
    });
  }
}

export class WebSocketRestoreError extends LocalizableError {
  constructor() {
    super({
      id: messages.webSocketRestoreError.id,
      defaultMessage: messages.webSocketRestoreError.defaultMessage,
      description: messages.webSocketRestoreError.description,
    });
  }
}
