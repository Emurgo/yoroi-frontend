// @flow
import RingBuffer from 'ringbufferjs';
import moment from 'moment';
import FileSaver from 'file-saver';

import type { ConfigType } from '../../config/config-types';

import environment from '../environment';

export const version = require('../../chrome/manifest.' + environment.NETWORK + '.json').version;

const logger = console;
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
    logger.error(data);
    logs.enq(`[${moment().format()}] ${data}\n`);
  },

  warn: (data : string) => {
    logger.warn(data);
  }
};

export const downloadLogs = () => {
  const header = generateLogHeader();
  let errorLogs = logs.peekN(logs.size());
  if (errorLogs.length === 0) {
    errorLogs = [`[${moment().format()}] No errors logged.`];
  }
  errorLogs.unshift(header);
  const blob = new Blob(errorLogs, { type: 'text/plain;charset=utf-8' });
  FileSaver.saveAs(blob, `${moment().format()}${logsFileSuffix}`);
};

// ========== STRINGIFY =========

export const generateLogHeader = () => (
  `[INFO] Yoroi v.${version}\r\n[INFO] Commit: ${environment.commit}\r\n[INFO] Network: ${environment.NETWORK}\r\n`
);

export const stringifyData = (data : any) => JSON.stringify(data, null, 2);

export const stringifyError = (error : any) => (
  JSON.stringify(error, Object.getOwnPropertyNames(error), 2)
);
