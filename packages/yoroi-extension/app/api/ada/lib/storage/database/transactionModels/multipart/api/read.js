// @flow

import type {
  lf$Database,
  lf$Transaction,
} from 'lovefield';
import type {
  TransactionRow,
} from '../../../primitives/tables';
import { TransactionType } from '../../../primitives/tables';
import { GetCertificates, AssociateToken } from '../../../primitives/api/read';
import type { CardanoByronTxIO, CardanoShelleyTxIO } from '../tables';

import {
  AssociateTxWithAccountingIOs,
} from '../../account/api/read';
import {
  AssociateTxWithUtxoIOs,
} from '../../utxo/api/read';

const getOrThrow = function<T> (input: T | void): T {
  if (input == null) throw new Error(`${nameof(getOrThrow)} no tx part found. Should never happen`);
  return input;
};

export class CardanoByronAssociateTxWithIOs {
  static ownTables: {||} = Object.freeze({});
  static depTables: {|
    AssociateTxWithUtxoIOs: typeof AssociateTxWithUtxoIOs,
    AssociateToken: typeof AssociateToken,
  |} = Object.freeze({
    AssociateTxWithUtxoIOs,
    AssociateToken,
  });

  static async getIOsForTx(
    db: lf$Database,
    tx: lf$Transaction,
    request: {|
      txs: $ReadOnlyArray<$ReadOnly<TransactionRow>>,
      networkId: number,
    |},
  ): Promise<Array<CardanoByronTxIO>> {
    const utxo = await CardanoByronAssociateTxWithIOs.depTables.AssociateTxWithUtxoIOs.getIOsForTx(
      db, tx, { txs: request.txs }
    );

    const tokens = await CardanoByronAssociateTxWithIOs.depTables.AssociateToken.join(
      db, tx,
      {
        listIds: request.txs.flatMap(transaction => {
          const inputs = getOrThrow(utxo.get(transaction));
          return [
            ...inputs.utxoInputs.map(input => input.TokenListId),
            ...inputs.utxoOutputs.map(input => input.TokenListId),
          ];
        }),
        networkId: request.networkId,
      }
    );

    const fullTx = request.txs.map(transaction  => ({
      txType: TransactionType.CardanoByron,
      transaction,
      ...getOrThrow(utxo.get(transaction)),
      tokens: tokens.map(token => ({
        TokenList: token.TokenList,
        Token: {
          TokenId: token.Token.TokenId,
          Identifier: token.Token.Identifier,
          NetworkId: token.Token.NetworkId,
        },
      })),
    }));
    return fullTx;
  }
}

export class CardanoShelleyAssociateTxWithIOs {
  static ownTables: {||} = Object.freeze({});
  static depTables: {|
    AssociateTxWithUtxoIOs: typeof AssociateTxWithUtxoIOs,
    GetCertificates: typeof GetCertificates,
    AssociateTxWithAccountingIOs: typeof AssociateTxWithAccountingIOs,
    AssociateToken: typeof AssociateToken,
  |} = Object.freeze({
    AssociateTxWithUtxoIOs,
    GetCertificates,
    AssociateTxWithAccountingIOs,
    AssociateToken,
  });

  static async getIOsForTx(
    db: lf$Database,
    tx: lf$Transaction,
    request: {|
      txs: $ReadOnlyArray<$ReadOnly<TransactionRow>>,
      networkId: number,
    |},
  ): Promise<Array<CardanoShelleyTxIO>> {
    const { depTables } = CardanoShelleyAssociateTxWithIOs;
    const utxo = await depTables.AssociateTxWithUtxoIOs.getIOsForTx(
      db, tx, { txs: request.txs }
    );
    const accounting = await depTables.AssociateTxWithAccountingIOs.getIOsForTx(
      db, tx, { txs: request.txs }
    );

    const certsForTxs = await depTables.GetCertificates.forTransactions(
      db, tx,
      { txIds: request.txs.map(transaction => transaction.TransactionId) },
    );

    const _tokens = await CardanoByronAssociateTxWithIOs.depTables.AssociateToken.join(
      db, tx,
      {
        listIds: request.txs.flatMap(transaction => {
          const utxoEntries = getOrThrow(utxo.get(transaction));
          const accountingEntries = getOrThrow(accounting.get(transaction));
          return [
            ...utxoEntries.utxoInputs.map(entry => entry.TokenListId),
            ...utxoEntries.utxoOutputs.map(entry => entry.TokenListId),
            ...accountingEntries.accountingInputs.map(entry => entry.TokenListId),
            ...accountingEntries.accountingOutputs.map(entry => entry.TokenListId),
          ];
        }),
        networkId: request.networkId,
      }
    );
    const tokens = _tokens.map(token => ({
      TokenList: token.TokenList,
      Token: {
        TokenId: token.Token.TokenId,
        Identifier: token.Token.Identifier,
        NetworkId: token.Token.NetworkId,
      }
    }));

    const fullTx = request.txs.map(transaction  => ({
      txType: TransactionType.CardanoShelley,
      transaction,
      certificates: certsForTxs.get(transaction.TransactionId) ?? [],
      ...getOrThrow(utxo.get(transaction)),
      accountingInputs: getOrThrow(accounting.get(transaction)).accountingInputs,
      tokens,
    }));
    return fullTx;
  }
}
