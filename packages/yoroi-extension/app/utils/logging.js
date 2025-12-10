//@flow
import moment from 'moment';
import { inspect } from 'util';
import type { ConfigType } from '../../config/config-types';
import environment from '../environment';
import { storeLog, createLogEntry, getAllLogs, formatLogEntry } from './logStorage';

const logger = console;

// populated by ConfigWebpackPlugin
declare var CONFIG: ConfigType;
const { logsBufferSize, logsFileSuffix } = CONFIG.app;
const errors: string[] = [];

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
    // Store in chrome.storage for main window context
    storeLog('main', createLogEntry('info', ...args)).catch(() => {
      // Ignore storage errors
    });
  },

  error: (data: string) => {
    // fix format so it shows up properly in Chrome console
    const fixedString = data.replace(/\\n/g, '\n');
    logger.error(fixedString);
    pushError(`[${moment().format()}] ${fixedString}\n`);
    // Store in chrome.storage for main window context
    storeLog('main', createLogEntry('error', fixedString)).catch(() => {
      // Ignore storage errors
    });
  },

  warn: (...args: any[]) => {
    logger.warn(...args);
    // Store in chrome.storage for main window context
    storeLog('main', createLogEntry('warn', ...args)).catch(() => {
      // Ignore storage errors
    });
  },
};

export const silenceLogsForTesting = () => {
  // hack since we don't have log level filtering
  Logger.debug = () => {};
  Logger.info = () => {};
  Logger.error = () => {};
  Logger.warn = () => {};
};

export const downloadLogs = async (publicKey?: string): Promise<void> => {
  try {
    const header = generateLogHeader(publicKey);
    const timestamp = moment().format('YYYY-MM-DDTHH-mm-ss');

    // Collect logs from all contexts
    const allLogs = await getAllLogs();

    // Import JSZip dynamically
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();

    // Helper function to format logs for a file
    const formatLogsForFile = (logs: Array<any>, contextName: string): string => {
      if (logs.length === 0) {
        return `${header}[${moment().format()}] No logs found for ${contextName}.\n`;
      }

      const formattedLogs = logs.map(log => {
        if (typeof log === 'string') {
          // Legacy format (from errors array)
          return log;
        }
        // New format (from logStorage)
        return formatLogEntry(log);
      });

      return header + formattedLogs.join('\n');
    };

    // Add main window logs
    const mainLogsContent = formatLogsForFile(allLogs.main, 'main window');
    zip.file('main_window.log', mainLogsContent);

    // Add background service logs
    const backgroundLogsContent = formatLogsForFile(allLogs.background, 'background service');
    zip.file('background_service.log', backgroundLogsContent);

    // Add connector logs
    const connectorLogsContent = formatLogsForFile(allLogs.connector, 'main window connector');
    zip.file('main_window_connector.log', connectorLogsContent);

    // Also include legacy errors array for backward compatibility
    if (errors.length > 0) {
      const legacyErrorsContent = header + errors.join('');
      zip.file('legacy_errors.log', legacyErrorsContent);
    }

    // Generate zip file
    const zipBlob = await zip.generateAsync({ type: 'blob' });

    // Download the zip file
    const FileSaver = (await import('file-saver')).default;
    FileSaver.saveAs(zipBlob, `${timestamp}-yoroi-logs.zip`);
  } catch (error) {
    // Fallback to old behavior if zip creation fails
    Logger.error(`error when downloading logs, falling back to single file: ${error}`);

    const header = generateLogHeader(publicKey);
    let errorLogs = [...errors];
    if (errorLogs.length === 0) {
      errorLogs = [`[${moment().format()}] No errors logged.`];
    }
    errorLogs.unshift(header);
    const blob = new Blob(errorLogs, { type: 'text/plain;charset=utf-8' });

    import('file-saver')
      .then(FileSaver => {
        FileSaver.default.saveAs(blob, `${moment().format()}${logsFileSuffix}`);
        return null;
      })
      .catch(fallbackError => {
        Logger.error(`error when downloading error log ${fallbackError}`);
      });
  }
};

// ========== STRINGIFY =========

export const generateLogHeader = (publicKey?: string): string => {
  let header =
    `[INFO] Yoroi v.${environment.getVersion()}\r\n` +
    `[INFO] Commit: ${environment.commit}\r\n` +
    `[INFO] Network: ${environment.getNetworkName()}\r\n` +
    `[INFO] User Agent: ${stringifyData(environment.userAgentInfo.ua)}\r\n`;

  if (publicKey != null) {
    header += `[INFO] Wallet public key: ${publicKey}\r\n`;
  }
  return header + `----\r\n`; // this like should be always the last line of the header block
};

export const stringifyData = (data: any): string => inspect(data);

export const stringifyError = (error: any): string => JSON.stringify(error, Object.getOwnPropertyNames(error), 2);

// It should convert the whole error object into json
// Unlike `stringifyError` which use a `replacer` to select some fields
export const fullErrStr = (err: any): string => JSON.stringify(err, null, 2);
