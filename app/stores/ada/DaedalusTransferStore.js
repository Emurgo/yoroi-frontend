// @flow
import { observable, action, runInAction } from 'mobx';
import {
  Logger,
  stringifyError
} from '../../utils/logging';
import Store from '../lib/Store';
import Request from '.././lib/LocalizedRequest';
import type { ConfigType } from '../../../config/config-types';
import {
  sendTx
} from '../../api/ada/lib/icarus-backend-api';
import LocalizableError, {
  localizedError
} from '../../i18n/LocalizableError';
import type {
  TransferStatus,
  TransferTx
} from '../../types/daedalusTransferTypes';
import {
  getAddressesWithFunds,
  generateTransferTx
} from '../../api/ada/daedalusTransfer';
import environment from '../../environment';

declare var CONFIG: ConfigType;
const websocketUrl = CONFIG.network.websocketUrl;
const MSG_TYPE_RESTORE = 'RESTORE';

export default class DaedalusTransferStore extends Store {

  @observable status: TransferStatus = 'uninitialized';
  @observable disableTransferFunds: boolean = true;
  @observable error: ?LocalizableError = null;
  @observable transferTx: ?TransferTx = null;
  @observable transferFundsRequest: Request<any> = new Request(this._transferFundsRequest);
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

  _enableDisableTransferFunds = (): void => {
    const { wallets } = this.stores && this.stores[environment.API];
    if (wallets && wallets.hasActiveWallet) {
      runInAction(() => {
        this.disableTransferFunds = false;
      });
    } else {
      runInAction(() => {
        this.disableTransferFunds = true;
      });
    }
  }

  /* TODO: Handle WS connection errors */
  _setupTransferFunds = (payload: { recoveryPhrase: string }): void => {
    const { recoveryPhrase: secretWords } = payload;
    this.status = 'restoringAddresses';
    this.ws = new WebSocket(websocketUrl);
    this.ws.addEventListener('open', () => {
      console.log('[ws::connected]');
      this.ws.send(JSON.stringify({
        msg: MSG_TYPE_RESTORE,
      }));
    });
    /*  FIXME: Remove 'any' from event
        There is an open issue with this https://github.com/facebook/flow/issues/3116
    */
    this.ws.addEventListener('message', async (event: any) => {
      try {
        const data = JSON.parse(event.data);
        console.log(`[ws::message] on: ${data.msg}`);
        if (data.msg === MSG_TYPE_RESTORE) {
          this._updateStatus('checkingAddresses');
          const addressesWithFunds = getAddressesWithFunds({
            secretWords,
            addresses: data.addresses
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
  }

  _backToUninitialized = (): void => {
    this._updateStatus('uninitialized');
  }

  @action.bound
  _updateStatus(s: TransferStatus): void {
    this.status = s;
  }

  _transferFundsRequest = async (payload: {
    cborEncodedTx: Array<number>
  }): Promise<any> => {
    const { cborEncodedTx } = payload;
    const signedTx = Buffer.from(cborEncodedTx).toString('base64');
    return sendTx(signedTx);
  }

  _transferFunds = async (payload: {
    next: Function
  }): Promise<void> => {
    try {
      const { next } = payload;
      if (!this.transferTx) {
        throw new NoTransferTxError();
      }
      await this.transferFundsRequest.execute({
        cborEncodedTx: this.transferTx.cborEncodedTx
      });
      next();
      this._reset();
    } catch (error) {
      Logger.error(`DaedalusTransferStore::transferFunds ${stringifyError(error)}`);
      runInAction(() => {
        this.error = localizedError(new TransferFundsError());
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
      this.ws.close();
      this.ws = null;
    }
  }
}

// FIXME: Define a place for these type of errors
export class TransferFundsError extends LocalizableError {
  constructor() {
    super({
      id: 'daedalusTransfer.error.transferFundsError',
      defaultMessage: '!!!Unable to transfer funds.',
      description: '"Unable to transfer funds." error message',
    });
  }
}

export class NoTransferTxError extends LocalizableError {
  constructor() {
    super({
      id: 'daedalusTransfer.error.noTransferTxError',
      defaultMessage: '!!!There is no transfer transaction to send.',
      description: '"There is no transfer transaction to send." error message'
    });
  }
}
