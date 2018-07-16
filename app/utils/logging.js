// @flow
import RingBuffer from 'ringbufferjs';
import moment from 'moment';
import FileSaver from 'file-saver';

import type { ConfigType } from '../../config/config-types';

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
    logger.info(data);
  }
};

export const downloadLogs = () => {
  const toDownload = logs.peekN(logs.size() - 1);
  const blob = new Blob(toDownload, { type: 'text/plain;charset=utf-8' });
  FileSaver.saveAs(blob, `${moment().format()}${logsFileSuffix}`);
};

// ========== STRINGIFY =========

export const stringifyData = (data : any) => JSON.stringify(data, null, 2);

export const stringifyError = (error : any) => (
  JSON.stringify(error, Object.getOwnPropertyNames(error), 2)
);
