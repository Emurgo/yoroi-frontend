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

// import { GetConceptualWallet } from '../database/uncategorized/api/get';
// import { GetPublicDeriver, GetBip44Wrapper } from '../database/genericBip44/api/get';

import { Bip44Wallet } from '../models/Bip44Wallet';
import { PublicDeriver } from '../models/PublicDeriver';

import { getRowFromKey } from '../database/utils';

import { appendChain } from './appendChain';

import { LovefieldDerive } from './lovefieldDerive';

export class LovefieldBridge implements IStorageBridge {
  db: lf$Database;

  constructor(db: lf$Database) {
    this.db = db;
  }

  // TODO: need to decide the architecture for this part

  getConceptualWalletData = (_key: number): Promise<ConceptualWalletRow | void> => {
    // return getConceptualWallet(this.db, key);
    return Promise.resolve(undefined);
  }
  getPublicDeriverData = (_key: number): Promise<PublicDeriverRow | void> => {
    // return getPublicDeriver(this.db, key);
    return Promise.resolve(undefined);
  }
  getBip44WrapperData = (_key: number): Promise<Bip44WrapperRow | void> => {
    // return getBip44Wrapper(this.db, key);
    return Promise.resolve(undefined);
  }

  addPublicDeriverFunctionality = (_publicDeriver: PublicDeriver): Promise<void> => {
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
