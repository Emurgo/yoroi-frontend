// @flow
import BigNumber from 'bignumber.js';
import { Type, ConstraintAction, } from 'lovefield';
import type { lf$schema$Builder } from 'lovefield';
import { ConceptualWalletSchema } from '../walletTypes/core/tables';

type Asset = {|
  assetId: string,
  policyId: string,
  name: string,
  amount: string,
|};

export type Utxo = {|
  utxoId: string,
  txHash: string,
  txIndex: number,
  receiver: string,
  amount: string,
  assets: Array<Asset>,
  blockNum: number,
|};

export type UtxoAtSafePoint = {|
  lastSafeBlockHash: string,
  utxos: Array<Utxo>,
|};

export type UtxoDiffToBestBlock = {|
  lastBestBlockHash: string,
  spentUtxoIds: Array<string>,
  newUtxos: Array<Utxo>,
|};

// DB schema:
export type UtxoAtSafePointInsert = {|
  ConceptualWalletId: number,
  UtxoAtSafePoint: UtxoAtSafePoint,
|};
export type UtxoAtSafePointRow = {|
  UtxoAtSafePointId: number, // serial
  ...UtxoAtSafePointInsert,
|};
export const UtxoAtSafePointSchema: {|
  +name: 'UtxoAtSafePointTable',
  properties: $ObjMapi<UtxoAtSafePointRow, ToSchemaProp>,
|} = {
  name: 'UtxoAtSafePointTable',
  properties: {
    UtxoAtSafePointId: 'UtxoAtSafePointId',
    ConceptualWalletId: 'ConceptualWalletId',
    UtxoAtSafePoint: 'UtxoAtSafePoint',
  },
};

export type UtxoDiffToBestBlockInsert = {|
  ConceptualWalletId: number,
  // we need to index into the `lastBestBlockHash` field, so we have to spread it
  ...UtxoDiffToBestBlock,
|};
export type UtxoDiffToBestBlockRow = {|
  UtxoDiffToBestBlockId: number, // serial
  ...UtxoDiffToBestBlockInsert,
|};
export const UtxoDiffToBestBlockSchema: {|
  +name: 'UtxoDiffToBestBlock',
  properties: $ObjMapi<UtxoDiffToBestBlockRow, ToSchemaProp>,
|} = {
  name: 'UtxoDiffToBestBlock',
  properties: {
    UtxoDiffToBestBlockId: 'UtxoDiffToBestBlockId',
    ConceptualWalletId: 'ConceptualWalletId',
    lastBestBlockHash: 'lastBestBlockHash',
    spentUtxoIds: 'spentUtxoIds',
    newUtxos: 'newUtxos',
  },
};

export const populateUtxoDb = (schemaBuilder: lf$schema$Builder) => {
  schemaBuilder.createTable(UtxoAtSafePointSchema.name)
    .addColumn(UtxoAtSafePointSchema.properties.UtxoAtSafePointId, Type.INTEGER)
    .addColumn(UtxoAtSafePointSchema.properties.ConceptualWalletId, Type.INTEGER)
    .addColumn(UtxoAtSafePointSchema.properties.UtxoAtSafePoint, Type.OBJECT)
    .addPrimaryKey(
      ([UtxoAtSafePointSchema.properties.UtxoAtSafePointId]: Array<string>),
      true
    )
    .addForeignKey('UtxoAtSafePoint_ConceptualWallet', {
      local: UtxoAtSafePointSchema.properties.ConceptualWalletId,
      ref: `${ConceptualWalletSchema.name}.${ConceptualWalletSchema.properties.ConceptualWalletId}`
    })
    .addIndex(
      'UtxoAtSafePoint_ConceptualWallet_Index',
      ([UtxoAtSafePointSchema.properties.ConceptualWalletId]: Array<string>),
      false
    );

  schemaBuilder.createTable(UtxoDiffToBestBlockSchema.name)
    .addColumn(UtxoDiffToBestBlockSchema.properties.UtxoDiffToBestBlockId, Type.INTEGER)
    .addColumn(UtxoDiffToBestBlockSchema.properties.ConceptualWalletId, Type.INTEGER)
    .addColumn(UtxoDiffToBestBlockSchema.properties.lastBestBlockHash, Type.STRING)
    .addColumn(UtxoDiffToBestBlockSchema.properties.spentUtxoIds, Type.OBJECT)
    .addColumn(UtxoDiffToBestBlockSchema.properties.newUtxos, Type.OBJECT)
    .addPrimaryKey(
      ([UtxoDiffToBestBlockSchema.properties.UtxoDiffToBestBlockId]: Array<string>),
      true
    )
    .addForeignKey('UtxoDiffToBestBlock_ConceptualWallet', {
      local: UtxoDiffToBestBlockSchema.properties.ConceptualWalletId,
      ref: `${ConceptualWalletSchema.name}.${ConceptualWalletSchema.properties.ConceptualWalletId}`
    })
    .addIndex(
      'UtxoDiffToBestBlock_ConceptualWallet_Index',
      ([UtxoDiffToBestBlockSchema.properties.ConceptualWalletId]: Array<string>),
      false
    )
    .addIndex(
      'UtxoDiffToBestBlock_ConceptualWallet_lastBestBlockHash_Index',
      (
        [
          UtxoDiffToBestBlockSchema.properties.ConceptualWalletId,
          UtxoDiffToBestBlockSchema.properties.lastBestBlockHash,
        ]: Array<string>
      ),
      true,
    );
};
