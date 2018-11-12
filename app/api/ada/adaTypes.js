// @flow

/*
 * Types that come from either the importer (possibly replicated in backend-service)
 * Note: These types from come from the v0 api for Cardano-SL
 * The v0 API was deprecated and replaced by v1 which uses different fields and different types
 * Therefore we differ from the v0 API in types to match the types used in the v1 API
 * However the data structures themselves remain those of the v0 apI
 *
 * To see how the API changed, you can refer to a programmatic translation between the APIs
 * That was deleted in a process called "The Great Cleanup"
 * https://github.com/input-output-hk/cardano-sl/pull/3700
*/

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

/** Data passed from user when creating / restoring a wallet */
export type AdaWalletInitData = {
  cwInitMeta: AdaWalletMetaParams,
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
  ctInputs: Array<AdaTransactionInputOutput>,
  ctIsOutgoing: boolean,
  ctMeta: {
    ctmDate: Date,
    ctmDescription: ?string,
    ctmTitle: ?string,
    ctmUpdate: Date
  },
  ctOutputs: Array<AdaTransactionInputOutput>,
  ctCondition: AdaTransactionCondition,
};

export type AdaTransactions = [
  Array<AdaTransaction>,
  number, // length
];

export type AdaTransactionInputOutput = [
  string, // output address
  AdaAmount,
];

export type AdaTransactionFee = AdaAmount;

export type AdaWallet = {
  cwAccountsNumber: number,
  cwAmount: AdaAmount,
  cwId: string,
  cwMeta: AdaWalletMetaParams,
  cwPassphraseLU: Date,
};

export type AdaWallets = Array<AdaWallet>;
export type AdaLocalTimeDifference = number;

export type AdaWalletParams = {
  walletPassword: string,
  walletInitData: AdaWalletInitData
};

export type AdaWalletMetaParams = {
  cwName: string,
  cwAssurance: AdaAssurance,
  // This was never used by supposed to represent 0 = (bitcoin, ada); 1 = (satoshi, lovelace)
  cwUnit: number
};

export type UTXO = {
  utxo_id: string,
  tx_hash: string,
  tx_index: number,
  receiver: string,
  amount: string
}
