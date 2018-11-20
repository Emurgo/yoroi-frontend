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
