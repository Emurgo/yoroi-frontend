// @flow

import type {
  AccountingDerivationRow,
} from '../../database/walletTypes/common/tables';
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
} from '../common/interfaces';
import type {
  AddDerivationTree,
} from '../../database/walletTypes/common/api/write';

import type {
  lf$Database,
} from 'lovefield';

import { ModifyDisplayCutoff } from '../../database/walletTypes/bip44/api/write';
import type { IConceptualWalletConstructor, } from '../ConceptualWallet/interfaces';

import type {
  Cip1852WrapperRow,
} from '../../database/walletTypes/cip1852/tables';
import type {
  TreeInsert,
} from '../../database/walletTypes/common/utils';

import {
  GetPublicDeriver,
} from '../../database/walletTypes/core/api/read';
import { Cip1852Wallet } from './wrapper';

export interface ICip1852Wallet {
  constructor(
    db: lf$Database,
    conceptualWalletCtorData: IConceptualWalletConstructor,
    row: $ReadOnly<Cip1852WrapperRow>,
    privateDeriverLevel: number | null,
    privateDeriverKeyDerivationId: number | null,
    protocolMagic: number,
  ): ICip1852Wallet;
  getDb(): lf$Database;
  getWrapperId(): number;
  getPublicDeriverLevel(): number;
  getSigningLevel(): number | null;
  getPrivateDeriverLevel(): number | null;
  getPrivateDeriverKeyDerivationId(): number | null;
  getProtocolMagic(): number;
}

// =====================
//   For PublicDeriver
// =====================

export interface ICip1852Parent {
  +getCip1852Parent: (body: void) => Cip1852Wallet;
}

export type AccountingAddressPath = {|
  ...BaseAddressPath,
  row: $ReadOnly<AccountingDerivationRow>,
|};

export type IGetAllAccountingAddressesRequest = PathRequest;
export type IGetAllAccountingAddressesResponse = Array<AccountingAddressPath>;
export type IGetAllAccountingAddressesFunc = (
  body: IGetAllAccountingAddressesRequest
) => Promise<IGetAllAccountingAddressesResponse>;
export interface IGetAllAccounting {
  +rawGetAllAccountingAddresses: RawVariation<
    IGetAllAccountingAddressesFunc,
    {|
      GetPathWithSpecific: Class<GetPathWithSpecific>,
      GetAddress: Class<GetAddress>,
      GetDerivationSpecific: Class<GetDerivationSpecific>,
    |},
    IGetAllAccountingAddressesRequest
  >;
  +getAllAccountingAddresses: IGetAllAccountingAddressesFunc
}

export type IAddCip1852FromPublicRequest = {|
  tree: TreeInsert<any>,
|};
export type IAddCip1852FromPublicResponse = void;
export type IAddCip1852FromPublicFunc = (
  body: IAddCip1852FromPublicRequest
) => Promise<IAddCip1852FromPublicResponse>;
// TODO: I think we this can be deleted (same as bip44 case now)
export interface IAddCip1852FromPublic {
  +rawAddCip1852FromPublic: RawVariation<
    IAddCip1852FromPublicFunc,
    {|
      GetPublicDeriver: Class<GetPublicDeriver>,
      AddDerivationTree: Class<AddDerivationTree>,
      ModifyDisplayCutoff: Class<ModifyDisplayCutoff>,
      GetDerivationsByPath: Class<GetDerivationsByPath>,
      GetPathWithSpecific: Class<GetPathWithSpecific>,
      GetDerivationSpecific: Class<GetDerivationSpecific>,
    |},
    IAddCip1852FromPublicRequest
  >;
  +addCip1852FromPublic: IAddCip1852FromPublicFunc;
}
