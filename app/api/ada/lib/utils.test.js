// @flow
import './test-config';
import BigNumber from 'bignumber.js';
import {
  convertAdaTransactionsToExportRows,
  formatBigNumberToFloatString,
  sumInputsOutputs,
} from './utils';
import type {
  TransactionExportRow,
} from '../../export';
import type {
  AdaAmount,
  AdaTransaction,
  AdaTransactionCondition,
} from '../adaTypes';

test('convertAdaTransactionsToExportRows - empty', () => {
  const res: Array<TransactionExportRow> = convertAdaTransactionsToExportRows([]);
  _expectEqual(res, []);
});

test('convertAdaTransactionsToExportRows', () => {
  const res: Array<TransactionExportRow> = convertAdaTransactionsToExportRows([
    _tx([2000000], [1000000, 865567], 1000000, 'in', '2010-01-01 22:12:22'),
    _tx([5000000], [2000000, 2824676], 2000000, 'in', '2012-05-12 11:22:33'),
    _tx([1000000, 2000000], [2100000, 712345], (2100000 + (900000 - 712345)), 'out', '2015-12-13 10:20:30'),
  ]);
  _expectEqual(res, [
    _expRow('1.0', '0.0', 'in', '2010-01-01 22:12:22'),
    _expRow('2.0', '0.0', 'in', '2012-05-12 11:22:33'),
    _expRow('2.1', `0.${900000 - 712345}`, 'out', '2015-12-13 10:20:30'),
  ]);
});

test('sumInputsOutputs - empty', () => {
  _expectEqual(
    sumInputsOutputs([]),
    new BigNumber(0)
  );
});

test('sumInputsOutputs', () => {
  _expectEqual(
    sumInputsOutputs([
      ['qwe', _coin(42)],
      ['rty', _coin(43)],
      ['qaz', _coin(15)],
    ]),
    new BigNumber(42 + 43 + 15)
  );
});

test('formatBigNumberToFloatString', () => {
  const f = formatBigNumberToFloatString;
  const big = (x) => new BigNumber(x);
  _expectEqual(f(big(0)), '0.0');
  _expectEqual(f(big(42)), '42.0');
  _expectEqual(f(big(42).dividedBy(10)), '4.2');
});

const _tx = (
  inputs: Array<number>,
  outputs: Array<number>,
  amount: number, out: 'in' | 'out',
  date: string,
  condition?: AdaTransactionCondition
): AdaTransaction => ({
  ctAmount: _coin(amount),
  ctInputs: inputs.map(x => ['qwe', _coin(x)]),
  ctOutputs: outputs.map(x => ['qwe', _coin(x)]),
  ctIsOutgoing: out === 'out',
  ctMeta: {
    ctmDate: new Date(date),
    ctmDescription: '',  // TODO
    ctmTitle: '',  // TODO
    ctmUpdate: new Date()  // TODO
  },
  ctCondition: condition || 'CPtxInBlocks',
  ctBlockNumber: 0, // TODO
  ctId: '' // TODO
});

const _coin = (x: number): AdaAmount => ({
  getCCoin: x.toString()
});

const _expRow = (
  amount: string,
  fee: string,
  type: 'in' | 'out',
  date: string
): TransactionExportRow => ({ type, amount, fee, date: new Date(date) });

function _expectEqual(a, b) {
  expect(a).toEqual(b);
}
