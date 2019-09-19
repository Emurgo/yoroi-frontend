// @flow

/*
 * Types that come primarily but not only from the importer
 * Note: These types from come from the v0 api for Cardano-SL
 * The v0 API was deprecated and replaced by v1 which uses different fields and different types
 * Therefore we differ from the v0 API in types to match the types used in the v1 API
 * However the data structures themselves remain those of the v0 apI
 *
 * To see how the API changed, you can refer to a programmatic translation between the APIs
 * That was deleted in a process called "The Great Cleanup"
 * https://github.com/input-output-hk/cardano-sl/pull/3700
*/

import type { AdaAddressMap } from './lib/storage/adaAddress';
import { RustModule } from './lib/cardanoCrypto/rustLoader';

/*
 * This file gives the flow equivalents of the the Haskell types given in the wallet API at
 * https://github.com/input-output-hk/cardano-sl/blob/master/wallet/src/Pos/Wallet/Web/ClientTypes/Types.hs
 * TODO: https://github.com/Emurgo/yoroi-frontend/issues/116
*/

// ========= Response Types =========

// Based on CWalletAssurance from the Importer
export type AdaAssurance = 'CWANormal' | 'CWAStrict';

// Based on CPtxCondition from the Importer
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

// Based on TxState from the Importer
export type AdaTxsState = 'Successful' | 'Failed' | 'Pending';

/** Data passed from user when creating / restoring a wallet */
export type AdaWalletInitData = {
  cwInitMeta: AdaWalletMetaParams,
  cwBackupPhrase: {
    bpToList: string,
  }
};

export type AdaHardwareWalletInitData = {
  cwInitMeta: AdaWalletMetaParams,
  cwHardwareInfo: AdaWalletHardwareInfo,
};

export type AdaAmount = {
  getCCoin: string,
};
export type AdaTransactionTag = 'CTIn' | 'CTOut';

export type AddressingInfo = {
  account: number,
  change: number,
  index: number,
};

export type AdaAddress = {
  /**
   * TODO: misleading as the value inside DB is always stale
   * Is is only updated in-memory after DB fetch
   * Is is, however, up-to-date in localstorage.
  */
  cadAmount: AdaAmount,
  cadId: string,
  /**
   * TODO: misleading as the value inside DB is always stale
   * Is is only updated in-memory after DB fetch
  */
  cadIsUsed: boolean,
} & AddressingInfo;

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

export type AdaTransactionInputOutput = [
  string, // output address
  AdaAmount,
];

export type UnsignedTxFromUtxoResponse = {
  senderUtxos: Array<UTXO>,
  txBuilder: RustModule.Wallet.TransactionBuilder,
  changeAddr: Array<TxOutType & AddressingInfo>,
};
export type UnsignedTxResponse = UnsignedTxFromUtxoResponse & {
  addressesMap: AdaAddressMap,
};
export type BaseSignRequest = {
  addressesMap: AdaAddressMap,
  changeAddr: Array<TxOutType & AddressingInfo>,
  senderUtxos: Array<UTXO>,
  unsignedTx: RustModule.Wallet.Transaction,
}

export type AdaWallet = {
  cwAmount: AdaAmount,
  cwId: string,
  cwMeta: AdaWalletMetaParams,
  cwType: AdaWalletType,
  cwPassphraseLU?: Date,
  cwHardwareInfo?: AdaWalletHardwareInfo,
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
  // This was never used but is supposed to represent 0 = (bitcoin, ada); 1 = (satoshi, lovelace)
  cwUnit: number
};

export type AdaHardwareWalletParams = {
  walletInitData: AdaHardwareWalletInitData
}

/* Backend service Postgres data types */

export type Transaction = {
  hash: string,
  inputs_address: Array<string>,
  inputs_amount: Array<string>, // bigint[]
  outputs_address: Array<string>,
  outputs_amount: Array<string>, // bigint[]
  block_num: ?string, // null if transaction pending/failed
  time: string, // timestamp with timezone
  best_block_num: string, // bigint
  last_update: string, // timestamp with timezone
  tx_state: AdaTxsState
};

export type UTXO = {
  utxo_id: string, // concat tx_hash and tx_index
  tx_hash: string,
  tx_index: number,
  receiver: string,
  amount: string
}

export type PDF = {
  getPage: Function
}

export type AddressType = "External" | "Internal";
