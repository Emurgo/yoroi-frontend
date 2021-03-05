// @flow

import type {
  DbTransaction,
  DbBlock,
  TokenRow,
} from '../../../ada/lib/storage/database/primitives/tables';
import {
  PRIMARY_ASSET_CONSTANTS,
} from '../../../ada/lib/storage/database/primitives/enums';
import type {
  UserAnnotation,
} from '../../../ada/transactions/types';
import type { TransactionExportRow } from '../../../export';
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
import {
  MultiToken,
} from '../../../common/lib/MultiToken';

export function convertErgoTransactionsToExportRows(
  transactions: $ReadOnlyArray<$ReadOnly<{
    ...DbTransaction,
    ...WithNullableFields<DbBlock>,
    ...UserAnnotation,
    ...,
  }>>,
  defaultAssetRow: $ReadOnly<TokenRow>,
): Array<TransactionExportRow> {
  const result = [];
  for (const tx of transactions) {
    if (tx.block != null) {
      result.push({
        date: tx.block.BlockTime,
        type: tx.type === transactionTypes.INCOME ? 'in' : 'out',
        amount: formatBigNumberToFloatString(
          tx.amount.get(defaultAssetRow.Identifier)
            ?.abs()
            .shiftedBy(-defaultAssetRow.Metadata.numberOfDecimals)
            ?? new BigNumber(0)
        ),
        fee: formatBigNumberToFloatString(
          tx.fee.get(defaultAssetRow.Identifier)
            ?.abs()
            .shiftedBy(-defaultAssetRow.Metadata.numberOfDecimals)
            ?? new BigNumber(0)
        ),
      });
    }
  }
  return result;
}

export function asAddressedUtxo(
  utxos: IGetAllUtxosResponse,
): Array<ErgoAddressedUtxo> {
  return utxos.map(utxo => {
    const output = utxo.output.UtxoTransactionOutput;
    if (
      output.ErgoCreationHeight == null ||
      output.ErgoBoxId == null ||
      output.ErgoTree == null
    ) {
      throw new Error(`${nameof(asAddressedUtxo)} missing Ergo fields for Ergo UTXO`);
    }
    const { ErgoCreationHeight, ErgoBoxId, ErgoTree } = output;

    const tokenTypes = utxo.output.tokens.reduce(
      (acc, next) => {
        if (next.Token.Identifier === PRIMARY_ASSET_CONSTANTS.Ergo) {
          acc.amount = acc.amount.plus(next.TokenList.Amount);
        } else {
          acc.tokens.push({
            amount: Number(next.TokenList.Amount),
            tokenId: next.Token.Identifier,
          });
        }
        return acc;
      },
      {
        amount: new BigNumber(0),
        tokens: [],
      }
    );

    return {
      amount: tokenTypes.amount.toString(),
      receiver: utxo.address,
      tx_hash: utxo.output.Transaction.Hash,
      tx_index: utxo.output.UtxoTransactionOutput.OutputIndex,
      addressing: utxo.addressing,
      creationHeight: ErgoCreationHeight,
      boxId: ErgoBoxId,
      assets: tokenTypes.tokens,
      additionalRegisters: utxo.output.UtxoTransactionOutput.ErgoRegisters == null
        ? undefined
        : JSON.parse(utxo.output.UtxoTransactionOutput.ErgoRegisters),
      ergoTree: ErgoTree,
    };
  });
}

export function toErgoBoxJSON(
  utxos: Array<RemoteUnspentOutput>
): Array<ErgoBoxJson> {
  return utxos.map(utxo => {
      return {
        boxId: utxo.boxId,
        value: Number.parseInt(utxo.amount, 10),
        ergoTree: utxo.ergoTree,
        assets: (utxo.assets ?? []).map(asset => ({
          amount: asset.amount,
          tokenId: asset.tokenId,
        })),
        creationHeight: utxo.creationHeight,
        additionalRegisters: utxo.additionalRegisters || Object.freeze({}),
        transactionId: utxo.tx_hash,
        index: utxo.tx_index,
      };
    })
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

  // TODO: no way to add registers to constructor in sigma-rust at this time

  return {
    ...utxo,
    boxId: box.box_id().to_str()
  };
}

export function multiTokenFromRemote(
  utxo: $ReadOnly<{
    ...RemoteUnspentOutput,
    ...,
  }>,
  networkId: number,
): MultiToken {
  const result = new MultiToken(
    [],
    {
      defaultNetworkId: networkId,
      defaultIdentifier: PRIMARY_ASSET_CONSTANTS.Ergo,
    }
  );
  result.add({
    identifier: PRIMARY_ASSET_CONSTANTS.Ergo,
    amount: new BigNumber(utxo.amount),
    networkId,
  });
  for (const token of (utxo.assets ?? [])) {
    result.add({
      identifier: token.tokenId,
      amount: new BigNumber(token.amount),
      networkId,
    });
  }

  return result;
}
