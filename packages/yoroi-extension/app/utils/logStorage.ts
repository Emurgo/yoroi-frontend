// @flow
import moment from 'moment';
import type { ConfigType } from '../../config/config-types';

// populated by ConfigWebpackPlugin
declare var CONFIG: ConfigType;
const { logsBufferSize } = CONFIG.app;

declare var chrome;
export type LogContext = 'main' | 'background' | 'connector';

export type LogEntry = {
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  stack?: string | void;
};

const STORAGE_KEYS = {
  main: 'yoroi-logs-main',
  background: 'yoroi-logs-background',
  connector: 'yoroi-logs-connector',
};

/**
 * Get the storage API (works in both extension and web contexts)
 */
function getStorageAPI(): any {
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    return chrome.storage.local;
  }
  // Fallback to localStorage for web context (testing)
  return null;
}

/**
 * Store a log entry in chrome.storage.local
 */
export async function storeLog(context: LogContext, entry: LogEntry): Promise<void> {
  const storage = getStorageAPI();
  if (!storage) {
    // Fallback: just log to console if storage is not available
    console.log(`[${context}] [${entry.level}] ${entry.message}`);
    return;
  }

  try {
    const key = STORAGE_KEYS[context];
    const result = await new Promise((resolve, reject) => {
      storage.get(key, data => {
        if (chrome.runtime && chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
          return;
        }
        resolve(data[key] || []);
      });
    });

    const logs: Array<LogEntry> = Array.isArray(result) ? result : [];
    logs.push(entry);

    // Maintain buffer size limit
    if (logs.length > logsBufferSize) {
      logs.shift();
    }

    await new Promise<void>((resolve, reject) => {
      storage.set({ [key]: logs }, () => {
        if (chrome.runtime && chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
          return;
        }
        resolve();
      });
    });
  } catch (error) {
    // Don't break the app if logging fails
    console.error(`Failed to store log for context ${context}:`, error);
  }
}

/**
 * Retrieve all logs for a specific context
 */
export async function getLogs(context: LogContext): Promise<Array<LogEntry>> {
  const storage = getStorageAPI();
  if (!storage) {
    return [];
  }

  try {
    const key = STORAGE_KEYS[context];
    const result = await new Promise((resolve, reject) => {
      storage.get(key, data => {
        if (chrome.runtime && chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
          return;
        }
        resolve(data[key] || []);
      });
    });

    return Array.isArray(result) ? result : [];
  } catch (error) {
    console.error(`Failed to retrieve logs for context ${context}:`, error);
    return [];
  }
}

/**
 * Retrieve all logs from all contexts
 */
export async function getAllLogs(): Promise<{
  main: Array<LogEntry>;
  background: Array<LogEntry>;
  connector: Array<LogEntry>;
}> {
  const [main, background, connector] = await Promise.all([getLogs('main'), getLogs('background'), getLogs('connector')]);

  return { main, background, connector };
}

/**
 * Clear logs for a specific context
 */
export async function clearLogs(context: LogContext): Promise<void> {
  const storage = getStorageAPI();
  if (!storage) {
    return;
  }

  try {
    const key = STORAGE_KEYS[context];
    await new Promise<void>((resolve, reject) => {
      storage.set({ [key]: [] }, () => {
        if (chrome.runtime && chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
          return;
        }
        resolve();
      });
    });
  } catch (error) {
    console.error(`Failed to clear logs for context ${context}:`, error);
  }
}

/**
 * Format a log entry as a string
 */
export function formatLogEntry(entry: LogEntry): string {
  let formatted = `[${entry.timestamp}] [${entry.level.toUpperCase()}] ${entry.message}`;
  if (entry.stack) {
    formatted += `\n${entry.stack}`;
  }
  return formatted;
}

/**
 * Create a log entry from console arguments
 */
export function createLogEntry(level: 'debug' | 'info' | 'warn' | 'error', ...args: Array<any>): LogEntry {
  const timestamp = moment().format();
  let message = '';
  let stack: string | void = '';

  // Convert arguments to string
  const parts = args.map(arg => {
    if (arg instanceof Error) {
      stack = arg.stack;
      return arg.toString();
    }
    if (typeof arg === 'object') {
      try {
        return JSON.stringify(arg, null, 2);
      } catch (e) {
        return String(arg);
      }
    }
    return String(arg);
  });

  message = parts.join(' ');

  return {
    timestamp,
    level,
    message,
    stack,
  };
}
