import { getTargetBrowser } from './utils.js';
import { TargetBrowser } from '../helpers/constants.js';

export const testWallet1 = Object.freeze({
  name: 'TestWallet1',
  plate: 'JPAX-4675',
  mnemonic: process.env.FIRST_SMOKE_TEST_WALLET,
  balance: 4.828823,
  receiveAddress:
    'addr1q98tt4wxnt32h3fn63xkzh4q7ah57v330v40mc2e9ale5jp4ytssp23mthvgruacyluaa0f868fffgnch75082k8awhsmrz6qx',
});
export const testWallet2 = Object.freeze({
  name: 'TestWallet2Static',
  plate: 'XONT-4910',
  mnemonic: process.env.SECOND_STATIC_TEST_WALLET,
  balance: 6.527639,
});
export const testWallet3 = Object.freeze({
  name: 'TW_Chrome',
  plate: 'XZHD-1651',
  mnemonic: process.env.SECOND_SMOKE_TEST_WALLET,
  minTxs: 104,
});
export const testWallet4 = Object.freeze({
  name: 'TW_FF',
  plate: 'CJBE-8896',
  mnemonic: process.env.SECOND_SMOKE_TEST_WALLET_FF,
  minTxs: 97,
});
export const testWalletTrezor = Object.freeze({
  name: 'TrezorEmul',
  plate: 'PXCA-2349',
  mnemonic: 'lyrics tray aunt muffin brisk ensure wedding cereal capital path replace weasel',
  deviceId: '6495958994A4025BB5EE1DB0',
  balance: 0,
});

export const getSpendableWallet = () => {
  const browserName = getTargetBrowser();
  if (browserName === TargetBrowser.Chrome) {
    return testWallet3;
  } else if (browserName === TargetBrowser.FF) {
    return testWallet4;
  } else {
    throw new Error(`There is no a separate wallet for the browser "${browserName}"`);
  }
};
