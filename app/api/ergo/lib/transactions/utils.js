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
import { RustModule } from '../../../ada/lib/cardanoCrypto/rustLoader';
import type { RemoteUnspentOutput } from '../state-fetch/types';

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
  tokenMap: Map<number, Array<{
    amount: number,
    tokenId: string,
    ...
  }>>,
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

export function replaceMockBoxId(utxo: RemoteUnspentOutput): RemoteUnspentOutput {
  const tokens = new RustModule.SigmaRust.Tokens();
  for (const token of (utxo.assets ?? [])) {
    tokens.add(new RustModule.SigmaRust.Token(
      RustModule.SigmaRust.TokenId.from_str(token.tokenId),
      RustModule.SigmaRust.TokenAmount.from_i64(
        RustModule.SigmaRust.I64.from_str(token.amount.toString())
      )
    ));
  }

  const box = new RustModule.SigmaRust.ErgoBox(
    RustModule.SigmaRust.BoxValue.from_i64(
      RustModule.SigmaRust.I64.from_str(utxo.amount)
    ),
    utxo.creationHeight,
    RustModule.SigmaRust.Contract.pay_to_address(
      RustModule.SigmaRust.Address.from_bytes(
        Buffer.from(utxo.receiver, 'hex')
      )
    ),
    RustModule.SigmaRust.TxId.from_str(utxo.tx_hash),
    utxo.tx_index,
    tokens
  );

  return {
    ...utxo,
    boxId: box.box_id().to_str()
  };
}
