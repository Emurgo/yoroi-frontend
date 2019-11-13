// @flow

import type {
  lf$Database,
} from 'lovefield';

import type { IConceptualWalletConstructor, } from '../ConceptualWallet/interfaces';

import type {
  Bip44WrapperRow,
} from '../../database/walletTypes/bip44/tables';
import {
  DerivePublicDeriverFromKey, AddAdhocPublicDeriver,
} from '../../database/walletTypes/common/api/write';
import type {
  ModifyDisplayCutoff,
} from '../../database/walletTypes/bip44/api/write';
import type {
  AddAdhocPublicDeriverRequest, AddAdhocPublicDeriverResponse,
  AddDerivationTree,
} from '../../database/walletTypes/common/api/write';
import type {
  TreeInsert,
} from '../../database/walletTypes/common/utils';
import type { AddPublicDeriverResponse } from '../../database/walletTypes/core/api/write';
import { UpdateGet, } from '../../database/primitives/api/write';
import {
  GetKeyForDerivation,
  GetPathWithSpecific,
  GetDerivationsByPath,
} from '../../database/primitives/api/read';

import type {
  KeyRow,
  KeyDerivationRow
} from '../../database/primitives/tables';

import type {
  IChangePasswordRequest, IChangePasswordRequestFunc,
  RawVariation, RawTableVariation,
} from '../common/interfaces';
import { Bip44Wallet } from './wrapper';
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
    protocolMagic: number,
  ): IBip44Wallet;
  // TODO: can get rid of this with getPArent
  getDb(): lf$Database;
  // TODO: can get rid of this with getPArent
  getWrapperId(): number;
}

// =====================
//   For PublicDeriver
// =====================

export type IAddBip44FromPublicRequest = {|
  tree: TreeInsert<any>,
|};
export type IAddBip44FromPublicResponse = void;
export type IAddBip44FromPublicFunc = (
  body: IAddBip44FromPublicRequest
) => Promise<IAddBip44FromPublicResponse>;
export interface IAddBip44FromPublic {
  +rawAddBip44FromPublic: RawTableVariation<
    IAddBip44FromPublicFunc,
    {|
      GetPublicDeriver: Class<GetPublicDeriver>,
      AddDerivationTree: Class<AddDerivationTree>,
      ModifyDisplayCutoff: Class<ModifyDisplayCutoff>,
      GetDerivationsByPath: Class<GetDerivationsByPath>,
      GetPathWithSpecific: Class<GetPathWithSpecific>,
      GetDerivationSpecific: Class<GetDerivationSpecific>,
    |},
    IAddBip44FromPublicRequest
  >;
  +addBip44FromPublic: IAddBip44FromPublicFunc;
}
