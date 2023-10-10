// @flow

import type { LocatorObject } from '../support/webdriver';

export const root: LocatorObject = { locator: 'root', method: 'id' };
export const yoroiClassic: LocatorObject = { locator: '.YoroiClassic', method: 'css' };
export const yoroiModern: LocatorObject = { locator: '.YoroiModern', method: 'css' };
export const serverErrorBanner: LocatorObject = {
  locator: '.ServerErrorBanner_serverError',
  method: 'css',
};
export const maintenanceBody: LocatorObject = { locator: '.Maintenance_body', method: 'css' };

export const myWalletsPage: LocatorObject = { locator: '.MyWallets_page', method: 'css' };

export const selectWalletButton: LocatorObject = {
  locator: '.NavWalletDetailsRevamp_contentWrapper',
  method: 'css',
};

export const addWalletButton: LocatorObject = { locator: 'addWalletButton', method: 'id' };

export const applySelectedWalletButton: LocatorObject = {
  locator: 'applyWalletButton',
  method: 'id',
};
