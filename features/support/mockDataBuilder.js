import mockData from './mockData.json';

let builtMockData;

export function getMockData() {
  return builtMockData;
}

export function buildMockData(feature) {
  builtMockData = Object.assign({}, mockData.default, mockData[feature]);
}

export function getFakeAddresses(
  totalAddresses,
  addressesStartingWith
) {
  const addresses = _generateListOfStrings(addressesStartingWith);
  return addresses.slice(0, totalAddresses).map((address) => ({
    cadAmount: {
      getCCoin: 0
    },
    cadId: address,
    cadIsUsed: false,
    account: 0,
    change: 0,
    index: 0
  }));
}

export function getLovefieldTxs(walletName) {
  const { walletInitialData, lovefieldShownTxs } = getMockData();
  const wallet = walletInitialData[walletName];
  return wallet && wallet.txHashesStartingWith && wallet.txsNumber ?
    _getLovefieldTxs(
      wallet.txsNumber,
      wallet.addressesStartingWith,
      wallet.txHashesStartingWith,
      wallet.pendingTxsNumber
    ) :
    lovefieldShownTxs[walletName];
}

export function getTxsMapList(addresses) {
  const firstAddress = addresses[0];
  const addressesStartingWith = firstAddress.slice(0, firstAddress.length - 1);
  const wallet = _getWallet(addressesStartingWith);
  return _getTxsMapList(wallet);
}

function _generateListOfStrings(prefix) {
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

function _getTxs(txsNumber, addressesStartingWith, txHashesStartingWith, pendingTxsNumber) {
  if (!txsNumber) {
    return builtMockData.txs;
  }
  const pendingNumber = pendingTxsNumber || 0;
  return _generateListOfStrings(txHashesStartingWith)
    .slice(0, txsNumber + pendingNumber)
    .map((txHash, index) => {
      const currentTime = new Date(getMockData().currentDateExample);
      const txTime = currentTime.setDate(currentTime.getDate() + index);
      const newTx = Object.assign({}, {
        hash: txHash,
        time: new Date(txTime),
        inputs_address: ['Ae2dddwUPEZASB8nPKk1VsePbQZY8ZVv4mGebJ4UwmSBhRo9oR9Eqkzyxwv'],
        inputs_amount: [70],
        outputs_address: [addressesStartingWith + 'W'],
        outputs_amount: [200],
        best_block_num: 101,
        last_update: new Date(txTime),
        tx_state: 'Pending'
      });
      const txMap = Object.assign({}, { address: addressesStartingWith + 'W', tx: newTx });
      if (index >= pendingNumber) {
        txMap.tx.block_num = 56;
        txMap.tx.tx_state = 'Successful';
      }
      return txMap;
    });
}

function _getLovefieldTxs(txsNumber, addressesStartingWith, txHashesStartingWith,
  pendingTxsNumber) {
  if (!txsNumber) {
    return builtMockData.txs;
  }
  const pendingNumber = pendingTxsNumber || 0;
  const listOfHashes = _generateListOfStrings(txHashesStartingWith)
    .slice(0, txsNumber + pendingNumber);
  return listOfHashes
    .map((txHash, index) => {
      const currentTime = new Date(getMockData().currentDateExample);
      const txTime = currentTime.setDate(currentTime.getDate() + index);
      const txId = listOfHashes[listOfHashes.length - index - 1];
      return (
        {
          txType: 'ADA received',
          txAmount: '0.000200',
          txTimeTitle: 'ADA transaction,',
          txTime: new Date(txTime),
          txStatus: index < pendingNumber ? 'TRANSACTION PENDING' : 'HIGH',
          txFrom: ['Ae2dddwUPEZASB8nPKk1VsePbQZY8ZVv4mGebJ4UwmSBhRo9oR9Eqkzyxwv'],
          txTo: [addressesStartingWith + 'W'],
          txConfirmations: 'High. 45 confirmations.',
          txId
        }
      );
    });
}

function _getWallet(addressesStartingWith) {
  if (!getMockData().walletInitialData) {
    return {};
  }
  return Object.values(getMockData().walletInitialData).find(walletData =>
    walletData.addressesStartingWith === addressesStartingWith);
}

function _getTxsMapList(wallet) {
  if (wallet && wallet.txHashesStartingWith && wallet.txsNumber) {
    return _getTxs(
      wallet.txsNumber,
      wallet.addressesStartingWith,
      wallet.txHashesStartingWith,
      wallet.pendingTxsNumber
    );
  }
  if (!getMockData().txs) {
    return [];
  }
  const { walletInitialData } = getMockData();
  const selectedWalletName = Object.keys(walletInitialData).find(walletName =>
    walletInitialData[walletName].addressesStartingWith === wallet.addressesStartingWith);
  return getMockData().txs[selectedWalletName];
}
