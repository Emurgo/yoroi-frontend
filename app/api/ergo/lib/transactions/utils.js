// @flow

import type {
  DbTransaction,
  DbBlock,
} from '../../../ada/lib/storage/database/primitives/tables';
import type {
  UserAnnotation,
} from '../../../ada/transactions/types';
import type { TransactionExportRow } from '../../../export';
import { getErgoCurrencyMeta } from '../../currencyInfo';
import BigNumber from 'bignumber.js';
import { formatBigNumberToFloatString } from '../../../../utils/formatters';
import {
  transactionTypes,
} from '../../../ada/transactions/types';

export function convertErgoTransactionsToExportRows(
  transactions: $ReadOnlyArray<$ReadOnly<{
  ...DbTransaction,
  ...WithNullableFields<DbBlock>,
  ...UserAnnotation,
  ...,
}>>
): Array<TransactionExportRow> {
  const result = [];
  const amountPerUnit = new BigNumber(10).pow(getErgoCurrencyMeta().decimalPlaces);
  for (const tx of transactions) {
    if (tx.block != null) {
      result.push({
        date: tx.block.BlockTime,
        type: tx.type === transactionTypes.INCOME ? 'in' : 'out',
        amount: formatBigNumberToFloatString(tx.amount.abs().dividedBy(amountPerUnit)),
        fee: formatBigNumberToFloatString(tx.fee.abs().dividedBy(amountPerUnit)),
      });
    }
  }
  return result;
}
