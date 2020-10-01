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
import type {
  IGetAllUtxosResponse,
} from '../../../ada/lib/storage/models/PublicDeriver/interfaces';
import type {
  ErgoAddressedUtxo,
} from './types';

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

export function asAddressedUtxo(
  utxos: IGetAllUtxosResponse,
  tokenMap: Map<number, Array<$ReadOnly<{
    amount: number,
    tokenId: string,
    ...
  }>>>,
): Array<ErgoAddressedUtxo> {
  return utxos.map(utxo => {
    const output = utxo.output.UtxoTransactionOutput;
    const tokens = tokenMap.get(output.UtxoTransactionOutputId);
    if (
      output.ErgoCreationHeight == null ||
      output.ErgoBoxId == null ||
      output.ErgoTree == null
    ) {
      throw new Error(`${nameof(asAddressedUtxo)} missing Ergo fields for Ergo UTXO`);
    }
    return {
      amount: output.Amount,
      receiver: utxo.address,
      tx_hash: utxo.output.Transaction.Hash,
      tx_index: utxo.output.UtxoTransactionOutput.OutputIndex,
      addressing: utxo.addressing,
      creationHeight: output.ErgoCreationHeight,
      boxId: output.ErgoBoxId,
      assets: tokens,
      additionalRegisters: undefined, // TODO
      ergoTree: output.ErgoTree,
    };
  });
}
