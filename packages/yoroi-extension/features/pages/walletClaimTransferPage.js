// @flow

import type { LocatorObject } from '../support/webdriver';

export const byronButton: LocatorObject = { locator: '.TransferCards_byronEra', method: 'css' };
export const daedalusMasterKeyButton: LocatorObject = {
  locator: '.fromDaedalusMasterKey_masterKey',
  method: 'css',
};
export const twelveWordOption: LocatorObject = {
  locator: '.fromDaedalusWallet12Word_legacyDaedalus',
  method: 'css',
};
export const masterKeyInput: LocatorObject = { locator: 'input[name="masterKey"]', method: 'css' };
export const cancelTransferButton: LocatorObject = { locator: '.cancelTransferButton', method: 'css' };
export const shelleyEraCard: LocatorObject = { locator: '.TransferCards_shelleyEra', method: 'css' };
export const trezorOption: LocatorObject = { locator: '.fromTrezor_connectTrezor', method: 'css' };
export const ledgerOption: LocatorObject = { locator: '.fromLedger_connectLedger', method: 'css' };
export const yoroiPaperButton: LocatorObject = { locator: '.yoroiPaper', method: 'css' };

export const icarusTab: LocatorObject = { locator: '.IcarusTab', method: 'css' };
export const restore15WordWalletIcarus: LocatorObject = {
  locator: '.fromIcarusWallet15Word_restoreNormalWallet',
  method: 'css',
};
export const restoreShelley15WordDialog: LocatorObject = {
  locator: '.ShelleyOptionDialog_restoreNormalWallet',
  method: 'css',
};
export const restoreShelleyPaperWalletDialog: LocatorObject = {
  locator: '.ShelleyOptionDialog_restorePaperWallet',
  method: 'css',
};

export const keyInput: LocatorObject = { locator: "input[name='key']", method: 'css' };
export const descryptionPasswordInput: LocatorObject = {
  locator: "input[name='decryptionPassword']",
  method: 'css',
};
export const shelleyPrivateKeyInput: LocatorObject = { locator: '.ShelleyOptionDialog_masterKey', method: 'css' };
export const restoreIcarusPaperWalletOption: LocatorObject = {
  locator: '.fromIcarusPaperWallet_restorePaperWallet',
  method: 'css',
};

export const transferSummaryPage: LocatorObject = { locator: '.TransferSummaryPage_body', method: 'css' };

export const transferErrorPageTitle: LocatorObject = { locator: '.ErrorPage_title', method: 'css' };
export const transferSuccessPageTitle: LocatorObject = { locator: '.SuccessPage_title', method: 'css' };

export const transferButton: LocatorObject = { locator: '.transferButton', method: 'css' };
export const createYoroiWalletButton: LocatorObject = {
  locator: '.createYoroiWallet.YoroiTransferStartPage_button',
  method: 'css',
};
export const transferSummaryPageError: LocatorObject = { locator: '.TransferSummaryPage_error', method: 'css' };
export const keepRegisteredButton: LocatorObject = {
  locator: `//button[contains(text(), "Keep registered")]`,
  method: 'xpath',
};
export const transferSummaryRefundText: LocatorObject = { locator: '.TransferSummaryPage_refund', method: 'css' };
