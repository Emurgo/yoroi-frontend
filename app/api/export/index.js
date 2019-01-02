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
 * This api layer provides access to the electron local storage
 * for user settings that are not synced with any coin backend.
 */

export default class ExportApi {

  /**
   * Request object MUST contains:
   * - rows: array of export-data
   * - fileName: only name without extension
   *
   * No result will be returned. File is sent to user as side-effect.
   */
  exportTransactions(request : {
    rows: Array<TransactionExportRow>,
    format?: TransactionExportDataFormat,
    fileType?: TransactionExportFileType,
    fileName: string
  }) {
    const { rows, format, fileType, fileName } = request;
    const data = ExportApi.convertExportRowsToCsv(rows, format);
    const fileResponse = ExportApi.convertCsvDataToFile(data, fileType);
    this.sendFileToUser(fileResponse.data, `${fileName}.${fileResponse.fileType}`);
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
        data: new Blob([_writeCsvDataIntoCsvFile(data)], {
          type: 'text/csv;charset=utf-8'
        }),
        fileType
      };
      default: throw new Error('Unexpected file type: ' + fileType);
    }
  }

  // noinspection JSMethodCanBeStatic
  /**
   * Make browser to download the specified blob of bytes as a file with the specified name
   */
  sendFileToUser(data: Blob, fileName: string) {
    sendFileToUser(data, fileName);
  }

}

function _formatExportRowsIntoCoinTrackingFormat(rows: Array<TransactionExportRow>): CsvData {
  return {
    headers: [
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
    ],
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

function _writeCsvDataIntoCsvFile(data: CsvData): string {
  return [data.headers, ...data.rows]
    .map(x => x.map(s => `"${s.replace(/"/g, '""')}"`).join(','))
    .join('\n');
}
