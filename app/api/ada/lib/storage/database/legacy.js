// @flow

import { dumpByVersion } from './index';

/**
 * This file contains methods used to extract information
 * from the legacy database format
 * They should NOT be used for any purpose other than
 * to migrate to a new format
 */

export type LegacyAddressingInfo = {
  account: number,
  change: number,
  index: number,
};
export type LegacyAdaAmount = {
  getCCoin: string,
};
export type LegacyAdaAddress = {
  cadAmount: LegacyAdaAmount,
  cadId: string,
  cadIsUsed: boolean,
} & LegacyAddressingInfo;

export const getLegacyAddressesList = (): Array<LegacyAdaAddress> => {
  if (dumpByVersion.Addresses) {
    return dumpByVersion.Addresses;
  }
  return [];
};

export const resetLegacy = (): void => {
  for (const prop of Object.keys(dumpByVersion)) {
    delete dumpByVersion[prop];
  }
};
