// @flow
import BigNumber from 'bignumber.js';

/*
 * This file gives the flow equivalents of the the Haskell types given in the wallet API at
 * https://github.com/input-output-hk/cardano-sl/blob/master/wallet/src/Pos/Wallet/Web/ClientTypes/Types.hs
 * TODO: Update the link once IOHK migrates away from the Cardano-SL repo
*/

// ========= Response Types =========
export type AdaAssurance = 'CWANormal' | 'CWAStrict';
export type AdaTransactionCondition = 'CPtxApplying' | 'CPtxInBlocks' | 'CPtxWontApply' | 'CPtxNotTracked';
export type AdaWalletType = 'CWTWeb' | 'CWTHardware';

export type AdaWalletHardwareInfo = {
  vendor : string,
  model: string,
  deviceId: string,
  label: string,
  majorVersion: number,
  minorVersion: number,
  patchVersion: number,
  language: string,
  publicMasterKey: string,
};

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

export type AdaHardwareWalletInitData = {
  cwInitMeta: {
    cwName: string,
    cwAssurance: AdaAssurance,
    cwUnit: number,
  },
  cwHardwareInfo: AdaWalletHardwareInfo,
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
  cwPassphraseLU?: Date,
  cwType: AdaWalletType,
  cwHardwareInfo?: AdaWalletHardwareInfo,
};

export type AdaWallets = Array<AdaWallet>;
export type AdaLocalTimeDifference = number;

export type AdaWalletParams = {
  walletPassword: string,
  walletInitData: AdaWalletInitData
};

export type AdaHardwareWalletParams = {
  walletInitData: AdaHardwareWalletInitData
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
