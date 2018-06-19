import mockData from './mockData.json';

let builtMockData;

export function getMockData() {
  return builtMockData;
}

export function buildMockData(feature) {
  builtMockData = Object.assign({}, mockData.default, mockData[feature]);
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

export function getTxs(txsAmount, addressPrefix, hashPrefix) {
  if (!txsAmount) {
    return builtMockData.txs;
  }
  return _generateListOfStrings(hashPrefix)
    .slice(0, txsAmount).map(txHash => (
      {
        address: addressPrefix + 'W',
        tx: {
          hash: txHash,
          time: '2018-05-10T13:51:33.000Z',
          inputs_address: ['Ae2dddwUPEZASB8nPKk1VsePbQZY8ZVv4mGebJ4UwmSBhRo9oR9Eqkzyxwv'],
          inputs_amount: [70],
          outputs_address: [addressPrefix + 'W'],
          outputs_amount: [200],
          block_num: 56,
          best_block_num: 101
        }
      }
    ));
}

export function getLovefieldTxs(txsAmount, addressPrefix, hashPrefix) {
  if (!txsAmount) {
    return builtMockData.txs;
  }
  return _generateListOfStrings(hashPrefix)
    .slice(0, txsAmount).map(txHash => (
      {
        txType: 'ADA received',
        txAmount: '0.000200',
        txTime: 'ADA transaction, 10:51:33 AM',
        txStatus: 'HIGH',
        txFrom: ['Ae2dddwUPEZASB8nPKk1VsePbQZY8ZVv4mGebJ4UwmSBhRo9oR9Eqkzyxwv'],
        txTo: [addressPrefix + 'W'],
        txConfirmations: 'High. 45 confirmations.',
        txId: txHash
      }
    ));
}
