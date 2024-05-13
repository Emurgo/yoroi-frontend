// @flow
import '../ada/lib/test-config.forTests'; // TODO: https://github.com/Emurgo/yoroi-frontend/issues/250
import type { CsvData } from './index';
import ExportApi, { COIN_TRACKING_HEADERS } from './index';

test('convert empty rows to CSV-data', () => {
  const data: CsvData = ExportApi.convertExportRowsToCsv('ADA', [], false);
  expect(data).toEqual({
    headers: COIN_TRACKING_HEADERS,
    rows: []
  });
});

test('convert in/out rows to CSV-data', () => {
  const data: CsvData = ExportApi.convertExportRowsToCsv('ADA', [
    { type: 'in', amount: '1.0', fee: '0.1', date: new Date('2010-01-01 22:12:13'), id: 'someid' },
    { type: 'out', amount: '2.0', fee: '0.2', date: new Date('2020-02-02 22:13:14'), id: 'anotherid' },
  ], false);
  expect(data).toEqual({
    headers: COIN_TRACKING_HEADERS,
    rows: [
      ['Deposit', '1.0', 'ADA', '', '', '', '', '', '', '', '2010-01-01 22:12:13'],
      ['Withdrawal', '', '', '2.0', 'ADA', '0.2', 'ADA', '', '', '', '2020-02-02 22:13:14'],
    ]
  });
});

test('convert empty data to CSV file body', async () => {
  const { data, fileType } = ExportApi.convertCsvDataToFile({
    headers: [],
    rows: []
  });
  expect(await extractStringFromBlob(data)).toEqual('');
  expect(fileType).toEqual('csv');
});

test('convert random nonsense to CSV file body', async () => {
  const { data, fileType } = ExportApi.convertCsvDataToFile({
    headers: ['qwe', 'rty', 'qaz'],
    rows: [
      ['a', 'b', 'c'],
      ['d', 'e', 'f'],
    ]
  });
  expect(await extractStringFromBlob(data)).toEqual('"qwe","rty","qaz"\n"a","b","c"\n"d","e","f"');
  expect(fileType).toEqual('csv');
});

async function extractStringFromBlob(b: Blob): Promise<string> {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.addEventListener('loadend', () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      }
    });
    reader.readAsText(b);
  });
}
