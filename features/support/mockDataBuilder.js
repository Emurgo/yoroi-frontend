import mockData from './mockData.json';

let builtMockData;

export function getMockData() {
  return builtMockData;
}

export function buildMockData(feature) {
  builtMockData = Object.assign({}, mockData.default, mockData[feature]);
}

function buildAddresses() {
  const addressPrefix = 'Ae2tdPwUPEZASB8nPKk1VsePbQZY8ZVv4mGebJ4UwmSBhRo9oR9EqkSzxo';
  const addresses = [];
  // Generates addresses ending with A-Z
  for (let i = 65; i < 90; i++) {
    addresses.push(addressPrefix + String.fromCharCode(i));
  }
  // Generates addresses ending with a-z
  for (let i = 97; i < 122; i++) {
    addresses.push(addressPrefix + String.fromCharCode(i));
  }
  return addresses;
}

export function getAddresses(addressAmount) {
  if (!addressAmount) {
    return builtMockData.addresses;
  }
  const addresses = buildAddresses();
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
