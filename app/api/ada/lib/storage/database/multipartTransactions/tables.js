// @flow

import type { lf$schema$Builder } from 'lovefield';

import type { DbTransaction, DbBlock, } from '../primitives/tables';
import type { DbUtxoInputs, DbUtxoOutputs, } from '../utxoTransactions/tables';
import type { DbAccountingInputs, DbAccountingOutputs, } from '../accountingTransactions/tables';

export type DbTxIO = {|
  ...DbTransaction,
  ...DbUtxoInputs, ...DbUtxoOutputs,
  ...DbAccountingInputs, ...DbAccountingOutputs,
|};
export type DbTxInChain = {| ...DbTxIO, ...DbBlock |};

export const populateMultipartTransactionsDb = (_schemaBuilder: lf$schema$Builder) => {
  // Does nothing for now but may be used in the future
};
