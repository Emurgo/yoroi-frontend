// @flow

import mockData from './mockData.json';

import type { AdaAddress } from '../../app/api/ada/adaTypes';
import type {
  InitialData,
  LovefieldShownWalletTx,
  FeatureData,
  MockWalletTx
} from './mockDataTypes';

let builtMockData: FeatureData;

export function getFeatureData(): ?FeatureData {
  return builtMockData;
}

export function buildFeatureData(feature: string): void {
  builtMockData = Object.assign({}, mockData.default, mockData[feature]);
}

export function getFakeAddresses(
  totalAddresses: number,
  addressesStartingWith: string
): Array<AdaAddress> {
  const addresses = _generateListOfStrings(addressesStartingWith);
  return addresses.slice(0, totalAddresses).map((address) => ({
    cadAmount: {
      getCCoin: '0'
    },
    cadId: address,
    cadIsUsed: false,
    account: 0,
    change: 0,
    index: 0
  }));
}

export function getLovefieldTxs(
  walletName: string
): Array<LovefieldShownWalletTx> {
  const featureData = getFeatureData();
  if (!featureData) {
    return [];
  }
  const { walletInitialData, lovefieldShownTxs } = featureData;
  if (walletInitialData === undefined || lovefieldShownTxs === undefined) {
    return [];
  }
  const wallet = walletInitialData[walletName];
  return wallet && wallet.txHashesStartingWith && wallet.txsNumber
    ? _getLovefieldTxs(
      wallet.txsNumber,
      wallet.addressesStartingWith,
      wallet.txHashesStartingWith,
      0 // unused
    )
    : lovefieldShownTxs[walletName];
}

export function getTxsMapList(
  addresses: Array<string>
): Array<MockWalletTx> {
  const firstAddress = addresses[0];
  const addressesStartingWith = firstAddress.slice(0, firstAddress.length - 1);
  const wallet = _getWallet(addressesStartingWith);
  if (!wallet) {
    return [];
  }
  return _getTxsMapList(wallet);
}

function _generateListOfStrings(
  prefix: string
): Array<string> {
  const strings = [];
  // Generates strings ending with A-Z
  for (let i = 65; i < 90; i++) {
    strings.push(prefix + String.fromCharCode(i));
  }
  // Generates strings ending with a-z
  for (let i = 97; i < 122; i++) {
    strings.push(prefix + String.fromCharCode(i));
  }
  return strings;
}

function _getTxs(
  txsNumber: number,
  addressesStartingWith: string,
  txHashesStartingWith: string,
  pendingTxsNumber: number
): Array<MockWalletTx> {
  return _generateListOfStrings(txHashesStartingWith)
    .slice(0, txsNumber + pendingTxsNumber)
    .map((txHash, index) => {
      const featureData = getFeatureData();
      const currentTime = (!featureData || !featureData.currentDateExample)
        ? new Date(0)
        : new Date(featureData.currentDateExample);
      const txTime = currentTime.setDate(currentTime.getDate() + index);
      const newTx = Object.assign({}, {
        hash: txHash,
        time: new Date(txTime).toISOString(),
        inputs_address: ['Ae2dddwUPEZASB8nPKk1VsePbQZY8ZVv4mGebJ4UwmSBhRo9oR9Eqkzyxwv'],
        inputs_amount: ['70'],
        outputs_address: [addressesStartingWith + 'W'],
        outputs_amount: ['200'],
        best_block_num: '101',
        last_update: new Date(txTime).toISOString(),
        tx_state: 'Pending'
      });
      const txMap = Object.assign({}, { address: addressesStartingWith + 'W', tx: newTx });
      if (index >= pendingTxsNumber) {
        txMap.tx.block_num = '56';
        txMap.tx.tx_state = 'Successful';
      }
      return txMap;
    });
}

function _getLovefieldTxs(
  txsNumber: number,
  addressesStartingWith: string,
  txHashesStartingWith?: string,
  pendingTxsNumber: number
): Array<LovefieldShownWalletTx> {
  const listOfHashes = txHashesStartingWith === undefined
    ? []
    : _generateListOfStrings(txHashesStartingWith);
  const listOfHashesReversed = listOfHashes.slice(0, txsNumber + pendingTxsNumber).reverse();
  return listOfHashesReversed
    .map((txHash, index) => {
      const featureData = getFeatureData();
      const currentTime = (!featureData || !featureData.currentDateExample)
        ? new Date(0)
        : new Date(featureData.currentDateExample);
      const txTime = currentTime.setDate(currentTime.getDate() + index);
      return (
        {
          txType: 'ADA received',
          txAmount: '0.000200',
          txTimeTitle: 'ADA transaction,',
          txTime: new Date(txTime).toISOString(),
          txStatus: index < pendingTxsNumber ? 'TRANSACTION PENDING' : 'HIGH',
          txFrom: ['Ae2dddwUPEZASB8nPKk1VsePbQZY8ZVv4mGebJ4UwmSBhRo9oR9Eqkzyxwv'],
          txTo: [addressesStartingWith + 'W'],
          txConfirmations: 'High. 45 confirmations.',
          txId: txHash
        }: LovefieldShownWalletTx
      );
    });
}

function _getWallet(
  addressesStartingWith: string
): ?InitialData {
  const featureData = getFeatureData();
  if (!featureData) {
    return undefined;
  }
  const initialData = featureData.walletInitialData;
  if (!initialData) {
    return undefined;
  }
  return Object
    .keys(initialData)
    .map(key => initialData[key])
    .find(walletData => (
      walletData.addressesStartingWith === addressesStartingWith
    ));
}

function _getTxsMapList(
  wallet: InitialData
): Array<MockWalletTx> {
  if (wallet.txHashesStartingWith && wallet.txsNumber) {
    return _getTxs(
      wallet.txsNumber,
      wallet.addressesStartingWith,
      wallet.txHashesStartingWith,
      0 // unused
    );
  }
  const featureData = getFeatureData();
  if (!featureData) {
    return [];
  }
  const mockTxs = featureData.txs;
  if (!mockTxs) {
    return [];
  }
  const initialData = featureData.walletInitialData;
  if (!initialData) {
    return [];
  }
  const selectedWalletName = Object
    .keys(initialData)
    .find(walletName => (
      initialData[walletName].addressesStartingWith === wallet.addressesStartingWith
    ));
  if (!selectedWalletName) {
    return [];
  }
  return mockTxs[selectedWalletName];
}
