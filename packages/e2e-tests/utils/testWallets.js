import { getTargetBrowser } from './utils.js';
import { TargetBrowser } from '../helpers/constants.js';

export const testWallet1 = Object.freeze({
  name: 'TestWallet1',
  plate: 'JPAX-4675',
  mnemonic: process.env.FIRST_SMOKE_TEST_WALLET,
  balance: 8.828823,
  receiveAddress:
    'addr_test1qp8tt4wxnt32h3fn63xkzh4q7ah57v330v40mc2e9ale5jp4ytssp23mthvgruacyluaa0f868fffgnch75082k8awhsc4l6ve',
});
export const testWallet1Mainnet = Object.freeze({
  name: 'TestWallet1',
  plate: 'PXNL-6868',
  mnemonic: process.env.TEST_WALLET_MAINNET_1,
  balance: 3,
  receiveAddress: 'addr1q8gnztlsm9fn7jeuqhz7d8ul4e78jxvwgkwa40na6ygdd0z4lnxx06d9vfcjyf5hypq9alsh7k27gtgsykgns6w86v7q37z6pf',
});
export const testWallet2 = Object.freeze({
  name: 'TestWallet2Static',
  plate: 'XONT-4910',
  // !!! THE WALLET IS COMPROMISED. DO NOT SEND ADA INTO IT !!!
  mnemonic: process.env.SECOND_STATIC_TEST_WALLET,
  balance: 0,
});
export const testWallet3 = Object.freeze({
  name: 'TW_Chrome',
  plate: 'HEJT-3361',
  // !!! THE WALLET IS COMPROMISED. DO NOT SEND ADA INTO IT !!!
  mnemonic: process.env.SECOND_SMOKE_TEST_WALLET,
  minTxs: 29,
});
export const testWalletTrezor = Object.freeze({
  name: 'TrezorEmul',
  plate: 'OPLJ-6753',
  mnemonic: 'bulk gaze broccoli stage extra chat lumber coil squirrel elder theory unlock',
  deviceId: '6495958994A4025BB5EE1DB0',
  balance: 0,
});
export const testWalletLedger = Object.freeze({
  name: 'LedgerEmul',
  plate: 'XDPH-3069',
  mnemonic: 'canal program butter sell isolate say doll document miss burger join owner fabric behave stomach theory sing math school force inhale vast sunset trouble',
  balance: 0,
});
export const testWalletNFTs = Object.freeze({
  name: 'TestWalletNFTs',
  plate: 'DCDT-7109',
  mnemonic: 'eternal logic shrimp direct weasel heart relief tonight else expose lift lava barrel frame multiply',
  balance: 3.24112,
})

export const getSpendableWallet = () => {
  const browserName = getTargetBrowser();
  if (browserName === TargetBrowser.Chrome) {
    return testWallet3;
  } else {
    throw new Error(`There is no a separate wallet for the browser "${browserName}"`);
  }
};
