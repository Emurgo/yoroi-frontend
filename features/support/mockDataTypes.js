// @flow

import type { AdaAddress, AdaTransaction, AdaWallet, Transaction, UTXO } from '../../app/api/ada/adaTypes';
import type { CryptoAccount } from '../../app/api/ada/lib/storage/adaLocalStorage';

export type InitialData = {
    addressesStartingWith: string,
    totalAddresses: number,
    txHashesStartingWith?: string,
    txsNumber?: number
};

export type WalletInitialData = {
    [key: string]: InitialData
};

export type MockWalletTx = {
    address: string,
    tx: Transaction
};

export type MockTxSet = {
    [key: string]: Array<MockWalletTx>
};

export type LovefieldTxSet = {
    [key: string]: Array<AdaTransaction>
};

export type LovefieldShownWalletTx = {
    txType: string,
    txAmount: string,
    txTimeTitle: string,
    txTime: string,
    txStatus: string,
    txFee: string,
    txFrom: Array<string>,
    txTo: Array<string>,
    txConfirmations: string,
    txId: string
};

export type LovefieldShownTxSet = {
    [key: string]: Array<LovefieldShownWalletTx>
}

export type FeatureData = {
    walletInitialData?: WalletInitialData,
    usedAddresses?: Array<string>,
    utxos?: Array<UTXO>,
    adaAddresses?: Array<AdaAddress>,
    masterKey?: string,
    password?: string,
    wallet?: AdaWallet,
    cryptoAccount?: CryptoAccount,
    txs?: MockTxSet,
    currentDateExample?: string,
    lovefieldStoredTxs?: LovefieldTxSet,
    lovefieldShownTxs?: LovefieldShownTxSet,
    daedalusAddressesWithFunds?: Array<string>,
}

export type MockData = {
    [key: string]: FeatureData
}
