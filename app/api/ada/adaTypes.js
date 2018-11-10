// @flow

// Types that come from either the importer (possibly replicated in backend-service)
import BigNumber from 'bignumber.js';

// ========= Response Types =========

// Based on CWalletAssurance from the Importer
export type AdaAssurance = 'CWANormal' | 'CWAStrict';

// Based on CPtxCondition from the Importer
export type AdaTransactionCondition = 'CPtxApplying' | 'CPtxInBlocks' | 'CPtxWontApply' | 'CPtxNotTracked';

// Based on TxState from the Importer
export type AdaTxsState = 'Successful' | 'Failed' | 'Pending';

export type AdaSyncProgressResponse = {
  _spLocalCD: {
    getChainDifficulty: {
      getBlockCount: number,
    }
  },
  _spNetworkCD: {
    getChainDifficulty: {
      getBlockCount: number,
    }
  },
  _spPeers: number,
};

export type AdaWalletInitData = {
  cwInitMeta: {
    cwName: string,
    cwAssurance: AdaAssurance,
    cwUnit: number,
  },
  cwBackupPhrase: {
    bpToList: string,
  }
};

export type AdaAmount = {
  getCCoin: BigNumber,
};
export type AdaTransactionTag = 'CTIn' | 'CTOut';

export type AdaAddress = {
  cadAmount: AdaAmount,
  cadId: string,
  cadIsUsed: boolean,
  account: number,
  change: number,
  index: number
};

export type AdaAddresses = Array<AdaAddress>;

export type AdaAccount = {
  caAddresses: AdaAddresses,
  caAmount: AdaAmount,
  caId: string,
  caMeta: {
    caName: string,
  },
};

export type AdaAccounts = Array<AdaAccount>;

export type Transaction = {
  hash: string,
  inputs_address: Array<string>,
  inputs_amount: Array<string>, // bingint[]
  outputs_address: Array<string>,
  outputs_amount: Array<string>, // bingint[]
  block_num: ?string, // null if transaction failed
  time: string, // timestamp with timezone
  best_block_num: string, // bigint
  last_update: string, // timestamp with timezone
  tx_state: AdaTxsState
};

export type AdaTransaction = {
  ctAmount: AdaAmount,
  ctBlockNumber: number,
  ctId: string,
  ctInputs: AdaTransactionInputOutput,
  ctIsOutgoing: boolean,
  ctMeta: {
    ctmDate: Date,
    ctmDescription: ?string,
    ctmTitle: ?string,
    ctmUpdate: Date
  },
  ctOutputs: AdaTransactionInputOutput,
  ctCondition: AdaTransactionCondition,
};

export type AdaTransactions = [
  Array<AdaTransaction>,
  number, // length
];

export type AdaTransactionInputOutput = [
  [string, // output address
   AdaAmount],
];

export type AdaTransactionFee = AdaAmount;

export type AdaWallet = {
  cwAccountsNumber: number,
  cwAmount: AdaAmount,
  cwId: string,
  cwMeta: {
    cwAssurance: AdaAssurance,
    cwName: string,
    cwUnit: number,
  },
  cwPassphraseLU: Date,
};

export type AdaWallets = Array<AdaWallet>;
export type AdaLocalTimeDifference = number;

export type AdaWalletParams = {
  walletPassword: string,
  walletInitData: AdaWalletInitData
};

export type UpdateAdaWalletParams = {
  walletMeta: {
    cwName: string,
    cwAssurance: AdaAssurance,
    cwUnit: number,
  }
};

export type UTXO = {
  utxo_id: string,
  tx_hash: string,
  tx_index: number,
  receiver: string,
  amount: string
}
