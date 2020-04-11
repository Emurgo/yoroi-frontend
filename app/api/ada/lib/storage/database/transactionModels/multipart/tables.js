// @flow

import type { lf$schema$Builder } from 'lovefield';

import type { DbTransaction, DbBlock, CertificatePart, } from '../../primitives/tables';
import type { DbUtxoInputs, DbUtxoOutputs, } from '../utxo/tables';
import type { DbAccountingInputs, DbAccountingOutputs, } from '../account/tables';

export type DbTxIO = {|
  ...DbTransaction,
  certificate: void | CertificatePart,
  ...DbUtxoInputs, ...DbUtxoOutputs,
  ...DbAccountingInputs, ...DbAccountingOutputs,
|};
export type DbTxInChain = {| ...DbTxIO, ...DbBlock |};

export const populateMultipartTransactionsDb = (_schemaBuilder: lf$schema$Builder) => {
  // Does nothing for now but may be used in the future
};
