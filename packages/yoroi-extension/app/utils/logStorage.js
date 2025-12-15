// @flow
import moment from 'moment';
import type { ConfigType } from '../../config/config-types';

// populated by ConfigWebpackPlugin
declare var CONFIG: ConfigType;
const { logsBufferSize } = CONFIG.app;

declare var chrome;
export type LogContext = 'main' | 'background' | 'connector';

export type LogEntry = {|
  timestamp: string,
  level: 'info' | 'warn' | 'error',
  message: string,
  stack?: string | void,
|};

const STORAGE_KEYS = {
  main: 'yoroi-logs-main',
  background: 'yoroi-logs-background',
  connector: 'yoroi-logs-connector',
};

// Store original console methods at module load time to avoid infinite recursion
// when console methods are overridden (e.g., in background/index.js)
const originalConsole = {
  log: console.log.bind(console),
  info: console.info.bind(console),
  warn: console.warn.bind(console),
  error: console.error.bind(console),
};

// Queue system to serialize storeLog operations per context to prevent race conditions
// Each context has its own queue to ensure atomic read-modify-write operations
type QueueItem = {|
  entry: LogEntry,
  resolve: () => void,
  reject: (error: any) => void,
|};

const writeQueues: { [LogContext]: Array<QueueItem> } = {
  main: [],
  background: [],
  connector: [],
};

const processingFlags: { [LogContext]: boolean } = {
  main: false,
  background: false,
  connector: false,
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
 * Process the write queue for a specific context
 * This ensures atomic read-modify-write operations by serializing all writes
 */
async function processWriteQueue(context: LogContext): Promise<void> {
  // If already processing, return early - the current processor will handle queued items
  if (processingFlags[context]) {
    return;
  }

  processingFlags[context] = true;
  const queue = writeQueues[context];

  try {
    while (queue.length > 0) {
      const item = queue.shift();
      if (!item) {
        continue;
      }

      try {
        await performStoreLog(context, item.entry);
        item.resolve();
      } catch (error) {
        item.reject(error);
      }
    }
  } finally {
    processingFlags[context] = false;

    // Check if new items were added while we were processing
    // This handles the edge case where items are added after the loop exits
    // but before the flag is reset
    if (queue.length > 0) {
      // Schedule another processing run to handle the new items
      const scheduleProcess = typeof setImmediate !== 'undefined' ? setImmediate : fn => setTimeout(fn, 0);
      scheduleProcess(() => {
        processWriteQueue(context).catch(error => {
          originalConsole.error(`Failed to process write queue for context ${context}:`, error);
        });
      });
    }
  }
}

/**
 * Perform the actual storage operation (read-modify-write)
 * This is only called from the queue processor to ensure atomicity
 */
async function performStoreLog(context: LogContext, entry: LogEntry): Promise<void> {
  const storage = getStorageAPI();
  if (!storage) {
    // Fallback: just log to console if storage is not available
    console.log(`[${context}] [${entry.level}] ${entry.message}`);
    return;
  }

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
    const storageObj: { [string]: Array<LogEntry> } = {};
    storageObj[key] = logs;
    storage.set(storageObj, () => {
      if (chrome.runtime && chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
        return;
      }
      resolve();
    });
  });
}

/**
 * Store a log entry in chrome.storage.local
 * Uses a queue system to serialize writes and prevent race conditions
 */
export async function storeLog(context: LogContext, entry: LogEntry): Promise<void> {
  const storage = getStorageAPI();
  if (!storage) {
    // Fallback: just log to console if storage is not available
    console.log(`[${context}] [${entry.level}] ${entry.message}`);
    return;
  }

  // Queue the operation to ensure atomic read-modify-write
  return new Promise<void>((resolve, reject) => {
    writeQueues[context].push({ entry, resolve, reject });

    // Start processing if not already processing
    // If already processing, the current processor will pick up this new item
    // because it's checking queue.length > 0 in a while loop
    if (!processingFlags[context]) {
      const scheduleProcess = typeof setImmediate !== 'undefined' ? setImmediate : fn => setTimeout(fn, 0);
      scheduleProcess(() => {
        processWriteQueue(context).catch(error => {
          // If queue processing fails, log but don't break the app
          originalConsole.error(`Failed to process write queue for context ${context}:`, error);
        });
      });
    }
    // If already processing, no need to schedule - the running processor will handle it
  }).catch(error => {
    // Don't break the app if logging fails
    // Use original console.error to avoid infinite recursion when console methods are overridden
    originalConsole.error(`Failed to store log for context ${context}:`, error);
  });
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
    // Use original console.error to avoid infinite recursion when console methods are overridden
    originalConsole.error(`Failed to retrieve logs for context ${context}:`, error);
    return [];
  }
}

/**
 * Retrieve all logs from all contexts
 */
export async function getAllLogs(): Promise<{|
  main: Array<LogEntry>,
  background: Array<LogEntry>,
  connector: Array<LogEntry>,
|}> {
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
      const storageObj: { [string]: Array<LogEntry> } = {};
      storageObj[key] = [];
      storage.set(storageObj, () => {
        if (chrome.runtime && chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
          return;
        }
        resolve();
      });
    });
  } catch (error) {
    // Use original console.error to avoid infinite recursion when console methods are overridden
    originalConsole.error(`Failed to clear logs for context ${context}:`, error);
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
export function createLogEntry(level: 'info' | 'warn' | 'error', ...args: Array<any>): LogEntry {
  const timestamp = moment().format();
  let message = '';
  let stack: string | void = undefined;

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
        originalConsole.error('Failed to stringify object:', arg, e);
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
