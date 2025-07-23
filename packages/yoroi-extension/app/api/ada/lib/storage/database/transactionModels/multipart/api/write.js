// @flow

import type {
  lf$Database,
  lf$Transaction,
} from 'lovefield';
import type {
  BlockInsert,
  TransactionInsert,
  DbBlock,
  TokenListInsert,
} from '../../../primitives/tables';
import { TransactionType, } from '../../../primitives/tables';
import type {
  CardanoByronTxIO,
  CardanoShelleyTxIO,
} from '../tables';
import type {
  UtxoTransactionInputInsert,
  UtxoTransactionOutputInsert,
} from '../../utxo/tables';
import type {
  AccountingTransactionInputInsert,
} from '../../account/tables';
import { ModifyTransaction, ModifyCertificate, ModifyTokenList } from '../../../primitives/api/write';
import type { AddCertificateRequest } from '../../../primitives/api/write';
import { ModifyUtxoTransaction } from '../../utxo/api/write';
import { ModifyAccountingTransaction } from '../../account/api/write';

export class ModifyCardanoByronTx {
  static ownTables: {||} = Object.freeze({});
  static depTables: {|
    ModifyTransaction: typeof ModifyTransaction,
    ModifyUtxoTransaction: typeof ModifyUtxoTransaction,
    ModifyTokenList: typeof ModifyTokenList,
  |} = Object.freeze({
    ModifyTransaction,
    ModifyUtxoTransaction,
    ModifyTokenList,
  });

  static async addTxWithIOs(
    db: lf$Database,
    tx: lf$Transaction,
    request: {|
      block: null | BlockInsert,
      transaction: (blockId: null | number) => TransactionInsert,
      ioGen: (txRowId: number) => {|
        utxoInputs: Array<UtxoTransactionInputInsert>,
        utxoOutputs: Array<UtxoTransactionOutputInsert>,
        tokenList: Array<{|
          TokenList: TokenListInsert,
          identifier: string,
          networkId: number,
        |}>,
      |},
    |},
  ): Promise<{|
    ...WithNullableFields<DbBlock>,
    ...CardanoByronTxIO,
  |}> {
    const {
      block, transaction,
    } = request;

    const newTx = await ModifyCardanoByronTx.depTables.ModifyTransaction.addNew(
      db, tx,
      { block, transaction, }
    );

    const {
      utxoInputs, utxoOutputs,
      tokenList,
    } = request.ioGen(newTx.transaction.TransactionId);

    const utxo = await ModifyCardanoByronTx.depTables.ModifyUtxoTransaction.addIOsToTx(
      db, tx, {
        utxoInputs, utxoOutputs,
      }
    );

    // add assets
    const newTokenListEntries = await ModifyCardanoByronTx.depTables.ModifyTokenList.upsert(
      db, tx,
      tokenList.map(entry => entry.TokenList)
    );

    return {
      txType: TransactionType.CardanoByron,
      ...newTx,
      ...utxo,
      tokens: newTokenListEntries.map(entry => ({
        TokenList: entry,
        Token: {
          TokenId: entry.TokenId,
          Identifier: tokenList.filter(
            item => item.TokenList.TokenId === entry.TokenId
          )[0].identifier,
          NetworkId: tokenList.filter(
            item => item.TokenList.TokenId === entry.TokenId
          )[0].networkId,
        }
      })),
    };
  }
}

export class ModifyCardanoShelleyTx {
  static ownTables: {||} = Object.freeze({});
  static depTables: {|
    ModifyTransaction: typeof ModifyTransaction,
    ModifyCertificate: typeof ModifyCertificate,
    ModifyUtxoTransaction: typeof ModifyUtxoTransaction,
    ModifyAccountingTransaction: typeof ModifyAccountingTransaction,
    ModifyTokenList: typeof ModifyTokenList,
  |} = Object.freeze({
    ModifyTransaction,
    ModifyCertificate,
    ModifyUtxoTransaction,
    ModifyAccountingTransaction,
    ModifyTokenList,
  });

  static async addTxWithIOs(
    db: lf$Database,
    tx: lf$Transaction,
    request: {|
      block: null | BlockInsert,
      transaction: (blockId: null | number) => TransactionInsert,
      certificates: $ReadOnlyArray<number => (void | AddCertificateRequest)>,
      ioGen: (txRowId: number) => {|
        utxoInputs: Array<UtxoTransactionInputInsert>,
        utxoOutputs: Array<UtxoTransactionOutputInsert>,
        accountingInputs: Array<AccountingTransactionInputInsert>,
        tokenList: Array<{|
          TokenList: TokenListInsert,
          identifier: string,
          networkId: number,
        |}>,
      |},
    |},
  ): Promise<{|
    ...WithNullableFields<DbBlock>,
    ...CardanoShelleyTxIO,
  |}> {
    const {
      block, transaction,
    } = request;

    const { depTables } = ModifyCardanoShelleyTx;

    const newTx = await depTables.ModifyTransaction.addNew(
      db, tx,
      { block, transaction, }
    );

    const {
      utxoInputs, utxoOutputs,
      accountingInputs,
      tokenList,
    } = request.ioGen(newTx.transaction.TransactionId);

    const utxo = await depTables.ModifyUtxoTransaction.addIOsToTx(
      db, tx, {
        utxoInputs, utxoOutputs,
      }
    );
    const accounting = await depTables.ModifyAccountingTransaction.addIOsToTx(
      db, tx, {
        accountingInputs, accountingOutputs: [],
      }
    );

    const certificates = [];
    for (const certGen of request.certificates) {
      const certRequest = certGen(newTx.transaction.TransactionId);
      if (certRequest != null) {
        certificates.push(await depTables.ModifyCertificate.addNew(
          db, tx,
          certRequest,
        ));
      }
    }

    // add assets
    const newTokenListEntries = await ModifyCardanoShelleyTx.depTables.ModifyTokenList.upsert(
      db, tx,
      tokenList.map(entry => entry.TokenList)
    );

    return {
      txType: TransactionType.CardanoShelley,
      ...newTx,
      certificates,
      ...utxo,
      accountingInputs: accounting.accountingInputs,
      tokens: newTokenListEntries.map(entry => ({
        TokenList: entry,
        Token: {
          TokenId: entry.TokenId,
          Identifier: tokenList.filter(
            item => item.TokenList.TokenId === entry.TokenId
          )[0].identifier,
          NetworkId: tokenList.filter(
            item => item.TokenList.TokenId === entry.TokenId
          )[0].networkId,
        }
      })),
    };
  }
}
