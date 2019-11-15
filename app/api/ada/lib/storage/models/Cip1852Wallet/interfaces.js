// @flow

import type {
  CanonicalAddressRow,
} from '../../database/primitives/tables';
import { GetDerivationSpecific } from '../../database/walletTypes/common/api/read';
import {
  GetPathWithSpecific,
  GetAddress,
  GetDerivationsByPath,
} from '../../database/primitives/api/read';
import type {
  PathRequest,
  BaseAddressPath,
} from '../PublicDeriver/interfaces';
import type {
  RawVariation,
  RawTableVariation,
} from '../common/interfaces';
import type {
  AddDerivationTree,
} from '../../database/walletTypes/common/api/write';

import type {
  lf$Database,
} from 'lovefield';

import type { IConceptualWalletConstructor, } from '../ConceptualWallet/interfaces';

import type {
  Cip1852WrapperRow,
} from '../../database/walletTypes/cip1852/tables';

export interface ICip1852Wallet {
  constructor(
    db: lf$Database,
    conceptualWalletCtorData: IConceptualWalletConstructor,
    row: $ReadOnly<Cip1852WrapperRow>,
    privateDeriverLevel: number | null,
    privateDeriverKeyDerivationId: number | null,
    protocolMagic: number,
  ): ICip1852Wallet;
  getWrapperId(): number;
}
