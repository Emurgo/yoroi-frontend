// @flow //
import type { BIP32Path } from '@cardano-foundation/ledgerjs-hw-app-cardano';

import type {
  DeviceCodeType,
  TransportIdType,
  OperationNameType,
} from '../types/enum';
import {
  DEVICE_CODE,
  TRANSPORT_ID,
  OPERATION_NAME,
} from '../types/enum';
import { TRANSPORT_EXCHANGE_TIMEOUT_MS } from '../const';

const HARDENED = 0x80000000;

const TUTORIAL_LINK = {};
TUTORIAL_LINK[DEVICE_CODE.NANO_S + OPERATION_NAME.GET_EXTENDED_PUBLIC_KEY] = 'https://youtu.be/CJkMBYGqh84?t=170';
TUTORIAL_LINK[DEVICE_CODE.NANO_S + OPERATION_NAME.GET_EXTENDED_PUBLIC_KEYS] = 'https://youtu.be/CJkMBYGqh84?t=170';
TUTORIAL_LINK[DEVICE_CODE.NANO_S + OPERATION_NAME.SIGN_TX] = 'https://youtu.be/CJkMBYGqh84?t=285';
TUTORIAL_LINK[DEVICE_CODE.NANO_S + OPERATION_NAME.SHOW_ADDRESS] = 'https://youtu.be/CJkMBYGqh84?t=429';
TUTORIAL_LINK[DEVICE_CODE.NANO_S + OPERATION_NAME.DERIVE_ADDRESS] = 'https://youtu.be/CJkMBYGqh84?t=170'; // No Video available and not used in production
TUTORIAL_LINK[DEVICE_CODE.NANO_S + OPERATION_NAME.GET_LEDGER_VERSION] = 'https://youtu.be/CJkMBYGqh84?t=170'; // No Video available and not used in production
TUTORIAL_LINK[DEVICE_CODE.NANO_S + OPERATION_NAME.GET_SERIAL] = 'https://youtu.be/CJkMBYGqh84?t=170'; // No Video available and not used in production

TUTORIAL_LINK[DEVICE_CODE.NANO_X + OPERATION_NAME.GET_EXTENDED_PUBLIC_KEY] = 'https://youtu.be/CJkMBYGqh84?t=170';
TUTORIAL_LINK[DEVICE_CODE.NANO_X + OPERATION_NAME.GET_EXTENDED_PUBLIC_KEYS] = 'https://youtu.be/CJkMBYGqh84?t=170';
TUTORIAL_LINK[DEVICE_CODE.NANO_X + OPERATION_NAME.SIGN_TX] = 'https://youtu.be/CJkMBYGqh84?t=285';
TUTORIAL_LINK[DEVICE_CODE.NANO_X + OPERATION_NAME.SHOW_ADDRESS] = 'https://youtu.be/CJkMBYGqh84?t=429';
TUTORIAL_LINK[DEVICE_CODE.NANO_X + OPERATION_NAME.DERIVE_ADDRESS] = 'https://youtu.be/CJkMBYGqh84?t=170'; // No Video available and not used in production
TUTORIAL_LINK[DEVICE_CODE.NANO_X + OPERATION_NAME.GET_LEDGER_VERSION] = 'https://youtu.be/CJkMBYGqh84?t=170'; // No Video available and not used in production
TUTORIAL_LINK[DEVICE_CODE.NANO_X + OPERATION_NAME.GET_SERIAL] = 'https://youtu.be/CJkMBYGqh84?t=170'; // No Video available and not used in production

/**
 * Converts hardened BIP32Path to it's string version
 * @param {*} hdPath hardened BIP32Path
 */
export const pathToString = (hdPath: BIP32Path) => {
  return `m/${hdPath
    .map((item) => (item % HARDENED) + (item >= HARDENED ? "'" : ''))
    .join('/')}`;
};

/**
 * Converts error code to string
 * @param {*} err
 */
export const ledgerErrToMessage = (err: any): any => {
  const isU2FError = (error) => !!error && !!(error).metaData;
  const isStringError = (error) => typeof error === 'string';

  // https://developers.yubico.com/U2F/Libraries/Client_error_codes.html
  const isErrorWithId = (error) => (
    Object.prototype.hasOwnProperty.call(error, 'id') &&
    Object.prototype.hasOwnProperty.call(error, 'message')
  );

  if (isU2FError(err)) {
    // Timeout
    if (err.metaData.code === 5) {
      return 'LEDGER_TIMEOUT';
    }
    return err.metaData.type;
  }

  if (isStringError(err)) {
    // Wrong app logged into
    if (err.includes('6804')) {
      return 'LEDGER_WRONG_APP';
    }
    // Ledger locked
    if (err.includes('6801')) {
      return 'LEDGER_LOCKED';
    }
    return err;
  }

  if (isErrorWithId(err)) {
    // Browser doesn't support U2F
    if (err.message.includes('U2F not supported')) {
      return 'U2F_NOT_SUPPORTED';
    }
  }

  // Other
  return err.toString();
};

/**
 * Create Ledger Transport protocol
 * @param {*} transportId TransportIdType
 */
export const makeTransport = async (transportId: TransportIdType): any => {
  let transportFactory;

  switch (transportId) {
    case TRANSPORT_ID.WEB_AUTHN:
      transportFactory = require('@ledgerhq/hw-transport-webauthn').default;
      break;
    case TRANSPORT_ID.U2F:
      transportFactory = require('@ledgerhq/hw-transport-u2f').default;
      break;
    case TRANSPORT_ID.WEB_USB:
      transportFactory = require('@ledgerhq/hw-transport-webusb').default;
      break;
    case TRANSPORT_ID.WEB_HID:
      transportFactory = require('@ledgerhq/hw-transport-webhid').default;
      break;
    default:
      throw new Error('Transport protocol not supported');
  }

  const transport = await transportFactory.create();
  transport.exchangeTimeout = TRANSPORT_EXCHANGE_TIMEOUT_MS;

  return transport;
};

/**
 * Converts deviceCodeInString to DeviceCodeType
 * @param {*} deviceCodeInString string
 */
export const convertStringToDeviceCodeType = (deviceCodeInString: string): DeviceCodeType => {
  switch (deviceCodeInString) {
    case DEVICE_CODE.NANO_S:
      return DEVICE_CODE.NANO_S;
    case DEVICE_CODE.NANO_X:
      return DEVICE_CODE.NANO_X;
    default:
      return DEVICE_CODE.NONE;
  }
};

/**
 * Simply filter some unwanted keys and return as string
 * @param {*} err Error object
 * @returns string
 */
export const formatError = (err: any): string => {
  if (err == null) {
    return 'null';
  }

  const ngFilter = (keyName) => {
    if (keyName === 'stack') {
      return false;
    }
    return true;
  };

  const formatted = Object.keys(err)
    .filter(key => ngFilter(key))
    .reduce((obj, key) => {
      obj[key] = err[key];
      return obj;
    }, {});

  return `\nERROR:${JSON.stringify(formatted, null, 2)}`;
};

/**
 * Returns tutorial link based on device code and operationName name
 *
 * @param {*} deviceCode DeviceCodeType
 * @param {*} operationName OperationNameType
 * @returns string
 */
export const getTutorialLink = (
  deviceCode: DeviceCodeType,
  operationName: OperationNameType
): string => {
  if (deviceCode == null || deviceCode === DEVICE_CODE.NONE) throw new Error('No tutorial is available for un-known device type');
  if (operationName == null || operationName === OPERATION_NAME.CLOSE_WINDOW) throw new Error('No tutorial for CLOSE_WINDOW operation');

  return TUTORIAL_LINK[deviceCode + operationName];
};
