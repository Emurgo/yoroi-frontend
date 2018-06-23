// @flow
import { observable, action, runInAction } from 'mobx';
import BigNumber from 'bignumber.js';
import {
  RandomAddressChecker,
  Wallet
} from 'rust-cardano-crypto';
import { LOVELACES_PER_ADA } from '../../config/numbersConfig';
import Store from '../lib/Store';
import Request from '.././lib/LocalizedRequest';
import type { ConfigType } from '../../../config/config-types';
import { getBalance } from '../../api/ada/adaWallet';
import {
  mapToList
} from '../../api/ada/lib/utils';
import {
  getCryptoDaedalusWalletFromMnemonics
} from '../../api/ada/lib/crypto-wallet';
import {
  getAdaAddressesMap,
  filterAdaAddressesByType
} from '../../api/ada/adaAddress';
import {
  getAllUTXOsForAddresses
} from '../../api/ada/adaTransactions/adaNewTransactions';
import {
  sendTx
} from '../../api/ada/lib/icarus-backend-api';
import LocalizableError from '../../i18n/LocalizableError';
import type { 
  TransferStatus,
  TransferTx
} from '../../types/daedalusTransferTypes';
import type {
  UTXO
} from '../../api/ada/adaTypes';

declare var CONFIG: ConfigType;
const websocketUrl = CONFIG.network.websocketUrl;
const MSG_TYPE_RESTORE = 'RESTORE';

// FIXME: Define a place for these type of errors
export class NoTransferTxError extends LocalizableError {
  constructor() {
    super({
      id: 'daedalusTransfer.error.NoTransferTxError',
      defaultMessage: '!!! There is no transfer transaction to send',
    });
  }
}

export default class DaedalusTransferStore extends Store {

  @observable status: TransferStatus = 'uninitialized';
  @observable transferTx: ?TransferTx = null;
  @observable transferFundsRequest: Request<any> = new Request(this._transferFundsRequest);
  @observable ws: any = null;

  setup() {
    const actions = this.actions.ada.daedalusTransfer;
    actions.setupTransferFunds.listen(this._setupTransferFunds);
    actions.transferFunds.listen(this._transferFunds);
    actions.cancelTransferFunds.listen(this._reset);
  }

  teardown() {
    super.teardown();
    this._reset();
  }

  /* TODO: Handle WS connection errors */
  _setupTransferFunds = (payload: { recoveryPhrase: string }) => {
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
      const data = JSON.parse(event.data);
      console.log(`[ws::message] on: ${data.msg}`);
      if (data.msg === MSG_TYPE_RESTORE) {
        this._updateStatus('checkingAddresses');
        const addressesWithFunds = this._getAddressesWithFunds({
          secretWords,
          addresses: data.addresses
        });
        this._updateStatus('generatingTx');
        const transferTx = await this._generateTransferTx({
          secretWords,
          addressesWithFunds
        });
        runInAction(() => {
          this.transferTx = transferTx;
        });
        this._updateStatus('readyToTransfer');
      }
    });
  }

  @action.bound
  _updateStatus(s: TransferStatus) {
    this.status = s;
  }

  // FIXME: Handle rust errors
  _getAddressesWithFunds = (payload: {
    secretWords: string,
    addresses: Array<string>
  }): Array<CryptoDaedalusAddressRestored> => {
    const { secretWords, addresses } = payload;
    const checker =
      RandomAddressChecker.newCheckerFromMnemonics(secretWords).result;
    const addressesWithFunds =
      RandomAddressChecker.checkAddresses(checker, addresses).result;
    return addressesWithFunds;
  }

  // FIXME: Handle rust and backend errors
  _generateTransferTx = async (payload: {
    secretWords: string,
    addressesWithFunds: Array<CryptoDaedalusAddressRestored>
  }): Promise<TransferTx> => {
    const { secretWords, addressesWithFunds } = payload;

    const senders = addressesWithFunds.map(a => a.address);
    const senderUtxos = await getAllUTXOsForAddresses(senders);
    const recoveredBalance = await getBalance(senders);

    const wallet = getCryptoDaedalusWalletFromMnemonics(secretWords);
    const inputs = this._getInputs(senderUtxos, addressesWithFunds);
    const output = this._getReceiverAddress();

    const tx = Wallet.move(wallet, inputs, output).result;
    return {
      recoveredBalance: recoveredBalance.dividedBy(LOVELACES_PER_ADA),
      fee: new BigNumber(tx.fee).dividedBy(LOVELACES_PER_ADA),
      cborEncodedTx: tx.cbor_encoded_tx,
      senders,
      receiver: output
    };
  }

  _getReceiverAddress(): string {
    const addressesMap = getAdaAddressesMap();
    const addresses = mapToList(addressesMap);
    return filterAdaAddressesByType(addresses, 'External')[0].cadId;
  }

  _getInputs(
    utxos: Array<UTXO>,
    addressesWithFunds: Array<CryptoDaedalusAddressRestored>
  ): Array<TxDaedalusInput> {
    const addressingByAddress = {};
    addressesWithFunds.forEach(a => {
      addressingByAddress[a.address] = a.addressing;
    });
    return utxos.map(utxo => {
      return {
        ptr: {
          index: utxo.tx_index,
          id: utxo.tx_hash
        },
        value: utxo.amount,
        addressing: addressingByAddress[utxo.receiver]
      };
    });
  }

  _transferFundsRequest = async (payload: {
    cborEncodedTx: Array<number>
  }) => {
    const { cborEncodedTx } = payload;
    const signedTx = Buffer.from(cborEncodedTx).toString('base64');
    return sendTx(signedTx);
  }

  // FIXME: Handle backend errors
  _transferFunds = async (payload: {
    next: Function
  }) => {
    const { next } = payload;
    if (!this.transferTx) {
      throw new NoTransferTxError();
    }
    /* await this.transferFundsRequest.execute({
      cborEncodedTx: this.transferTx.cborEncodedTx
    });*/
    next();
    this._reset();
  }

  @action.bound
  _reset() {
    this.status = 'uninitialized';
    this.transferTx = null;
    this.transferFundsRequest.reset();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
