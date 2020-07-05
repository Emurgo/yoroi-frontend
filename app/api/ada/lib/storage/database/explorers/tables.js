// @flow

import { Type, ConstraintAction } from 'lovefield';
import type { lf$schema$Builder } from 'lovefield';
import { NetworkSchema } from '../primitives/tables';

export const Link = Object.freeze({
  address: 'address',
  transaction: 'transaction',
  pool: 'pool',
});
export type LinkType = $Values<typeof Link>;

export type PreferredExplorerInsert = {|
  NetworkId: number,
  ExplorerId: number,
|};
export type PreferredExplorerRow = {|
  PreferredExplorerId: number, // PK can't be a foreign key in lovefield
  ...PreferredExplorerInsert,
|};
export const PreferredExplorerSchema: {|
  +name: 'PreferredExplorer',
  properties: $ObjMapi<PreferredExplorerRow, ToSchemaProp>,
|} = {
  name: 'PreferredExplorer',
  properties: {
    PreferredExplorerId: 'PreferredExplorerId',
    ExplorerId: 'ExplorerId',
    NetworkId: 'NetworkId',
  }
};

export type ExplorerInsert = {|
  ExplorerId: number,
  NetworkId: number,
  /**
   * This is useful for three cases:
   * 1) Know what to set as the default explorer if the user hasn't set anything
   * 2) Know what to set as the backup explorer if the explorer the user preferred was deleted
   * 3) The preferred explorer may not support all Cardano features (ex: stake pool information)
   * So we use the preferred explorer endpoints it supports and the backup for everything else
   */
  IsBackup: boolean,
  Endpoints: InexactSubset<typeof Link>,
  Name: string, // don't use this as a uniquer identifier because explorers can change their name!
|};
export type ExplorerRow = {|
  ...ExplorerInsert,
|};
export const ExplorerSchema: {|
  +name: 'Explorer',
  properties: $ObjMapi<ExplorerRow, ToSchemaProp>,
|} = {
  name: 'Explorer',
  properties: {
    ExplorerId: 'ExplorerId',
    NetworkId: 'NetworkId',
    IsBackup: 'IsBackup',
    Endpoints: 'Endpoints',
    Name: 'Name',
  }
};

export const populateExplorerDb: lf$schema$Builder => void = (schemaBuilder) => {
  schemaBuilder.createTable(ExplorerSchema.name)
    .addColumn(ExplorerSchema.properties.ExplorerId, Type.INTEGER)
    .addColumn(ExplorerSchema.properties.NetworkId, Type.INTEGER)
    .addColumn(ExplorerSchema.properties.IsBackup, Type.BOOLEAN)
    .addColumn(ExplorerSchema.properties.Endpoints, Type.OBJECT)
    .addColumn(ExplorerSchema.properties.Name, Type.STRING)
    .addPrimaryKey(
      /* note: doesn't auto-increment
      * since we may want to support users adding custom networks eventually
      * so we need custom user networks to live in a different ID range than pre-built networks
      * so that if we add any new premade-network, we can just hardcode an ID without conflict
      */
      ([ExplorerSchema.properties.ExplorerId]: Array<string>),
    )
    .addIndex(
      'Explorer_IsBackup_Index',
      ([ExplorerSchema.properties.IsBackup]: Array<string>),
      false
    )
    .addForeignKey('Explorer_NetworkId', {
      local: ExplorerSchema.properties.NetworkId,
      ref: `${NetworkSchema.name}.${NetworkSchema.properties.NetworkId}`,
      action: ConstraintAction.CASCADE,
    });

  schemaBuilder.createTable(PreferredExplorerSchema.name)
    .addColumn(PreferredExplorerSchema.properties.PreferredExplorerId, Type.INTEGER)
    .addColumn(PreferredExplorerSchema.properties.ExplorerId, Type.INTEGER)
    .addColumn(PreferredExplorerSchema.properties.NetworkId, Type.INTEGER)
    .addPrimaryKey(
      ([PreferredExplorerSchema.properties.PreferredExplorerId]: Array<string>),
      true
    )
    .addUnique('PreferredExplorer_NetworkId_Unique', [
      // User should only have one preferred explore preference per network
      PreferredExplorerSchema.properties.NetworkId,
    ])
    .addForeignKey('PreferredExplorer_ExplorerId', {
      local: PreferredExplorerSchema.properties.ExplorerId,
      ref: `${ExplorerSchema.name}.${ExplorerSchema.properties.ExplorerId}`,
      action: ConstraintAction.CASCADE,
    })
    .addForeignKey('PreferredExplorer_NetworkId', {
      local: PreferredExplorerSchema.properties.NetworkId,
      ref: `${NetworkSchema.name}.${NetworkSchema.properties.NetworkId}`,
      action: ConstraintAction.CASCADE,
    });
};
