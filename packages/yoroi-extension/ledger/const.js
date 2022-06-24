// @flow //
import { TRANSPORT_ID } from './types/enum';

export const YOROI_LEDGER_CONNECT_TARGET_NAME = 'YOROI-LEDGER-CONNECT';
export const DEFAULT_LOCALE = 'en-US';
export const ENV = {
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
  isFirefox: !!window.InstallTrigger
};
export const DEFAULT_TRANSPORT_PROTOCOL = ENV.isFirefox
  ? TRANSPORT_ID.WEB_AUTHN
  : TRANSPORT_ID.WEB_HID;
export const DEVICE_LOCK_CHECK_TIMEOUT_MS = 500; // In milli-seconds
export const TRANSPORT_EXCHANGE_TIMEOUT_MS = 120000; // In milli-seconds
export const SUPPORTED_VERSION = `>=2.1.0`; // supported version of the Cardano app
