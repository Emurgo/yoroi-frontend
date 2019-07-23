// @flow

import type {
  lf$Database,
} from 'lovefield';

import type { IStorageBridge } from './IStorageBridge';
import type {
  Bip44WrapperRow,
  PublicDeriverRow,
  PrivateDeriverRow
} from '../database/genericBip44/tables';
import { PrivateDeriverSchema } from '../database/genericBip44/tables';
import type { ConceptualWalletRow } from '../database/uncategorized/tables';

import { getConceptualWallet } from '../database/uncategorized/api';
import { getPublicDeriver, getBip44Wrapper } from '../database/genericBip44/api';

import { Bip44Wallet } from '../models/Bip44Wallet';
import { PublicDeriver } from '../models/PublicDeriver';

import { getRowFromKey } from '../database/utils';

import { appendChain } from './appendChain';

import { LovefieldDerive } from './LovefieldDerive';

export class LovefieldBridge implements IStorageBridge {
  db: lf$Database;

  constructor(db: lf$Database) {
    this.db = db;
  }

  // TODO: maybe flatten these?
  getConceptualWalletData = (key: number): Promise<ConceptualWalletRow | void> => {
    //return getConceptualWallet(this.db, key);
    return Promise.resolve(undefined);
  }
  getPublicDeriverData = (key: number): Promise<PublicDeriverRow | void> => {
    //return getPublicDeriver(this.db, key);
    return Promise.resolve(undefined);
  }
  getBip44WrapperData = (key: number): Promise<Bip44WrapperRow | void> => {
    //return getBip44Wrapper(this.db, key);
    return Promise.resolve(undefined);
  }

  addPublicDeriverFunctionality = (publicDeriver: PublicDeriver): Promise<void> => {
    // TODO
    return Promise.resolve();
  }
  addBip44WalletFunctionality = async (bip44Wallet: Bip44Wallet): Promise<void> => {
    const Bip44PrivateDeriverTable = this.db.getSchema().table(PrivateDeriverSchema.name);
    const getFunctionalityTx = this.db.createTransaction();
    await getFunctionalityTx
      .begin([
        Bip44PrivateDeriverTable,
      ]);

    const privateDeriver = await getRowFromKey<PrivateDeriverRow>(
      this.db,
      getFunctionalityTx,
      bip44Wallet.bip44WrapperId,
      PrivateDeriverSchema.name,
      PrivateDeriverSchema.properties.Bip44WrapperId,
    );
    getFunctionalityTx.commit();
    if (privateDeriver !== undefined) {
      appendChain(
        bip44Wallet,
        new LovefieldDerive(
          this.db,
          bip44Wallet.bip44WrapperId,
        ),
      );
    }
    return Promise.resolve();
  }
}
