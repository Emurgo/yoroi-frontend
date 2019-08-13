// @flow

/** Snapshot of a Bip44Wallet in the database */
export class PublicDeriver {
  publicDeriverId: number;

  constructor(publicDeriverId: number) {
    this.publicDeriverId = publicDeriverId;
  }
}
