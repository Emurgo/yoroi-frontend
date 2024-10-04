// @flow
import moment from 'moment';
import { inspect } from 'util';
import type { ConfigType } from '../../config/config-types';
import environment from '../environment';

const logger = console;

// populated by ConfigWebpackPlugin
declare var CONFIG: ConfigType;
const { logsBufferSize, logsFileSuffix } = CONFIG.app;
const errors = [];

function pushError(s: string): void {
  errors.push(s);
  if (errors.length > logsBufferSize) {
    errors.shift();
  }
}

export const Logger = {

  debug: (...args: any[]) => {
    logger.debug(...args);
  },

  info: (...args: any[]) => {
    logger.info(...args);
  },

  error: (data : string) => {
    // fix format so it shows up properly in Chrome console
    const fixedString = data.replace(/\\n/g, '\n');
    logger.error(fixedString);
    pushError(`[${moment().format()}] ${fixedString}\n`);
  },

  warn: (...args: any[]) => {
    logger.warn(...args);
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
  let errorLogs = [...errors];
  if (errorLogs.length === 0) {
    errorLogs = [`[${moment().format()}] No errors logged.`];
  }
  errorLogs.unshift(header);
  const blob = new Blob(errorLogs, { type: 'text/plain;charset=utf-8' });

  import('file-saver').then(FileSaver => {
    FileSaver.saveAs(blob, `${moment().format()}${logsFileSuffix}`);
  });
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

// It should convert the whole error object into json
// Unlike `stringifyError` which use a `replacer` to select some fields
export const fullErrStr = (err: any): string  => (
  JSON.stringify(err, null, 2)
)
