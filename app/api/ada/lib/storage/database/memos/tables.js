// @flow

import { Type, } from 'lovefield';
import type { lf$schema$Builder } from 'lovefield';

export type TxMemoTableInsertCommon = {|
  Content: string,
  /* can't use TransactionId here because that would cause memos to break on resync? */
  TransactionHash: string,
  LastUpdated: Date,
|};

export type TxMemoTableInsert = {|
  /*
   * Should be checksum of public deriver
   * But for wallets without a public key, it can be something else
   */
  WalletId: string,
  ...TxMemoTableInsertCommon,
|};
export type TxMemoTableRow = {|
  ...TxMemoTableInsert,
|};
export const TxMemoSchema: {|
  name: 'TxMemo',
  properties: $ObjMapi<TxMemoTableRow, ToSchemaProp>,
|} = {
  name: 'TxMemo',
  properties: {
    WalletId: 'WalletId',
    Content: 'Content',
    TransactionHash: 'TransactionHash',
    LastUpdated: 'LastUpdated'
  }
};

export const populateMemoTransactionsDb: lf$schema$Builder => void = (schemaBuilder) => {
  schemaBuilder.createTable(TxMemoSchema.name)
    .addColumn(TxMemoSchema.properties.WalletId, Type.STRING)
    .addColumn(TxMemoSchema.properties.Content, Type.STRING)
    .addColumn(TxMemoSchema.properties.TransactionHash, Type.INTEGER)
    .addColumn(TxMemoSchema.properties.LastUpdated, Type.DATE_TIME)
    // Note: no foreign key in the Transaction table
    // since txhash aren't unique in the Transactions table
    // and some memos may be for transactions we haven't synced yet
    .addPrimaryKey(
      ([
        // different wallets can have the same transaction in them
        // but different memos respectively
        TxMemoSchema.properties.WalletId,
        TxMemoSchema.properties.TransactionHash,
      ]: Array<string>)
    );
};
