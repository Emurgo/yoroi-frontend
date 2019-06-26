// @flow

import type { Bip44WrapperRow, PublicDeriverRow } from '../database/genericBip44/tables';
import type { ConceptualWalletRow } from '../database/uncategorized/tables';

import { Bip44Wallet } from '../models/Bip44Wallet';
import { PublicDeriver } from '../models/PublicDeriver';

export interface IStorageBridge {
  getConceptualWalletData(key: number): Promise<ConceptualWalletRow | typeof undefined>;
  getPublicDeriverData(key: number): Promise<PublicDeriverRow | typeof undefined>;
  getBip44WrapperData(key: number): Promise<Bip44WrapperRow | typeof undefined>;

  addPublicDeriverFunctionality(publicDeriver: PublicDeriver): Promise<void>;
  addBip44WalletFunctionality(bip44Wallet: Bip44Wallet): Promise<void>;
}
