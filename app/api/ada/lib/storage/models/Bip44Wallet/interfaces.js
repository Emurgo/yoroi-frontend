// @flow

import type {
  lf$Database,
} from 'lovefield';

import type { IConceptualWalletConstructor, } from '../ConceptualWallet/interfaces';

import type {
  Bip44WrapperRow,
} from '../../database/walletTypes/bip44/tables';

export interface IBip44Wallet {
  constructor(
    db: lf$Database,
    conceptualWalletCtorData: IConceptualWalletConstructor,
    row: $ReadOnly<Bip44WrapperRow>,
    privateDeriverLevel: number | null,
    privateDeriverKeyDerivationId: number | null,
  ): IBip44Wallet;
  getWrapperId(): number;
}
