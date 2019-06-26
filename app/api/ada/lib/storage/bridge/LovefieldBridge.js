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

import { LovelaceDerive } from './LovefieldDerive';

export class LovefieldBridge implements IStorageBridge {
  db: lf$Database;

  constructor(db: lf$Database) {
    this.db = db;
  }

  // TODO: maybe flatten these?
  getConceptualWalletData = (key: number): Promise<ConceptualWalletRow | typeof undefined> => {
    return getConceptualWallet(this.db, key);
  }
  getPublicDeriverData = (key: number): Promise<PublicDeriverRow | typeof undefined> => {
    return getPublicDeriver(this.db, key);
  }
  getBip44WrapperData = (key: number): Promise<Bip44WrapperRow | typeof undefined> => {
    return getBip44Wrapper(this.db, key);
  }

  addPublicDeriverFunctionality = (publicDeriver: PublicDeriver): Promise<void> => {
    // TODO
    return Promise.resolve();
  }
  addBip44WalletFunctionality = async (bip44Wallet: Bip44Wallet): Promise<void> => {
    const privateDeriver = await getRowFromKey<PrivateDeriverRow>(
      this.db,
      bip44Wallet.bip44WrapperId,
      PrivateDeriverSchema.name,
      PrivateDeriverSchema.properties.Bip44WrapperId,
    );
    if (privateDeriver !== undefined) {
      appendChain(
        bip44Wallet,
        new LovelaceDerive(
          this.db,
          bip44Wallet.bip44WrapperId,
        ),
      );
      // TODO: add functionality
    }
    return Promise.resolve();
  }
}
