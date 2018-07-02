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
  addressesStartingWith = 'Ae2tdPwUPEZASB8nPKk1VsePbQZY8ZVv4mGebJ4UwmSBhRo9oR9EqkSzxo'
) {
  const addresses = _generateListOfStrings(addressesStartingWith);
  return addresses.slice(0, totalAddresses).reduce((newAddresses, address) => {
    newAddresses[address] = {
      cadAmount: {
        getCCoin: 0
      },
      cadId: address,
      cadIsUsed: false,
      account: 0,
      change: 0,
      index: 0
    };
    return newAddresses;
  }, {});
}

export function getLovefieldTxs(walletName) {
  const { wallets, lovefieldTxs } = getMockData();
  const wallet = wallets[walletName];
  return wallet && wallet.txHashesStartingWith && wallet.txsNumber ?
    _getLovefieldTxs(
      wallet.txsNumber,
      wallet.addressesStartingWith,
      wallet.txHashesStartingWith,
      wallet.pendingTxsNumber
    ) :
    lovefieldTxs[wallet.addressesStartingWith];
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
      const newTx = Object.assign({}, {
        hash: txHash,
        time: '2018-05-10T13:51:33.000Z',
        inputs_address: ['Ae2dddwUPEZASB8nPKk1VsePbQZY8ZVv4mGebJ4UwmSBhRo9oR9Eqkzyxwv'],
        inputs_amount: [70],
        outputs_address: [addressesStartingWith + 'W'],
        outputs_amount: [200],
        best_block_num: 101
      });
      const txMap = Object.assign({}, { address: addressesStartingWith + 'W', tx: newTx } );
      if (index >= pendingNumber) {
        txMap.tx.block_num = 56;
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
  return _generateListOfStrings(txHashesStartingWith)
    .slice(0, txsNumber + pendingNumber)
    .map((txHash, index) => (
      {
        txType: 'ADA received',
        txAmount: '0.000200',
        txTimeTitle: 'ADA transaction,',
        txTime: '2018-05-10T13:51:33.000Z',
        txStatus: index < pendingNumber ? 'TRANSACTION PENDING' : 'HIGH',
        txFrom: ['Ae2dddwUPEZASB8nPKk1VsePbQZY8ZVv4mGebJ4UwmSBhRo9oR9Eqkzyxwv'],
        txTo: [addressesStartingWith + 'W'],
        txConfirmations: 'High. 45 confirmations.',
        txId: txHash
      }
    ));
}

function _getWallet(addressesStartingWith) {
  if (!getMockData().wallets) {
    return {};
  }
  return Object.values(getMockData().wallets).find(wallet =>
    wallet.addressesStartingWith === addressesStartingWith);
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
  return getMockData().txs[wallet.addressesStartingWith];
}
