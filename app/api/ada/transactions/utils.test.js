// @flow
import '../lib/test-config';
import BigNumber from 'bignumber.js';
import {
  convertAdaTransactionsToExportRows,
  formatBigNumberToFloatString,
  sumInputsOutputs,
  getFromUserPerspective,
} from './utils';
import type {
  TransactionExportRow,
} from '../../export';
import type {
  UtxoTransactionInputRow,
  UtxoTransactionOutputRow,
} from '../lib/storage/database/transactionModels/utxo/tables';
import type {
  AccountingTransactionInputRow,
  AccountingTransactionOutputRow,
} from '../lib/storage/database/transactionModels/account/tables';
import {
  TxStatusCodes,
} from '../lib/storage/database/primitives/tables';
import type {
  UtxoAnnotatedTransaction,
} from './types';
import {
  transactionTypes,
} from './types';

const _input = (
  x: number,
  id: number,
): UtxoTransactionInputRow => ({
  UtxoTransactionInputId: 0,
  TransactionId: 0,
  AddressId: id,
  ParentTxHash: '',
  IndexInParentTx: 0,
  IndexInOwnTx: 0,
  Amount: x.toString(),
});
const _output = (
  x: number,
  id: number,
): UtxoTransactionOutputRow => ({
  UtxoTransactionOutputId: 0,
  TransactionId: 0,
  AddressId: id,
  OutputIndex: 0,
  Amount: x.toString(),
  IsUnspent: true,
});

const testInputs = [
  _input(2000000, 0),
  _input(5000000, 1),
  _input(1000000, 2),
  _input(2000000, 3),
];

const testOutputs = [
  _output(1000000, 4),
  _output(865567, 5),
  _output(2000000, 6),
  _output(2824676, 7),
  _output(2100000, 8),
  _output(712345, 9),
];

test('convertAdaTransactionsToExportRows - empty', () => {
  const res: Array<TransactionExportRow> = convertAdaTransactionsToExportRows([]);
  _expectEqual(res, []);
});

test('convertAdaTransactionsToExportRows', () => {
  const res: Array<TransactionExportRow> = convertAdaTransactionsToExportRows([
    _tx(
      [testInputs[0]],
      [testOutputs[0], testOutputs[1]],
      [],
      [],
      new Set([4]),
      '2010-01-01 22:12:22',
    ),
    _tx(
      [testInputs[1]],
      [testOutputs[2], testOutputs[3]],
      [],
      [],
      new Set([6]),
      '2012-05-12 11:22:33'
    ),
    _tx(
      [testInputs[2], testInputs[3]],
      [testOutputs[4], testOutputs[5]],
      [],
      [],
      new Set([2, 3, 9]),
      '2015-12-13 10:20:30'
    ),
  ]);
  _expectEqual(res, [
    _expRow('1.0', '0.0', 'in', '2010-01-01 22:12:22'),
    _expRow('2.0', '0.0', 'in', '2012-05-12 11:22:33'),
    _expRow('2.1', `0.${900000 - 712345}`, 'out', '2015-12-13 10:20:30'),
  ]);
});

test('self tx', () => {
  const selfTx = _tx(
    [testInputs[0]],
    [testOutputs[0]],
    [],
    [],
    new Set([0, 4]),
    '2015-12-13 10:20:30'
  );
  expect(selfTx.type).toEqual(transactionTypes.SELF);
  expect(selfTx.amount).toEqual(new BigNumber(0));
  expect(selfTx.fee).toEqual(new BigNumber(-1000000));
});

test('multi tx', () => {
  const selfTx = _tx(
    [testInputs[0], testInputs[1]],
    [testOutputs[0], testOutputs[1]],
    [],
    [],
    new Set([0, 4]),
    '2015-12-13 10:20:30'
  );
  expect(selfTx.type).toEqual(transactionTypes.MULTI);
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
      _input(42, 0),
      _output(43, 0),
      _input(15, 0),
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
  utxoInputs: Array<UtxoTransactionInputRow>,
  utxoOutputs: Array<UtxoTransactionOutputRow>,
  accountingInputs: Array<AccountingTransactionInputRow>,
  accountingOutputs: Array<AccountingTransactionOutputRow>,
  ownedAddresses: Set<number>,
  date: string,
): UtxoAnnotatedTransaction => {
  const annotation = getFromUserPerspective({
    txInputs: utxoInputs,
    txOutputs: utxoOutputs,
    allOwnedAddressIds: ownedAddresses,
  });

  return {
    transaction: {
      TransactionId: 0,
      Digest: 0,
      Hash: 'a',
      Ordinal: 0,
      BlockId: 0,
      LastUpdateTime: 0,
      Status: TxStatusCodes.IN_BLOCK,
      ErrorMessage: null,
    },
    block: {
      BlockId: 0,
      Digest: 0,
      SlotNum: 0,
      Height: 0,
      Hash: '1',
      BlockTime: new Date(date),
    },
    utxoInputs,
    utxoOutputs,
    accountingInputs,
    accountingOutputs,
    ...annotation,
  };
};

const _expRow = (
  amount: string,
  fee: string,
  type: 'in' | 'out',
  date: string
): TransactionExportRow => ({ type, amount, fee, date: new Date(date) });

function _expectEqual(a, b) {
  expect(a).toEqual(b);
}
