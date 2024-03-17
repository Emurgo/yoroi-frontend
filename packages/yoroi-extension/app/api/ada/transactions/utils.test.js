// @flow
import '../lib/test-config.forTests';
import BigNumber from 'bignumber.js';
import {
  convertAdaTransactionsToExportRows,
  sumInputsOutputs,
  getFromUserPerspective,
} from './utils';
import {
  formatBigNumberToFloatString,
} from '../../../utils/formatters';
import type {
  TransactionExportRow,
} from '../../export';
import type {
  UtxoTransactionInputRow,
  UtxoTransactionOutputRow,
} from '../lib/storage/database/transactionModels/utxo/tables';
import {
  TxStatusCodes,
} from '../lib/storage/database/primitives/enums';
import {
  transactionTypes,
} from './types';
import {
  TransactionType,
} from '../lib/storage/database/primitives/tables';
import type { CardanoByronTxIO } from '../lib/storage/database/transactionModels/multipart/tables';
import type {
  DbBlock,
  DbTokenInfo,
  TokenListRow,
} from '../lib/storage/database/primitives/tables';
import type {
  UserAnnotation,
} from './types';
import { defaultAssets, networks } from '../lib/storage/database/prepackaged/networks';

const cardanoToken = {
  TokenId: 0,
  Digest: 0,
  ...defaultAssets.filter(
    token => token.NetworkId === networks.CardanoMainnet.NetworkId
  )[0],
};
const tokenTypes = [{
  TokenId: 0,
  Identifier: cardanoToken.Identifier,
  NetworkId: cardanoToken.NetworkId,
}];
const defaultToken = {
  defaultNetworkId: tokenTypes[0].NetworkId,
  defaultIdentifier: tokenTypes[0].Identifier,
};

const _tokenList = (
  amount: number,
  listId: number,
  tokenId: number,
): TokenListRow => ({
  TokenListItemId: 0,
  ListId: listId,
  TokenId: tokenId,
  Amount: amount.toString(),
});

const _input = (
  listId: number,
  id: number,
): UtxoTransactionInputRow => ({
  UtxoTransactionInputId: 0,
  TransactionId: 0,
  AddressId: id,
  ParentTxHash: '',
  IndexInParentTx: 0,
  IndexInOwnTx: 0,
  TokenListId: listId,
});
const _output = (
  listId: number,
  id: number,
): UtxoTransactionOutputRow => ({
  UtxoTransactionOutputId: 0,
  TransactionId: 0,
  AddressId: id,
  OutputIndex: 0,
  TokenListId: listId,
  IsUnspent: true,
  ErgoBoxId: null,
  ErgoCreationHeight: null,
  ErgoTree: null,
  ErgoRegisters: null,
});

function tokenEntry(row: TokenListRow): ReadonlyElementOf<$PropertyType<DbTokenInfo, 'tokens'>> {
  return {
    TokenList: row,
    Token: tokenTypes.filter(token => token.TokenId === row.TokenId)[0],
  }
}

const lists = [
  _tokenList(2000000, 0, tokenTypes[0].TokenId),
  _tokenList(5000000, 1, tokenTypes[0].TokenId),
  _tokenList(1000000, 2, tokenTypes[0].TokenId),
  _tokenList(2000000, 3, tokenTypes[0].TokenId),

  _tokenList(1000000, 4, tokenTypes[0].TokenId),
  _tokenList(865567, 5, tokenTypes[0].TokenId),
  _tokenList(2000000, 6, tokenTypes[0].TokenId),
  _tokenList(2824676, 7, tokenTypes[0].TokenId),
  _tokenList(2100000, 8, tokenTypes[0].TokenId),
  _tokenList(712345, 9, tokenTypes[0].TokenId),
];
const testInputs = [
  _input(lists[0].ListId, 0),
  _input(lists[1].ListId, 1),
  _input(lists[2].ListId, 2),
  _input(lists[3].ListId, 3),
];

const testOutputs = [
  _output(lists[4].ListId, 4),
  _output(lists[5].ListId, 5),
  _output(lists[6].ListId, 6),
  _output(lists[7].ListId, 7),
  _output(lists[8].ListId, 8),
  _output(lists[9].ListId, 9),
];

test('convertAdaTransactionsToExportRows - empty', () => {
  const res: Array<TransactionExportRow> = convertAdaTransactionsToExportRows([], cardanoToken);
  _expectEqual(res, []);
});

test('convertAdaTransactionsToExportRows', () => {
  const res: Array<TransactionExportRow> = convertAdaTransactionsToExportRows([
    _tx(
      [testInputs[0]],
      [testOutputs[0], testOutputs[1]],
      lists.map(list => tokenEntry(list)),
      new Set([4]),
      '2010-01-01 22:12:22',
    ),
    _tx(
      [testInputs[1]],
      [testOutputs[2], testOutputs[3]],
      lists.map(list => tokenEntry(list)),
      new Set([6]),
      '2012-05-12 11:22:33'
    ),
    _tx(
      [testInputs[2], testInputs[3]],
      [testOutputs[4], testOutputs[5]],
      lists.map(list => tokenEntry(list)),
      new Set([2, 3, 9]),
      '2015-12-13 10:20:30'
    ),
  ],
  cardanoToken
  );
  _expectEqual(res, [
    _expRow('1.0', '0.0', 'in', '2010-01-01 22:12:22', 'a'),
    _expRow('2.0', '0.0', 'in', '2012-05-12 11:22:33', 'a'),
    _expRow('2.1', `0.${900000 - 712345}`, 'out', '2015-12-13 10:20:30', 'a'),
  ]);
});

test('self tx', () => {
  const selfTx = _tx(
    [testInputs[0]],
    [testOutputs[0]],
    lists.map(list => tokenEntry(list)),
    new Set([0, 4]),
    '2015-12-13 10:20:30'
  );
  expect(selfTx.type).toEqual(transactionTypes.SELF);
  expect(selfTx.amount.getDefault()).toEqual(new BigNumber(0));
  expect(selfTx.fee.getDefault()).toEqual(new BigNumber(-1000000));
});

test('multi tx', () => {
  const selfTx = _tx(
    [testInputs[0], testInputs[1]],
    [testOutputs[0], testOutputs[1]],
    lists.map(list => tokenEntry(list)),
    new Set([0, 4]),
    '2015-12-13 10:20:30'
  );
  expect(selfTx.type).toEqual(transactionTypes.MULTI);
});

test('sumInputsOutputs - empty', () => {
  _expectEqual(
    sumInputsOutputs(
      [],
      [],
      defaultToken
    ).getDefault(),
    new BigNumber(0)
  );
});

test('sumInputsOutputs', () => {
  _expectEqual(
    sumInputsOutputs(
      [
        _input(lists[0].ListId, 0),
        _output(lists[4].ListId, 0),
        _input(lists[2].ListId, 0),
      ],
      lists.map(list => tokenEntry(list)),
      defaultToken,
    ).getDefault(),
    new BigNumber(4000000)
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
  tokens: $PropertyType<DbTokenInfo, 'tokens'>,
  ownedAddresses: Set<number>,
  date: string,
): {|
  ...CardanoByronTxIO,
  ...WithNullableFields<DbBlock>,
  ...UserAnnotation,
|} => {
  const annotation = getFromUserPerspective({
    utxoInputs,
    utxoOutputs,
    allOwnedAddressIds: ownedAddresses,
    tokens,
    defaultToken,
  });

  return {
    txType: TransactionType.CardanoByron,
    transaction: {
      Type: TransactionType.CardanoByron,
      TransactionId: 0,
      Digest: 0,
      Hash: 'a',
      Ordinal: 0,
      BlockId: 0,
      LastUpdateTime: 0,
      Status: TxStatusCodes.IN_BLOCK,
      ErrorMessage: null,
      Extra: null,
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
    ...annotation,
    tokens,
  };
};

const _expRow = (
  amount: string,
  fee: string,
  type: 'in' | 'out',
  date: string,
  id: string,
): TransactionExportRow => ({ type, amount, fee, date: new Date(date), id });

function _expectEqual(a: any, b: any): void {
  expect(a).toEqual(b);
}
