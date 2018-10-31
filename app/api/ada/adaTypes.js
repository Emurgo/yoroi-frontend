// @flow
import BigNumber from 'bignumber.js';

// ========= Response Types =========
export type AdaAssurance = 'CWANormal' | 'CWAStrict';
export type AdaTransactionCondition = 'CPtxApplying' | 'CPtxInBlocks' | 'CPtxWontApply' | 'CPtxNotTracked';
export type AdaWalletType = 'CWTWeb' | 'CWTHardwareBacked';

export type AdaHardwareWalletVendorInfo = {
  vendor : string,
  model: string,
  deviceId: string,
  lable: string,
  majorVersion: string,
  minorVersion: string,
  patchVersion: string,
  language: string
}

export type AdaWalletTypeInfo = {
  type: AdaWalletType,
  vendorInfo: ?AdaHardwareWalletVendorInfo
}

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
  inputs_amount: Array<string>,
  outputs_address: Array<string>,
  outputs_amount: Array<string>,
  block_num: string,
  time: string,
  succeeded: boolean,
  best_block_num: string,
  last_update: string,
  tx_state: string
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
  number,
];

export type AdaTransactionInputOutput = [
  [string, AdaAmount],
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

export type AdaHardwareWalletParams = {
  publicKey: string,
  walletInitData: AdaWalletInitData,
  walletTypeInfo: AdaWalletTypeInfo
}

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
