// @flow

/** Snapshot of a ConceptualWallet in the database */
export class ConceptualWallet {
  conceptualWalletId: number;

  constructor(conceptualWalletId: number) {
    this.conceptualWalletId = conceptualWalletId;
  }
}
