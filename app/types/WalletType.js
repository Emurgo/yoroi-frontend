// @flow
export type WalletType = 'CWTWeb' | 'CWTHardware';

export type WalletHardwareInfo = {
  vendor : string,
  model: string,
  deviceId: string,
  label: string,
  majorVersion: string,
  minorVersion: string,
  patchVersion: string,
  language: string,
  publicMasterKey: string,
};
