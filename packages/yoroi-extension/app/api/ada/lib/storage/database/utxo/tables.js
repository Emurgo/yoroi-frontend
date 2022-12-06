// @flow
import { Type } from 'lovefield';
import type { lf$schema$Builder } from 'lovefield';
import { PublicDeriverSchema } from '../walletTypes/core/tables';

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
  PublicDeriverId: number,
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
    PublicDeriverId: 'PublicDeriverId',
    UtxoAtSafePoint: 'UtxoAtSafePoint',
  },
};

export type UtxoDiffToBestBlockInsert = {|
  PublicDeriverId: number,
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
    PublicDeriverId: 'PublicDeriverId',
    lastBestBlockHash: 'lastBestBlockHash',
    spentUtxoIds: 'spentUtxoIds',
    newUtxos: 'newUtxos',
  },
};

export const populateUtxoDb = (schemaBuilder: lf$schema$Builder) => {
  schemaBuilder.createTable(UtxoAtSafePointSchema.name)
    .addColumn(UtxoAtSafePointSchema.properties.UtxoAtSafePointId, Type.INTEGER)
    .addColumn(UtxoAtSafePointSchema.properties.PublicDeriverId, Type.INTEGER)
    .addColumn(UtxoAtSafePointSchema.properties.UtxoAtSafePoint, Type.OBJECT)
    .addPrimaryKey(
      ([UtxoAtSafePointSchema.properties.UtxoAtSafePointId]: Array<string>),
      true
    )
    .addForeignKey('UtxoAtSafePoint_PublicDeriver', {
      local: UtxoAtSafePointSchema.properties.PublicDeriverId,
      ref: `${PublicDeriverSchema.name}.${PublicDeriverSchema.properties.PublicDeriverId}`
    })
    .addIndex(
      'UtxoAtSafePoint_PublicDeriver_Index',
      ([UtxoAtSafePointSchema.properties.PublicDeriverId]: Array<string>),
      false
    );

  schemaBuilder.createTable(UtxoDiffToBestBlockSchema.name)
    .addColumn(UtxoDiffToBestBlockSchema.properties.UtxoDiffToBestBlockId, Type.INTEGER)
    .addColumn(UtxoDiffToBestBlockSchema.properties.PublicDeriverId, Type.INTEGER)
    .addColumn(UtxoDiffToBestBlockSchema.properties.lastBestBlockHash, Type.STRING)
    .addColumn(UtxoDiffToBestBlockSchema.properties.spentUtxoIds, Type.OBJECT)
    .addColumn(UtxoDiffToBestBlockSchema.properties.newUtxos, Type.OBJECT)
    .addPrimaryKey(
      ([UtxoDiffToBestBlockSchema.properties.UtxoDiffToBestBlockId]: Array<string>),
      true
    )
    .addForeignKey('UtxoDiffToBestBlock_PublicDeriver', {
      local: UtxoDiffToBestBlockSchema.properties.PublicDeriverId,
      ref: `${PublicDeriverSchema.name}.${PublicDeriverSchema.properties.PublicDeriverId}`
    })
    .addIndex(
      'UtxoDiffToBestBlock_PublicDeriver_Index',
      ([UtxoDiffToBestBlockSchema.properties.PublicDeriverId]: Array<string>),
      false
    )
    .addIndex(
      'UtxoDiffToBestBlock_PublicDeriver_lastBestBlockHash_Index',
      (
        [
          UtxoDiffToBestBlockSchema.properties.PublicDeriverId,
          UtxoDiffToBestBlockSchema.properties.lastBestBlockHash,
        ]: Array<string>
      ),
      true,
    );
};
