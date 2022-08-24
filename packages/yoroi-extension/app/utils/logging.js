// @flow
import RingBuffer from 'ringbufferjs';
import moment from 'moment';
import FileSaver from 'file-saver';
import { inspect } from 'util';

import type { ConfigType } from '../../config/config-types';

import environment from '../environment';

const logger = console;

// populated by ConfigWebpackPlugin
declare var CONFIG: ConfigType;
const { logsBufferSize, logsFileSuffix } = CONFIG.app;
const logs = new RingBuffer(logsBufferSize);

export const Logger = {

  debug: (data : string) => {
    logger.debug(data);
  },

  info: (data : string) => {
    logger.info(data);
  },

  error: (data : string) => {
    // fix format so it shows up properly in Chrome console
    const fixedString = data.replace(/\\n/g, '\n');
    logger.error(fixedString);
    logs.enq(`[${moment().format()}] ${fixedString}\n`);
  },

  warn: (data : string) => {
    logger.warn(data);
  }
};

export const silenceLogsForTesting = () => {
  // hack since we don't have log level filtering
  Logger.debug = () => {};
  Logger.info = () => {};
  Logger.error = () => {};
  Logger.warn = () => {};
};

export const downloadLogs = (publicKey?: string) => {
  const header = generateLogHeader(publicKey);
  let errorLogs = logs.peekN(logs.size());
  if (errorLogs.length === 0) {
    errorLogs = [`[${moment().format()}] No errors logged.`];
  }
  errorLogs.unshift(header);
  const blob = new Blob(errorLogs, { type: 'text/plain;charset=utf-8' });
  FileSaver.saveAs(blob, `${moment().format()}${logsFileSuffix}`);
};

// ========== STRINGIFY =========

export const generateLogHeader = (publicKey?: string): string => {
  let header =
  `[INFO] Yoroi v.${environment.getVersion()}\r\n`
  + `[INFO] Commit: ${environment.commit}\r\n`
  + `[INFO] Network: ${environment.getNetworkName()}\r\n`
  + `[INFO] User Agent: ${stringifyData(environment.userAgentInfo.ua)}\r\n`;

  if (publicKey != null) {
    header += `[INFO] Wallet public key: ${publicKey}\r\n`;
  }
  return header
    + `----\r\n`; // this like should be always the last line of the header block
};

export const stringifyData = (data : any): string => inspect(data);

export const stringifyError = (error : any): string => (
  JSON.stringify(error, Object.getOwnPropertyNames(error), 2)
);

// It should convert all error object into json
// Unlinke `stringifyError` which use a `replacer` to select some fields
export const fullErrStr = (err: any): string  => (
  JSON.stringify(err, null, 2)
)