// @flow

import type { LocatorObject } from '../support/webdriver';

export const delegationTxDialogError: LocatorObject = {
  locator: '.DelegationTxDialog_error',
  method: 'css',
};
export const poolIdInput: LocatorObject = { locator: "input[name='poolId']", method: 'css' };
export const stakePoolTicker: LocatorObject = { locator: '.StakePool_userTitle', method: 'css' };
export const delegationFormNextButton: LocatorObject = {
  locator: '.DelegationSendForm_component .MuiButton-primary',
  method: 'css',
};
export const delegationTxDialog: LocatorObject = {
  locator: '.DelegationTxDialog_dialog',
  method: 'css',
};
export const delegationSuccessPage: LocatorObject = {
  locator: '.SuccessPage_component',
  method: 'css',
};
export const delegationDashboardPageButton: LocatorObject = {
  locator: "//button[contains(text(), 'Dashboard page')]",
  method: 'xpath',
};
export const delegationDashboardPage: LocatorObject = {
  locator: '.StakingDashboard_page',
  method: 'css',
};
