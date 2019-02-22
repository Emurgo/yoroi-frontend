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
};

export const WalletTypeOption : {
  WEB_WALLET: WalletType,
  HARDWARE_WALLET: WalletType
} = {
  WEB_WALLET: 'CWTWeb',
  HARDWARE_WALLET: 'CWTHardware'
};
