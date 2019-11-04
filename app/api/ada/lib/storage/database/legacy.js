// @flow

import { dumpByVersion } from './index';
import {
  _getFromStorage,
  _saveInStorage,
} from '../adaLocalStorage';
import {
  removeLocalItem,
} from '../../../../localStorage/primitives';

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

type LegacyLocalStorageWallet = {
  adaWallet: LegacyAdaWallet,
  masterKey?: string, // unused in hardware wallets
  // this is a per-account setting but we only have 1 account per wallet in storage v1 Yoroi
  lastReceiveAddressIndex: number
}

type LegacyLocalStorageCryptoAccount = {
  account: number,
  root_cached_key: string, // MasterPublicKey
  derivation_scheme: string
}

export type LegacyAdaWallet = {
  cwAmount: LegacyAdaAmount,
  cwId: string,
  cwMeta: LegacyAdaWalletMetaParams,
  cwType: LegacyAdaWalletType,
  cwPassphraseLU?: string,
  cwHardwareInfo?: LegacyAdaWalletHardwareInfo,
};
export type LegacyAdaWalletMetaParams = {
  cwName: string,
  cwAssurance: LegacyAdaAssurance,
  // This was never used but is supposed to represent 0 = (bitcoin, ada); 1 = (satoshi, lovelace)
  cwUnit: number
};
export type LegacyAdaAssurance = 'CWANormal' | 'CWAStrict';
export type LegacyAdaWalletType = 'CWTWeb' | 'CWTHardware';
export type LegacyAdaWalletHardwareInfo = {
  vendor : string,
  model: string,
  deviceId: string,
  label: string,
  majorVersion: number,
  minorVersion: number,
  patchVersion: number,
  language: string,
  publicMasterKey: string,
};

const legacyStorageKeys = {
  ACCOUNT_KEY: 'ACCOUNT', // Note: only a single account
  WALLET_KEY: 'WALLET',
  LAST_BLOCK_NUMBER_KEY: 'LAST_BLOCK_NUMBER',
};

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

export async function legacySaveLastReceiveAddressIndex(index: number): Promise<void> {
  const stored = await _getFromStorage<LegacyLocalStorageWallet>(legacyStorageKeys.WALLET_KEY);
  if (!stored) {
    throw new Error('Need to create a wallet before saving wallet metadata');
  }
  stored.lastReceiveAddressIndex = index;
  await _saveInStorage(legacyStorageKeys.WALLET_KEY, stored);
}
export async function legacyGetLastReceiveAddressIndex(): Promise<number> {
  const stored  = await _getFromStorage<LegacyLocalStorageWallet>(legacyStorageKeys.WALLET_KEY);
  return stored ? stored.lastReceiveAddressIndex : 0;
}

export async function legacyGetLocalStorageWallet(): Promise<void | LegacyLocalStorageWallet> {
  const stored = await _getFromStorage<LegacyLocalStorageWallet>(legacyStorageKeys.WALLET_KEY);
  return stored ? stored : undefined;
}
export async function getCurrentCryptoAccount(): Promise<null | LegacyLocalStorageCryptoAccount> {
  const localAccount = await _getFromStorage<LegacyLocalStorageCryptoAccount>(
    legacyStorageKeys.ACCOUNT_KEY
  );
  if (!localAccount) {
    return null;
  }
  if (localAccount.derivation_scheme !== 'V2') {
    throw Error('Sanity check');
  }
  return localAccount;
}

export async function clearStorageV1(): Promise<void> {
  await removeLocalItem(legacyStorageKeys.ACCOUNT_KEY);
  await removeLocalItem(legacyStorageKeys.WALLET_KEY);
  await removeLocalItem(legacyStorageKeys.LAST_BLOCK_NUMBER_KEY);
}
