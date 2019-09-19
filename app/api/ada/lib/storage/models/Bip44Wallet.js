// @flow

import { ConceptualWallet } from './ConceptualWallet';
import { PublicDeriver } from './PublicDeriver';

/** Snapshot of a Bip44Wallet in the database */
export class Bip44Wallet extends ConceptualWallet {
  bip44WrapperId: number;
  publicDerivers: Array<PublicDeriver>;

  constructor(conceptualWalletId: number, bip44WrapperId: number) {
    super(conceptualWalletId);
    this.bip44WrapperId = bip44WrapperId;
  }
}
