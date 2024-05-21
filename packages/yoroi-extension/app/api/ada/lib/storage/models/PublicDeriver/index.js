// @flow

import type {
  lf$Database, lf$Transaction,
} from 'lovefield';

import { Bip44Wallet } from '../Bip44Wallet/wrapper';
import { Cip1852Wallet } from '../Cip1852Wallet/wrapper';
import { ConceptualWallet } from '../ConceptualWallet/index';

import type {
  IPublicDeriver,
  IPublicDeriverConstructor,
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
import { ModifyPublicDeriver, } from '../../database/walletTypes/core/api/write';

import type {
  KeyDerivationRow,
} from '../../database/primitives/tables';
import {
  GetKeyDerivation,
} from '../../database/primitives/api/read';
import { addTraitsForBip44Child, addTraitsForCip1852Child } from './traits';
import { UtxoService } from '@emurgo/yoroi-lib/dist/utxo';
import { UtxoStorageApi, } from '../utils';
import UtxoApi from '../../../state-fetch/utxoApi';
import { networks } from '../../database/prepackaged/networks';

/** Snapshot of a PublicDeriver in the database */
export class PublicDeriver<+Parent: ConceptualWallet = ConceptualWallet>
implements IPublicDeriver<Parent>, IRename, IGetLastSyncInfo {
  /**
   * Should only cache information we know will never change
   */

  publicDeriverId: number;
  +parent: Parent;
  derivationId: number;
  pathToPublic: Array<number>;
  utxoService: UtxoService;
  // The UtxoStorage depended on by the above UtxoService.
  // Exposed because sometimes we need to directly manipulate it.
  utxoStorageApi: UtxoStorageApi;
  /**
   * This constructor it will NOT populate functionality from db
   */
  constructor(data: IPublicDeriverConstructor<Parent>): PublicDeriver<Parent> {
    this.publicDeriverId = data.publicDeriverId;
    this.parent = data.parent;
    this.pathToPublic = data.pathToPublic;
    this.derivationId = data.derivationId;

    const { BackendService } = this.parent.getNetworkInfo().Backend;
    if (!BackendService) {
      throw new Error('missing backend service URL');
    }
    const utxoApi = new UtxoApi(BackendService);
    this.utxoStorageApi = new UtxoStorageApi(this.publicDeriverId);
    this.utxoService = new UtxoService(utxoApi, this.utxoStorageApi);

    return this;
  }

  getDb(): lf$Database {
    return this.parent.getDb();
  }

  getPublicDeriverId(): number {
    return this.publicDeriverId;
  }

  getParent(): Parent {
    return this.parent;
  }

  isMainnet(): boolean {
    return this.getParent().getNetworkInfo().NetworkId
      === networks.CardanoMainnet.NetworkId;
  }

  getPathToPublic(): Array<number> {
    return this.pathToPublic;
  }

  getDerivationId(): number {
    return this.derivationId;
  }

  static async createPublicDeriver(
    pubDeriver: $ReadOnly<PublicDeriverRow>,
    parent: ConceptualWallet,
  ): Promise<PublicDeriver<>> {
    return await refreshPublicDeriverFunctionality(
      parent.getDb(),
      pubDeriver,
      parent,
    );
  }

  getFullPublicDeriverInfo: void => Promise<$ReadOnly<PublicDeriverRow>> = async () => {
    const deps = Object.freeze({
      GetPublicDeriver,
    });
    const depTables = Object
      .keys(deps)
      .map(key => deps[key])
      .flatMap(table => getAllSchemaTables(this.getDb(), table));
    return await raii<$ReadOnly<PublicDeriverRow>>(
      this.getDb(),
      depTables,
      async tx => {
        const row = await deps.GetPublicDeriver.get(
          this.getDb(), tx,
          this.publicDeriverId,
        );
        if (row == null) {
          throw new StaleStateError(`${nameof(this.getFullPublicDeriverInfo)} PublicDeriver==null`);
        }
        return row;
      }
    );
  }

  rawRename: (
    tx: lf$Transaction,
    deps: {| ModifyPublicDeriver: Class<ModifyPublicDeriver> |},
    body: IRenameRequest,
  ) => Promise<IRenameResponse> = async (tx, deps, body) => {
    return await deps.ModifyPublicDeriver.rename(
      this.getDb(), tx,
      {
        pubDeriverId: this.publicDeriverId,
        newName: body.newName,
      }
    );
  }
  rename: IRenameRequest => Promise<IRenameResponse> = async (body) => {
    const deps = Object.freeze({
      ModifyPublicDeriver,
    });
    const depTables = Object
      .keys(deps)
      .map(key => deps[key])
      .flatMap(table => getAllSchemaTables(this.getDb(), table));
    return await raii<IRenameResponse>(
      this.getDb(),
      depTables,
      async tx => this.rawRename(tx, deps, body)
    );
  };

  rawGetLastSyncInfo: (
    tx: lf$Transaction,
    deps: {| GetLastSyncForPublicDeriver: Class<GetLastSyncForPublicDeriver> |},
    _body: IGetLastSyncInfoRequest,
  ) => Promise<IGetLastSyncInfoResponse> = async (tx, deps, _body,) => {
    return await deps.GetLastSyncForPublicDeriver.forId(
      this.getDb(), tx,
      this.publicDeriverId
    );
  }
  getLastSyncInfo: IGetLastSyncInfoRequest => Promise<IGetLastSyncInfoResponse> = async (body) => {
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

  getUtxoService: void => UtxoService = () => this.utxoService;
  getUtxoStorageApi: void => UtxoStorageApi = () => this.utxoStorageApi;
}

export async function refreshPublicDeriverFunctionality(
  db: lf$Database,
  pubDeriver: $ReadOnly<PublicDeriverRow>,
  parent: ConceptualWallet,
): Promise<PublicDeriver<>> {
  const keyDerivation = await getKeyDerivation(
    db,
    pubDeriver.KeyDerivationId,
  );

  if (parent instanceof Bip44Wallet) {
    const result = await addTraitsForBip44Child({
      db,
      pubDeriver,
      pubDeriverKeyDerivation: keyDerivation,
      conceptualWallet: parent,
      startClass: PublicDeriver,
    });
    const finalClass = result.finalClass;
    const instance = new finalClass({
      publicDeriverId: pubDeriver.PublicDeriverId,
      parent,
      pathToPublic: result.pathToPublic,
      derivationId: keyDerivation.KeyDerivationId,
    });
    return instance;
  }
  if (parent instanceof Cip1852Wallet) {
    const result = await addTraitsForCip1852Child(
      db,
      pubDeriver,
      keyDerivation,
      parent,
      PublicDeriver,
    );
    const finalClass = result.finalClass;
    const instance = new finalClass({
      publicDeriverId: pubDeriver.PublicDeriverId,
      parent,
      pathToPublic: result.pathToPublic,
      derivationId: keyDerivation.KeyDerivationId,
    });
    return instance;
  }

  throw new Error(`${nameof(refreshPublicDeriverFunctionality)} unknown wallet type`);
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
        throw new StaleStateError(`${nameof(getKeyDerivation)} keyDerivationRow`);
      }
      return keyDerivationRow;
    }
  );
}

export type Bip44PublicDeriver = PublicDeriver<Bip44Wallet>;
export type Cip1852PublicDeriver = PublicDeriver<Cip1852Wallet>;
