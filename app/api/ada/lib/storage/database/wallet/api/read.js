// @flow

import type {
  lf$Database,
  lf$Transaction,
} from 'lovefield';

import * as Tables from '../tables';
import type {
  LastSyncInfoRow, HwWalletMetaRow,
} from '../tables';

import {
  getRowFromKey,
} from '../../utils';

export class ReadLastSyncInfo {
  static ownTables = Object.freeze({
    [Tables.LastSyncInfoSchema.name]: Tables.LastSyncInfoSchema,
  });
  static depTables = Object.freeze({});

  static async getLastSyncInfo(
    db: lf$Database,
    tx: lf$Transaction,
    lastSyncInfoId: number,
  ): Promise<void | $ReadOnly<LastSyncInfoRow>> {
    return await getRowFromKey<LastSyncInfoRow>(
      db, tx,
      lastSyncInfoId,
      ReadLastSyncInfo.ownTables[Tables.LastSyncInfoSchema.name].name,
      ReadLastSyncInfo.ownTables[Tables.LastSyncInfoSchema.name].properties.LastSyncInfoId,
    );
  }
}

export class GetHwWalletMeta {
  static ownTables = Object.freeze({
    [Tables.HwWalletMetaSchema.name]: Tables.HwWalletMetaSchema,
  });
  static depTables = Object.freeze({});

  static async getMeta(
    db: lf$Database,
    tx: lf$Transaction,
    conceptualWalletId: number,
  ): Promise<void | $ReadOnly<HwWalletMetaRow>> {
    return await getRowFromKey<HwWalletMetaRow>(
      db, tx,
      conceptualWalletId,
      GetHwWalletMeta.ownTables[Tables.HwWalletMetaSchema.name].name,
      GetHwWalletMeta.ownTables[Tables.HwWalletMetaSchema.name].properties.ConceptualWalletId,
    );
  }
}
