// @flow

import type {
  lf$Database,
} from 'lovefield';

import type { IConceptualWalletConstructor, } from '../ConceptualWallet/interfaces';

import type {
  Bip44WrapperRow,
} from '../../database/walletTypes/bip44/tables';
import type {
  ModifyDisplayCutoff,
} from '../../database/walletTypes/bip44/api/write';
import type {
  AddDerivationTree,
} from '../../database/walletTypes/common/api/write';
import type {
  TreeInsert,
} from '../../database/walletTypes/common/utils';
import {
  GetPathWithSpecific,
  GetDerivationsByPath,
} from '../../database/primitives/api/read';

import type {
  RawTableVariation,
} from '../common/interfaces';
import {
  GetPublicDeriver,
} from '../../database/walletTypes/core/api/read';
import { GetDerivationSpecific } from '../../database/walletTypes/common/api/read';

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
