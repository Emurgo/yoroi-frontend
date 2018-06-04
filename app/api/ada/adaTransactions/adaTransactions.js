// @flow
import {
  getFromStorage,
} from '../lib/utils';

const TX_KEY = 'TXS'; // single txs list atm

export function getAdaTransactions() {
  return getFromStorage(TX_KEY) || [];
}
