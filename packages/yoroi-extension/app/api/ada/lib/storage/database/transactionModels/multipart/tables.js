// @flow

import type { lf$schema$Builder } from 'lovefield';

import type { DbTransaction, CertificatePart, DbTokenInfo } from '../../primitives/tables';
import { TransactionType } from '../../primitives/tables';
import type {
  DbUtxoInputs, DbUtxoOutputs,
} from '../utxo/tables';
import type { DbAccountingInputs, } from '../account/tables';

export type CardanoByronTxIO = {|
  +txType: $PropertyType<typeof TransactionType, "CardanoByron">,
  +transaction: $ReadOnly<{|
    ...$PropertyType<DbTransaction, 'transaction'>,
    +Type: $PropertyType<typeof TransactionType, "CardanoByron">,
  |}>,
   ...DbTokenInfo,
  ...DbUtxoInputs, ...DbUtxoOutputs,
|};
export type CardanoShelleyTxIO = {|
  +txType: $PropertyType<typeof TransactionType, "CardanoShelley">,
  +transaction: $ReadOnly<{|
    ...$PropertyType<DbTransaction, 'transaction'>,
    +Type: $PropertyType<typeof TransactionType, "CardanoShelley">,
  |}>,
  ...DbUtxoInputs, ...DbUtxoOutputs,
  ...DbAccountingInputs,
   ...DbTokenInfo,
  +certificates: Array<CertificatePart>,
|};

export const populateMultipartTransactionsDb = (_schemaBuilder: lf$schema$Builder) => {
  // Does nothing for now but may be used in the future
};
