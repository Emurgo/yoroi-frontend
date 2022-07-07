// @flow //

import { ENV } from '../const';
import { convertStringToDeviceCodeType } from './cmn';
import type { DeviceCodeType } from '../types/enum';

const STORAGE_KEYS = {
  knownDeviceCode: `${ENV.isDevelopment ? 'dev' : 'prod'}-knownDeviceCode`,
};

export const setKnownDeviceCode = (deviceCode: DeviceCodeType): void => {
  window.localStorage.setItem(STORAGE_KEYS.knownDeviceCode, deviceCode);
};

export const getKnownDeviceCode = (): DeviceCodeType => {
  const item = window.localStorage.getItem(STORAGE_KEYS.knownDeviceCode);
  return convertStringToDeviceCodeType(item);
};
