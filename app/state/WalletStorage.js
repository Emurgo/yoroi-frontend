
const WalletStorage = {};
const WALLET_STORAGE_SK_KEY = 'WALLET_STORAGE_SK_KEY';

// [Private method]
// Prevent change wallet information
const freezeWallet = function () {
  if (WalletStorage.sk) Object.freeze(WalletStorage);
};

// [Private method]
// encodeUint8Array :: String with JSON format => Uint8Array -> String
const encodeUint8Array = function (x) {
  return JSON.stringify(x);
};

// [Private method]
// decodeUint8Array :: String with JSON format => String -> Uint8Array
const decodeUint8Array = function (x) {
  const xObj = JSON.parse(x);
  const xAsArray = Object.values(xObj);
  return Uint8Array.from(xAsArray);
};

WalletStorage.initWallet = function () {
  // localStorage.removeItem(WALLET_STORAGE_SK_KEY); // This line is for debugging purposes
  if (!this.sk) {
    if (window.localStorage) {
      try {
        const walletJson = localStorage.getItem(WALLET_STORAGE_SK_KEY);
        this.sk = decodeUint8Array(walletJson);
        freezeWallet();
      } catch (e) {
        console.warn('[WalletStorage - initWallet] Unable to return Wallet info');
      }
    } else {
      console.warn('[WalletStorage - initWallet] The browser doesn\'t support local storage');
    }
  }
};

WalletStorage.hasWallet = function () {
  return !!this.sk;
};

WalletStorage.getWallet = function () {
  return this.sk;
};

WalletStorage.setWallet = function (wallet) {
  this.sk = wallet;
  if (window.localStorage) {
    console.log('[WalletStorage - SetWallet] saving wallet..');
    const walletJson = encodeUint8Array(this.sk);
    localStorage.setItem(WALLET_STORAGE_SK_KEY, walletJson);
  } else {
    console.warn('[WalletStorage - SetWallet] The browser doesn\'t support local storage');
  }
  freezeWallet();
};

// Always initWallet, before use WalletStorage.
export default WalletStorage;
