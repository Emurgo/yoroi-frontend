// @flow

import type {
  lf$Database,
  lf$Transaction,
} from 'lovefield';
import type {
  BlockInsert,
  TransactionInsert,
  DbBlock,
  TokenInsert, TokenRow,
} from '../../../primitives/tables';
import { TransactionType, } from '../../../primitives/tables';
import type {
  JormungandrTxIO,
  CardanoByronTxIO,
  CardanoShelleyTxIO,
  ErgoTxIO,
} from '../tables';
import type {
  UtxoTransactionInputInsert,
  UtxoTransactionOutputInsert,
  TokenListInsert,
} from '../../utxo/tables';
import type {
  AccountingTransactionInputInsert,
  AccountingTransactionOutputInsert,
} from '../../account/tables';
import { ModifyTransaction, ModifyCertificate, ModifyToken, } from '../../../primitives/api/write';
import type { AddCertificateRequest } from '../../../primitives/api/write';
import { ModifyUtxoTransaction, ModifyTokenList } from '../../utxo/api/write';
import { ModifyAccountingTransaction } from '../../account/api/write';

export class ModifyJormungandrTx {
  static ownTables: {||} = Object.freeze({});
  static depTables: {|
    ModifyAccountingTransaction: typeof ModifyAccountingTransaction,
    ModifyCertificate: typeof ModifyCertificate,
    ModifyTransaction: typeof ModifyTransaction,
    ModifyUtxoTransaction: typeof ModifyUtxoTransaction,
  |} = Object.freeze({
    ModifyTransaction,
    ModifyUtxoTransaction,
    ModifyAccountingTransaction,
    ModifyCertificate,
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
        accountingOutputs: Array<AccountingTransactionOutputInsert>,
      |},
    |},
  ): Promise<{|
    ...WithNullableFields<DbBlock>,
    ...JormungandrTxIO,
  |}> {
    const {
      block, transaction,
    } = request;

    const newTx = await ModifyJormungandrTx.depTables.ModifyTransaction.addNew(
      db, tx,
      { block, transaction, }
    );

    const {
      utxoInputs, utxoOutputs,
      accountingInputs, accountingOutputs,
    } = request.ioGen(newTx.transaction.TransactionId);

    const utxo = await ModifyJormungandrTx.depTables.ModifyUtxoTransaction.addIOsToTx(
      db, tx, {
        utxoInputs, utxoOutputs,
      }
    );
    const accounting = await ModifyJormungandrTx.depTables.ModifyAccountingTransaction.addIOsToTx(
      db, tx, {
        accountingInputs, accountingOutputs,
      }
    );

    const certificates = [];
    for (const certGen of request.certificates) {
      const certRequest = certGen(newTx.transaction.TransactionId);
      if (certRequest != null) {
        certificates.push(await ModifyJormungandrTx.depTables.ModifyCertificate.addNew(
          db, tx,
          certRequest,
        ));
      }
    }

    return {
      txType: TransactionType.Jormungandr,
      ...newTx,
      certificates,
      ...utxo,
      ...accounting,
    };
  }
}

export class ModifyCardanoByronTx {
  static ownTables: {||} = Object.freeze({});
  static depTables: {|
    ModifyTransaction: typeof ModifyTransaction,
    ModifyUtxoTransaction: typeof ModifyUtxoTransaction,
  |} = Object.freeze({
    ModifyTransaction,
    ModifyUtxoTransaction,
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
    } = request.ioGen(newTx.transaction.TransactionId);

    const utxo = await ModifyCardanoByronTx.depTables.ModifyUtxoTransaction.addIOsToTx(
      db, tx, {
        utxoInputs, utxoOutputs,
      }
    );
    return {
      txType: TransactionType.CardanoByron,
      ...newTx,
      ...utxo,
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
  |} = Object.freeze({
    ModifyTransaction,
    ModifyCertificate,
    ModifyUtxoTransaction,
    ModifyAccountingTransaction,
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

    return {
      txType: TransactionType.CardanoShelley,
      ...newTx,
      certificates,
      ...utxo,
      accountingInputs: accounting.accountingInputs,
    };
  }
}

export class ModifyErgoTx {
  static ownTables: {||} = Object.freeze({});
  static depTables: {|
    ModifyTransaction: typeof ModifyTransaction,
    ModifyUtxoTransaction: typeof ModifyUtxoTransaction,
    ModifyToken: typeof ModifyToken,
    ModifyTokenList: typeof ModifyTokenList,
  |} = Object.freeze({
    ModifyTransaction,
    ModifyUtxoTransaction,
    ModifyToken,
    ModifyTokenList,
  });

  static async addTxWithIOs(
    db: lf$Database,
    tx: lf$Transaction,
    request: {|
      networkId: number,
      block: null | BlockInsert,
      transaction: (blockId: null | number) => TransactionInsert,
      ioGen: (txRowId: number) => {|
        utxoInputs: Array<{|
          input: UtxoTransactionInputInsert,
          tokens: Array<$Diff<TokenInsert, {| Digest: number |}>>,
          tokenList: Array<
            {| TokenId: number, UtxoTransactionInputId: number |} => TokenListInsert
          >,
        |}>,
        utxoOutputs: Array<{|
          utxo: UtxoTransactionOutputInsert,
          tokens: Array<$Diff<TokenInsert, {| Digest: number |}>>,
          tokenList: Array<
            {| TokenId: number, UtxoTransactionOutputId: number |} => TokenListInsert
          >,
        |}>,
      |},
    |},
  ): Promise<{|
    ...WithNullableFields<DbBlock>,
    ...ErgoTxIO,
  |}> {
    const {
      block, transaction,
    } = request;

    const newTx = await ModifyErgoTx.depTables.ModifyTransaction.addNew(
      db, tx,
      { block, transaction, }
    );

    const {
      utxoInputs, utxoOutputs,
    } = request.ioGen(newTx.transaction.TransactionId);

    const utxo = await ModifyErgoTx.depTables.ModifyUtxoTransaction.addIOsToTx(
      db, tx, {
        utxoInputs: utxoInputs.map(input => input.input),
        utxoOutputs: utxoOutputs.map(output => output.utxo),
      }
    );

    const tokenRows = await ModifyErgoTx.depTables.ModifyToken.upsert(
      db, tx,
      [
        ...utxoInputs.flatMap(input => input.tokens),
        ...utxoOutputs.flatMap(output => output.tokens),
      ],
    );
    const tokenLookup = new Map<string, $ReadOnly<TokenRow>>(
      tokenRows.map(row => [row.Identifier, row])
    );

    const tokenListInserts: Array<TokenListInsert> = [];
    // add tokens for inputs
    for (let i = 0; i < utxoInputs.length; i++) {
      for (let listIndex = 0; listIndex < utxoInputs[i].tokenList.length; listIndex++) {
        const tokenInfo = tokenLookup.get(utxoInputs[i].tokens[listIndex].Identifier);
        if (tokenInfo == null) {
          throw new Error(`${nameof(ModifyErgoTx)}::${nameof(ModifyErgoTx.addTxWithIOs)} no token info found`);
        }
        tokenListInserts.push(utxoInputs[i].tokenList[listIndex]({
          TokenId: tokenInfo.TokenId,
          UtxoTransactionInputId: utxo.utxoInputs[i].UtxoTransactionInputId
        }));
      }
    }
    // add tokens for outputs
    for (let i = 0; i < utxoOutputs.length; i++) {
      for (let listIndex = 0; listIndex < utxoOutputs[i].tokenList.length; listIndex++) {
        const tokenInfo = tokenLookup.get(utxoOutputs[i].tokens[listIndex].Identifier);
        if (tokenInfo == null) {
          throw new Error(`${nameof(ModifyErgoTx)}::${nameof(ModifyErgoTx.addTxWithIOs)} no token info found`);
        }
        tokenListInserts.push(utxoOutputs[i].tokenList[listIndex]({
          TokenId: tokenInfo.TokenId,
          UtxoTransactionOutputId: utxo.utxoOutputs[i].UtxoTransactionOutputId
        }));
      }
    }

    await ModifyErgoTx.depTables.ModifyTokenList.upsert(
      db, tx,
      tokenListInserts
    );

    return {
      txType: TransactionType.Ergo,
      ...newTx,
      ...utxo,
    };
  }
}
