import mockData from './mockData.json';

let builtMockData;

export function getMockData() {
  return builtMockData;
}

export function buildMockData(feature) {
  builtMockData = Object.assign({}, mockData.default, mockData[feature]);
}

export function getFakeAddresses(
  addressAmount,
  addressPrefix = 'Ae2tdPwUPEZASB8nPKk1VsePbQZY8ZVv4mGebJ4UwmSBhRo9oR9EqkSzxo'
) {
  const addresses = _generateListOfStrings(addressPrefix);
  return addresses.slice(0, addressAmount).reduce((newAddresses, address) => {
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

export function getLovefieldTxs(addressPrefix) {
  const addressMap = getMockData().addressesMapper
      .find((address => address.prefix === addressPrefix));
  return addressMap && addressMap.hashPrefix && addressMap.txsAmount ?
    _getLovefieldTxs(
      addressMap.txsAmount,
      addressPrefix,
      addressMap.hashPrefix,
      addressMap.pendingTxsAmount
    ) :
    getMockData().lovefieldTxs[addressPrefix];
}

export function getTxsMapList(addresses) {
  const firstAddress = addresses[0];
  const addressPrefix = firstAddress.slice(0, firstAddress.length - 1);
  const addressMap = _getAddressMapper(addressPrefix);
  return _getTxsMapList(addressMap, addressPrefix);
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

function _getTxs(txsAmount, addressPrefix, hashPrefix, pendingTxsAmount) {
  if (!txsAmount) {
    return builtMockData.txs;
  }
  const pendingAmount = pendingTxsAmount || 0;
  return _generateListOfStrings(hashPrefix)
    .slice(0, txsAmount + pendingAmount)
    .map((txHash, index) => {
      const newTx = Object.assign({}, {
        hash: txHash,
        time: '2018-05-10T13:51:33.000Z',
        inputs_address: ['Ae2dddwUPEZASB8nPKk1VsePbQZY8ZVv4mGebJ4UwmSBhRo9oR9Eqkzyxwv'],
        inputs_amount: [70],
        outputs_address: [addressPrefix + 'W'],
        outputs_amount: [200],
        best_block_num: 101
      });
      const txMap = Object.assign({}, { address: addressPrefix + 'W', tx: newTx } );
      if (index >= pendingAmount) {
        txMap.tx.block_num = 56;
      }
      return txMap;
    });
}

function _getLovefieldTxs(txsAmount, addressPrefix, hashPrefix, pendingTxsAmount) {
  if (!txsAmount) {
    return builtMockData.txs;
  }
  const pendingAmount = pendingTxsAmount || 0;
  return _generateListOfStrings(hashPrefix)
    .slice(0, txsAmount + pendingAmount)
    .map((txHash, index) => (
      {
        txType: 'ADA received',
        txAmount: '0.000200',
        txTimeTitle: 'ADA transaction,',
        txTime: '2018-05-10T13:51:33.000Z',
        txStatus: index < pendingAmount ? 'TRANSACTION PENDING' : 'HIGH',
        txFrom: ['Ae2dddwUPEZASB8nPKk1VsePbQZY8ZVv4mGebJ4UwmSBhRo9oR9Eqkzyxwv'],
        txTo: [addressPrefix + 'W'],
        txConfirmations: 'High. 45 confirmations.',
        txId: txHash
      }
    ));
}

function _getAddressMapper(addressPrefix) {
  if (!getMockData().addressesMapper) {
    return {};
  }
  return getMockData().addressesMapper.find((address => address.prefix === addressPrefix));
}

export function _getTxsMapList(addressMap, addressPrefix) {
  if (addressMap && addressMap.hashPrefix && addressMap.txsAmount) {
    return _getTxs(
      addressMap.txsAmount,
      addressPrefix,
      addressMap.hashPrefix,
      addressMap.pendingTxsAmount
    );
  }
  if (!getMockData().txs) {
    return [];
  }
  return getMockData().txs[addressPrefix];
}
