import moment from 'moment';
import { sendFileToUser } from './utils';

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

export type TransactionExportFileType = 'csv';
export type TransactionExportDataFormat = 'CoinTracking';

export type ExportFileResponse = {
  data: Blob,
  fileType: TransactionExportFileType
}

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
   * - fileName: only name without extension
   *
   * No result will be returned. File is sent to user as side-effect.
   */
  async exportTransactions(request : {
    rows: Array<TransactionExportRow>,
    format?: TransactionExportDataFormat,
    fileType?: TransactionExportFileType,
    fileName: string
  }): Promise<void> {
    const { rows, format, fileType, fileName } = request;
    const data = ExportApi.convertExportRowsToCsv(rows, format);
    const fileResponse = ExportApi.convertCsvDataToFile(data, fileType);
    return await this.sendFileToUser(fileResponse.data, `${fileName}.${fileResponse.fileType}`);
  }

  /**
   * Convert specified abstract rows to a specific data-format.
   */
  static convertExportRowsToCsv(
    rows: Array<TransactionExportRow>,
    format?: TransactionExportDataFormat
  ): CsvData {
    switch (format || 'CoinTracking') {
      case 'CoinTracking': return _formatExportRowsIntoCoinTrackingFormat(rows);
      default: throw new Error('Unexpected export data format: ' + format);
    }
  }

  /**
   * Convert specified abstract CsvData to a byte-blob of a specific file-type.
   */
  static convertCsvDataToFile(
    data: CsvData,
    fileType?: TransactionExportFileType
  ): ExportFileResponse {
    fileType = fileType || 'csv';
    switch (fileType) {
      case 'csv': return {
        data: _convertCsvDataIntoCsvBlob(data),
        fileType
      };
      default: throw new Error('Unexpected file type: ' + fileType);
    }
  }

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
