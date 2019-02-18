// @flow
export type WalletType = 'CWTWeb' | 'CWTHardware';

export type WalletHardwareInfo = {
  vendor : string,
  model: string,
  deviceId: string,
  label: string,
  majorVersion: number,
  minorVersion: number,
  patchVersion: number,
  language: string,
  publicMasterKey: string,
  chainCodeHex: string,
};

export const WalletTypeOption : {
  WEB_WALLET: WalletType,
  HARDWARE_WALLET: WalletType
} = {
  WEB_WALLET: 'CWTWeb',
  HARDWARE_WALLET: 'CWTHardware'
};

export const TrezorT = {
  vendor: 'trezor.io',
  model: 'T'
};

export const LedgerNanoS = {
  vendor: 'ledger.com',
  model: 'NanoS'
};
