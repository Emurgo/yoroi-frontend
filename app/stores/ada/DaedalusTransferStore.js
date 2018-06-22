// @flow
import { observable } from 'mobx';
import BigNumber from 'bignumber.js';
import Store from '../lib/Store';
import environment from '../../environment';
import Request from '.././lib/LocalizedRequest';
import {
  RandomAddressChecker,
  Wallet
} from 'rust-cardano-crypto';
import type { ConfigType } from '../../../config/config-types';
import { getBalance } from '../../api/ada/adaWallet';
import {
  mapToList
} from '../../api/ada/lib/utils';
import { getCryptoDaedalusWalletFromMnemonics } from '../../api/ada/lib/crypto-wallet';
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

declare var CONFIG: ConfigType;

const websocketUrl = CONFIG.network.websocketUrl;
const MSG_TYPE_RESTORE = 'RESTORE';

// FIXME: Define a place for these types
export type TransferStatus =
    'uninitialized'
  | 'restoringAddresses'
  | 'checkingAddresses'
  | 'generatingTx'
  | 'aboutToSend'

export type TransferTx = {
  recoveredBalance: BigNumber,
  fee: BigNumber,
  cbor_encoded_tx: Array<number>,
  senders: Array<string>,
  receiver: string
}

// FIXME: Define a place for these errors
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
  @observable ws: any = null;
  @observable transferFundsRequest: Request<any> = new Request(this._transferFundsRequest);

  setup() {
    console.log(`[DaedalusTransferStore::setup] status: ${this.status}`);
    const actions = this.actions.ada.daedalusTransfer;
    actions.restoreAddresses.listen(this._restoreAddresses);
    actions.getAddressesWithFunds.listen(this._getAddressesWithFunds);
    actions.generateTransferTx.listen(this._generateTransferTx);
    actions.transferFunds.listen(this._transferFunds);
  }

  teardown() {
    super.teardown();
    this.status = 'uninitialized';
    console.log(`[DaedalusTransferStore::teardown] ${this.status}`);
    this.transferFundsRequest.reset();
    if (this.ws) {
      console.log('[DaedalusTransferStore::teardown] Closing open ws connection');
      this.ws.close();
      this.ws = null;
    }
  }

  /* TODO: Handle WS connection errors */
  _restoreAddresses = (payload: { recoveryPhrase: string }) => {
    this.status = 'restoringAddresses';
    console.log(`[DaedalusTransferStore::_restoreAddresses] status: ${this.status}`);
    this.ws = new WebSocket(websocketUrl);
    this.ws.addEventListener('open', () => {
      console.log('[ws::connected]');
      this.ws.send(_toMessage({
        msg: MSG_TYPE_RESTORE,
      }));
    });
    /*  FIXME: Remove 'any' from event
        There is an open issue with this https://github.com/facebook/flow/issues/3116
    */
    this.ws.addEventListener('message', (event: any) => {
      const data = _fromMessage(event.data);
      console.log(`[ws::message] on: ${data.msg}`);
      switch (data.msg) {
        case MSG_TYPE_RESTORE:
          this.actions.ada.daedalusTransfer.getAddressesWithFunds
          .trigger({
            secretWords: payload.recoveryPhrase,
            allAddresses: data.addresses
          });
          break;
        default:
          break;
      }
    });
  }

  // FIXME: Handle rust errors
  _getAddressesWithFunds = (payload: {
    secretWords: string,
    allAddresses: Array<string>
  }) => {
    this.status = 'checkingAddresses';
    console.log(`[DaedalusTransferStore::_getAddressesWithFunds] status: ${this.status}`);
    const { secretWords, allAddresses } = payload;
    const checker = RandomAddressChecker.newCheckerFromMnemonics(secretWords).result;
    const addressesWithFunds = RandomAddressChecker.checkAddresses(checker, allAddresses).result;
    console.log(
      '[DaedalusTransferStore::_getAddressesWithFunds] Daedalues wallet addresses:',
      addressesWithFunds
    );
    this.actions.ada.daedalusTransfer.generateTransferTx
      .trigger({ addressesWithFunds, secretWords });
  }

  // FIXME: Handle rust and backend errors
  _generateTransferTx = async (payload: {
    addressesWithFunds: CryptoDaedalusAddressRecovered,
    secretWords: string
  }) => {
    this.status = 'generatingTx';
    console.log(`[DaedalusTransferStore::_generateTransferTx] status: ${this.status}`, payload);
    const { addressesWithFunds, secretWords } = payload;

    const senders = addressesWithFunds.map(a => a.address);
    const senderUtxos = await getAllUTXOsForAddresses(senders);
    const recoveredBalance = await getBalance(senders);

    const wallet = getCryptoDaedalusWalletFromMnemonics(secretWords);
    const inputs = _getInputs(senderUtxos, addressesWithFunds);
    const output = _getReceiverAddress();

    const tx = Wallet.move(wallet, inputs, output).result;

    this.transferTx = {
      recoveredBalance,
      fee: new BigNumber(tx.fee),
      cbor_encoded_tx: tx.cbor_encoded_tx,
      senders,
      receiver: output
    };
    this.status = 'aboutToSend';
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
    await this.transferFundsRequest.execute({ cborEncodedTx: this.transferTx.cbor_encoded_tx });
    next();
    // FIXME: We should reset all the store state in a more elegant/correct way
    this.teardown();
  }
}

function _fromMessage(data: mixed) {
  if (typeof data !== 'string') {
    return {};
  }
  return JSON.parse(data);
}

const _toMessage = JSON.stringify;

function _getReceiverAddress(): string {
  const addressesMap = getAdaAddressesMap();
  const addresses = mapToList(addressesMap);
  return filterAdaAddressesByType(addresses, 'External')[0].cadId;
}

function _getInputs(utxos, addressesWithFunds) {
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
