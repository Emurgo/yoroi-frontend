// @flow
import { observable, action, computed, runInAction, untracked } from 'mobx';
import Store from '../lib/Store';
import environment from '../../environment';
import {
  RandomAddressChecker
} from 'rust-cardano-crypto';
import type { ConfigType } from '../../../config/config-types';

declare var CONFIG: ConfigType;

const websocketUrl = CONFIG.network.websocketUrl;
const MSG_TYPE_RESTORE = 'RESTORE';

export type TransferStatus =
    'uninitialized'
  | 'restoringAddresses'
  | 'checkingAddresses'
  | 'generatingTx'
  | 'aboutToSend'

export default class DaedalusTransferStore extends Store {

  @observable status: TransferStatus = 'uninitialized';
  @observable ws: any = null;

  setup() {
    console.log(`[DaedalusTransferStore::setup] status: ${this.status}`);
    const actions = this.actions.ada.daedalusTransfer;
    actions.restoreAddresses.listen(this._restoreAddresses);
    actions.getAddressesWithFunds.listen(this._getAddressesWithFunds);
    actions.generateTransferTx.listen(this._generateTransferTx);
  }

  teardown() {
    super.teardown();
    this.status = 'uninitialized';
    console.log(`[DaedalusTransferStore::teardown] ${this.status}`);
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
    this.actions.ada.daedalusTransfer.generateTransferTx.trigger({ addressesWithFunds });
  }

  _generateTransferTx = (payload: {
    addressesWithFunds: Array<string>
  }) => {
    this.status = 'generatingTx';
    console.log(`[DaedalusTransferStore::_generateTransferTx] status: ${this.status}`, payload);
    /*  TODO: Using the addresses with funds, the Icarus CryptoWallet,
        and Rust new functionality, creates the transfer Tx ("store" the data
        using DaedalusTransferStore state)
    */
  }
}

function _fromMessage(data: mixed) {
  if (typeof data !== 'string') {
    return {};
  }
  return JSON.parse(data);
}

const _toMessage = JSON.stringify;
