// @flow

import type { lf$schema$Builder } from 'lovefield';

import type { DbTransaction, CertificatePart, } from '../../primitives/tables';
import { TransactionType } from '../../primitives/tables';
import type { DbUtxoInputs, DbUtxoOutputs, } from '../utxo/tables';
import type { DbAccountingInputs, DbAccountingOutputs, } from '../account/tables';

export type CardanoByronTxIO = {|
  +transaction: $ReadOnly<{|
    ...$PropertyType<DbTransaction, 'transaction'>,
    +Type: $PropertyType<typeof TransactionType, "CardanoByron">,
  |}>,
  ...DbUtxoInputs, ...DbUtxoOutputs,
|};
export type CardanoShelleyTxIO = {|
  +transaction: $ReadOnly<{|
    ...$PropertyType<DbTransaction, 'transaction'>,
    +Type: $PropertyType<typeof TransactionType, "CardanoShelley">,
  |}>,
  ...DbUtxoInputs, ...DbUtxoOutputs,
  +certificates: Array<CertificatePart>,
|};
export type ErgoTxIO = {|
  +transaction: $ReadOnly<{|
    ...$PropertyType<DbTransaction, 'transaction'>,
    +Type: $PropertyType<typeof TransactionType, "Ergo">,
  |}>,
  ...DbUtxoInputs, ...DbUtxoOutputs,
|};
export type JormungandrTxIO = {|
  +transaction: $ReadOnly<{|
    ...$PropertyType<DbTransaction, 'transaction'>,
    +Type: $PropertyType<typeof TransactionType, "Jormungandr">,
  |}>,
  +certificates: Array<CertificatePart>,
  ...DbUtxoInputs, ...DbUtxoOutputs,
  ...DbAccountingInputs, ...DbAccountingOutputs,
|}

export const populateMultipartTransactionsDb = (_schemaBuilder: lf$schema$Builder) => {
  // Does nothing for now but may be used in the future
};
