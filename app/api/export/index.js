// @flow
import moment from 'moment';

import {
  Logger,
  stringifyError,
} from '../../utils/logging';
import LocalizableError from '../../i18n/LocalizableError';

import { sendFileToUser } from './utils';
import { GenericApiError } from '../common';
import type {
  ExportTransactionsRequest,
  ExportTransactionsResponse,
} from '../common';

export type TransactionExportRow = {
  type: 'in' | 'out',
  amount: string,
  fee: string,
  date: Date
}

export type CsvData = {
  headers: Array<string>,
  rows: Array<Array<string>>
}

const TRANSACTION_EXPORT_FILE_TYPE = Object.freeze({
  csv: 'csv'
});
export type TransactionExportFileType = $Values<typeof TRANSACTION_EXPORT_FILE_TYPE>;

const TRANSACTION_EXPORT_DATA_FORMAT = Object.freeze({
  CoinTracking: 'CoinTracking'
});
export type TransactionExportDataFormat = $Values<typeof TRANSACTION_EXPORT_DATA_FORMAT>;

export type ExportFileResponse = {
  data: Blob,
  fileType: TransactionExportFileType
}

const DEFAULT_FILE_NAME_PREFIX = 'Yoroi-Transaction-History';
const FN_SEPARATOR = '_';
const FN_TIME_FORMAT = 'YYYY-MM-DD';

/**
 * This api provides functions to export abstract lists of transactions
 * as files in different formats and different types.
 *
 * Also provides functionality to send abstract byte-blobs as files for user to download.
 */
export default class ExportApi {

  /**
   * Request object MUST contains:
   * - rows: array of export-data
   *
   * No result will be returned. File is sent to user as side-effect.
   */
  exportTransactions = async (
    request : ExportTransactionsRequest
  ): Promise<ExportTransactionsResponse> => {
    try {
      Logger.debug('ExportApi::exportTransactions: called');

      const { rows, format, fileType, fileName } = request;
      const dlFileName = fileName != null ? fileName : ExportApi.createDefaultFileName();
      const data = ExportApi.convertExportRowsToCsv(rows, format);
      const fileResponse = ExportApi.convertCsvDataToFile(data, fileType);

      Logger.debug('ExportApi::exportTransactions: success');
      return await this.sendFileToUser(fileResponse.data, `${dlFileName}.${fileResponse.fileType}`);
    } catch (error) {
      Logger.error('ExportApi::exportTransactions: ' + stringifyError(error));

      if (error instanceof LocalizableError) {
        // we found it as a LocalizableError, so could throw it as it is.
        throw error;
      } else {
        // We don't know what the problem was so throw a generic error
        throw new GenericApiError();
      }
    }
  }

  /**
   * Convert specified abstract rows to a specific data-format.
   */
  static convertExportRowsToCsv(
    rows: Array<TransactionExportRow>,
    format?: TransactionExportDataFormat = TRANSACTION_EXPORT_DATA_FORMAT.CoinTracking
  ): CsvData {
    switch (format) {
      case TRANSACTION_EXPORT_DATA_FORMAT.CoinTracking:
        return _formatExportRowsIntoCoinTrackingFormat(rows);
      default: throw new Error('Unexpected export data format: ' + format);
    }
  }

  /**
   * Convert specified abstract CsvData to a byte-blob of a specific file-type.
   */
  static convertCsvDataToFile(
    data: CsvData,
    fileType?: TransactionExportFileType = TRANSACTION_EXPORT_FILE_TYPE.csv
  ): ExportFileResponse {
    switch (fileType) {
      case TRANSACTION_EXPORT_FILE_TYPE.csv:
        return {
          fileType,
          data: _convertCsvDataIntoCsvBlob(data),
        };
      default: throw new Error('Unexpected file type: ' + fileType);
    }
  }

  /** Creates a default export file name
    * SYNTAX: Yoroi-Transaction-History_YYYY-MM-DD
    * TODO: https://github.com/Emurgo/yoroi-frontend/issues/250 */
  static createDefaultFileName = (): string => (
    DEFAULT_FILE_NAME_PREFIX
    + FN_SEPARATOR
    + moment().format(FN_TIME_FORMAT));

  // noinspection JSMethodCanBeStatic
  /**
   * Make browser to download the specified blob of bytes as a file with the specified name
   */
  async sendFileToUser(data: Blob, fileName: string): Promise<void> {
    return await sendFileToUser(data, fileName);
  }

}

export const COIN_TRACKING_HEADERS = [
  'Type (Trade, IN or OUT)',
  'Buy Amount',
  'Buy Cur.',
  'Sell Amount',
  'Sell Cur.',
  'Fee Amount (optional)',
  'Fee Cur. (optional)',
  'Exchange (optional)',
  'Trade Group (optional)',
  'Comment (optional)',
  'Date'
];

function _formatExportRowsIntoCoinTrackingFormat(rows: Array<TransactionExportRow>): CsvData {
  return {
    headers: COIN_TRACKING_HEADERS,
    rows: rows.map(r => [
      _formatExportRowTypeForCoinTracking(r.type),
      r.type === 'in' ? r.amount : '',
      r.type === 'in' ? 'ADA' : '',
      r.type === 'out' ? r.amount : '',
      r.type === 'out' ? 'ADA' : '',
      r.type === 'out' ? r.fee : '',
      r.type === 'out' ? 'ADA' : '',
      '',
      '',
      '',
      moment(r.date).format('YYYY-MM-DD HH:mm:ss')
    ])
  };
}

function _formatExportRowTypeForCoinTracking(type: string): string {
  switch (type) {
    case 'in': return 'Deposit';
    case 'out': return 'Withdrawal';
    default: throw new Error('Unexpected export row type: ' + type);
  }
}

function _convertCsvDataIntoCsvBlob(data: CsvData): Blob {
  const body = [data.headers, ...data.rows]
    .map(x => x.map(s => `"${s.replace(/"/g, '""')}"`).join(','))
    .join('\n');
  return new Blob([body], {
    type: 'text/csv;charset=utf-8'
  });
}
