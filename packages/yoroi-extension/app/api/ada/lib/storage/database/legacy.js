// @flow

/**
 * This file contains methods used to extract information
 * from the legacy database format
 * They should NOT be used for any purpose other than
 * to migrate to a new format
 */

export type LegacyAddressingInfo = {|
  account: number,
  change: number,
  index: number,
|};
export type LegacyAdaAmount = {| getCCoin: string, |};
export type LegacyAdaAddress = {|
  cadAmount: LegacyAdaAmount,
  cadId: string,
  cadIsUsed: boolean,
  ...LegacyAddressingInfo,

|};

export type LegacyAdaWallet = {|
  cwAmount: LegacyAdaAmount,
  cwId: string,
  cwMeta: LegacyAdaWalletMetaParams,
  cwType: LegacyAdaWalletType,
  cwPassphraseLU?: string,
  cwHardwareInfo?: LegacyAdaWalletHardwareInfo,
|};
export type LegacyAdaWalletMetaParams = {|
  cwName: string,
  cwAssurance: LegacyAdaAssurance,
  // This was never used but is supposed to represent 0 = (bitcoin, ada); 1 = (satoshi, lovelace)
  cwUnit: number,
|};
export type LegacyAdaAssurance = 'CWANormal' | 'CWAStrict';
export type LegacyAdaWalletType = 'CWTWeb' | 'CWTHardware';
export type LegacyAdaWalletHardwareInfo = {|
  vendor : string,
  model: string,
  deviceId: string,
  label: string,
  majorVersion: number,
  minorVersion: number,
  patchVersion: number,
  language: string,
  publicMasterKey: string,
|};

export const legacyStorageKeys = {
  ACCOUNT_KEY: 'ACCOUNT', // Note: only a single account
  WALLET_KEY: 'WALLET',
  LAST_BLOCK_NUMBER_KEY: 'LAST_BLOCK_NUMBER',
  SELECTED_EXPLORER_KEY: 'SELECTED_EXPLORER',
};
