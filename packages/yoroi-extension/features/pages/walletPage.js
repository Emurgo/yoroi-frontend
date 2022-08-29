// @flow
// Revamped wallets list elements

export const summaryTab = { locator: 'summary', method: 'css' };
export const sendTab = { locator: '.send', method: 'css' };
export const receiveTab = { locator: '.receive', method: 'css' };
export const claimTransferTab = { locator: '.claimTransfer', method: 'css' };

export const walletNameText = { locator: '.NavPlate_name', method: 'css' };
export const activeNavTab = { locator: '.WalletNavButton_active', method: 'css' };
export const dashboardTab = { locator: '.stakeDashboard ', method: 'css' };
export const transactionsTab = { locator: `//span[contains(text(), "Transactions")]`, method: 'xpath' };

export const navDetailsAmount = { locator: '.NavWalletDetails_amount', method: 'css' };
export const navDetailsHideButton = { locator: '.NavWalletDetails_toggleButton', method: 'css' };
export const navDetailsWalletDropdown = { locator: '.NavDropdown_toggle', method: 'css' };
export const navDetailsBuyButton = { locator: '.NavDropdownContent_buyButton', method: 'css' };
export const buyDialogAddress = { locator: '.BuySellDialog_address', method: 'css' };