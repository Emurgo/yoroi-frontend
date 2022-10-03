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
export const hardwareDisclaimerComponent: LocatorObject = { locator: '.HardwareDisclaimer_component', method: 'css' };
export const understandButton: LocatorObject = { locator: '//button[text()="I understand"]', method: 'xpath' };
export const iframe: LocatorObject = {
  locator: '#classicCardanoStakingPage > iframe',
  method: 'css',
};
export const iframePoolIdInput: LocatorObject = { locator: '//div/form/input', method: 'xpath' };
export const iframePoolIdSearchButton: LocatorObject = {
  locator: '//div/form/button',
  method: 'xpath',
};
export const iframeFirstPoolDelegateButton: LocatorObject = {
  locator: '//table/tbody/tr/td/button',
  method: 'xpath',
};
