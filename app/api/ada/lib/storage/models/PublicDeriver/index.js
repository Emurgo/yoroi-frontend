// @flow

import type {
  lf$Database, lf$Transaction,
} from 'lovefield';

import { Bip44Wallet } from '../Bip44Wallet/wrapper';
import { ConceptualWallet } from '../ConceptualWallet/index';

import type {
  IPublicDeriver, IPublicDeriverConstructor,
  IGetLastSyncInfo, IGetLastSyncInfoRequest, IGetLastSyncInfoResponse,
} from './interfaces';
import type {
  IRename, IRenameRequest, IRenameResponse,
} from '../common/interfaces';

import {
  getAllSchemaTables,
  raii,
  StaleStateError,
} from '../../database/utils';

import type {
  PublicDeriverRow,
} from '../../database/walletTypes/core/tables';
import {
  GetPublicDeriver,
  GetLastSyncForPublicDeriver,
} from '../../database/walletTypes/core/api/read';
import { ModifyPublicDeriver } from '../../database/walletTypes/core/api/write';

import type {
  KeyDerivationRow,
} from '../../database/primitives/tables';
import {
  GetKeyDerivation,
} from '../../database/primitives/api/read';
import { addTraitsForBip44Child } from '../Bip44Wallet/traits';

/** Snapshot of a PublicDeriver in the database */
export class PublicDeriver implements IPublicDeriver, IRename, IGetLastSyncInfo {
  /**
   * Should only cache information we know will never change
   */

  publicDeriverId: number;
  conceptualWallet: ConceptualWallet;
  derivationId: number;
  pathToPublic: Array<number>;

  /**
   * This constructor it will NOT populate functionality from db
   */
  constructor(data: IPublicDeriverConstructor): PublicDeriver {
    this.publicDeriverId = data.publicDeriverId;
    this.conceptualWallet = data.conceptualWallet;
    this.pathToPublic = data.pathToPublic;
    this.derivationId = data.derivationId;
    return this;
  }

  getDb(): lf$Database {
    return this.conceptualWallet.getDb();
  }

  getPublicDeriverId(): number {
    return this.publicDeriverId;
  }

  getConceptualWallet(): ConceptualWallet {
    return this.conceptualWallet;
  }

  getPathToPublic(): Array<number> {
    return this.pathToPublic;
  }

  getDerivationId(): number {
    return this.derivationId;
  }

  static async createPublicDeriver(
    pubDeriver: $ReadOnly<PublicDeriverRow>,
    conceptualWallet: ConceptualWallet,
  ): Promise<PublicDeriver> {
    return await refreshPublicDeriverFunctionality(
      conceptualWallet.getDb(),
      pubDeriver,
      conceptualWallet,
    );
  }

  getFullPublicDeriverInfo = async (): Promise<$ReadOnly<PublicDeriverRow>> => {
    const deps = Object.freeze({
      GetPublicDeriver,
    });
    const depTables = Object
      .keys(deps)
      .map(key => deps[key])
      .flatMap(table => getAllSchemaTables(this.getDb(), table));
    return await raii(
      this.getDb(),
      depTables,
      async tx => {
        const row = await deps.GetPublicDeriver.get(
          this.getDb(), tx,
          this.publicDeriverId,
        );
        if (row == null) {
          throw new StaleStateError('getFullPublicDeriverInfo PublicDeriver==null');
        }
        return row;
      }
    );
  }

  rawRename = async (
    tx: lf$Transaction,
    deps: {| ModifyPublicDeriver: Class<ModifyPublicDeriver> |},
    body: IRenameRequest,
  ): Promise<IRenameResponse> => {
    return await deps.ModifyPublicDeriver.rename(
      this.getDb(), tx,
      {
        pubDeriverId: this.publicDeriverId,
        newName: body.newName,
      }
    );
  }
  rename = async (
    body: IRenameRequest,
  ): Promise<IRenameResponse> => {
    const deps = Object.freeze({
      ModifyPublicDeriver,
    });
    const depTables = Object
      .keys(deps)
      .map(key => deps[key])
      .flatMap(table => getAllSchemaTables(this.getDb(), table));
    return await raii(
      this.getDb(),
      depTables,
      async tx => this.rawRename(tx, deps, body)
    );
  };

  rawGetLastSyncInfo = async (
    tx: lf$Transaction,
    deps: {| GetLastSyncForPublicDeriver: Class<GetLastSyncForPublicDeriver> |},
    _body: IGetLastSyncInfoRequest,
  ): Promise<IGetLastSyncInfoResponse> => {
    return await deps.GetLastSyncForPublicDeriver.forId(
      this.getDb(), tx,
      this.publicDeriverId
    );
  }
  getLastSyncInfo = async (
    body: IGetLastSyncInfoRequest,
  ): Promise<IGetLastSyncInfoResponse> => {
    const deps = Object.freeze({
      GetLastSyncForPublicDeriver,
    });
    const depTables = Object
      .keys(deps)
      .map(key => deps[key])
      .flatMap(table => getAllSchemaTables(this.getDb(), table));
    return await raii<IGetLastSyncInfoResponse>(
      this.getDb(),
      depTables,
      async tx => this.rawGetLastSyncInfo(tx, deps, body)
    );
  }
}

export async function refreshPublicDeriverFunctionality(
  db: lf$Database,
  pubDeriver: $ReadOnly<PublicDeriverRow>,
  conceptualWallet: ConceptualWallet,
): Promise<IPublicDeriver> {
  const keyDerivation = await getKeyDerivation(
    db,
    pubDeriver.KeyDerivationId,
  );
  let pathToPublic;
  let finalClass;

  if (conceptualWallet instanceof Bip44Wallet) {
    const result = await addTraitsForBip44Child(
      db,
      pubDeriver,
      keyDerivation,
      conceptualWallet,
      PublicDeriver,
    );
    pathToPublic = result.pathToPublic;
    finalClass = result.finalClass;
  } else {
    throw new Error('refreshPublicDeriverFunctionality unknown wallet type');
  }

  const instance = new finalClass({
    publicDeriverId: pubDeriver.PublicDeriverId,
    conceptualWallet,
    pathToPublic,
    derivationId: keyDerivation.KeyDerivationId,
  });
  return instance;
}

async function getKeyDerivation(
  db: lf$Database,
  keyDerivationId: number,
): Promise<$ReadOnly<KeyDerivationRow>> {
  const deps = Object.freeze({
    GetKeyDerivation,
  });
  const depTables = Object
    .keys(deps)
    .map(key => deps[key])
    .flatMap(table => getAllSchemaTables(db, table));
  return await raii<$ReadOnly<KeyDerivationRow>>(
    db,
    depTables,
    async tx => {
      const keyDerivationRow = await deps.GetKeyDerivation.get(
        db, tx,
        keyDerivationId,
      );
      if (keyDerivationRow === undefined) {
        throw new StaleStateError('PublicDeriver::getKeyDerivation keyDerivationRow');
      }
      return keyDerivationRow;
    }
  );
}
