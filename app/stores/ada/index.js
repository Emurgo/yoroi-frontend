import { BigNumber } from 'bignumber.js';
import TransactionsStore from './AdaTransactionsStore';

const ada = {
  wallets: {
    active: {
      amount: new BigNumber(1000)
    },
    assurance: 'NORMAL'
  },
  transactions: new TransactionsStore()
};

export default ada;
