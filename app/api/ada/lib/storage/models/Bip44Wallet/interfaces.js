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
  getDb(): lf$Database;
  getWrapperId(): number;
  getPublicDeriverLevel(): number;
  getSigningLevel(): number | null;
  getPrivateDeriverLevel(): number | null;
  getPrivateDeriverKeyDerivationId(): number | null;
  getProtocolMagic(): number;
}

export type IDerivePublicFromPrivateRequest = {|
  publicDeriverMeta: {|
    name: string,
  |},
  decryptPrivateDeriverPassword: null | string,
  /**
   * void -> do not store key
   * null -> store as unencrypted
   * string  -> store and encrypt
   */
  encryptPublicDeriverPassword?: null | string,
  initialDerivations: TreeInsert<any>,
  path: Array<number>,
|};
export type IDerivePublicFromPrivateResponse<Row> = AddPublicDeriverResponse<Row>;
export type IDerivePublicFromPrivateFunc<Row> = (
  body: IDerivePublicFromPrivateRequest
) => Promise<IDerivePublicFromPrivateResponse<Row>>;
export interface IDerivePublicFromPrivate {
  +rawDerivePublicDeriverFromPrivate: RawTableVariation<
    IDerivePublicFromPrivateFunc<mixed>,
    {|
      DerivePublicDeriverFromKey: Class<DerivePublicDeriverFromKey>,
    |},
    IDerivePublicFromPrivateRequest
  >;
  +derivePublicDeriverFromPrivate: IDerivePublicFromPrivateFunc<mixed>;
}

export type IGetPrivateDeriverKeyRequest = void;
export type IGetPrivateDeriverKeyResponse = {
  keyRow: $ReadOnly<KeyRow>,
  keyDerivation: $ReadOnly<KeyDerivationRow>,
};
export type IGetPrivateDeriverKeyFunc = (
  body: IGetPrivateDeriverKeyRequest
) => Promise<IGetPrivateDeriverKeyResponse>;
export interface IGetPrivateDeriverKey {
  +rawGetPrivateDeriverKey: RawVariation<
    IGetPrivateDeriverKeyFunc,
    {|
      GetKeyForDerivation: Class<GetKeyForDerivation>,
    |},
    IGetPrivateDeriverKeyRequest
  >;
  +getPrivateDeriverKey: IGetPrivateDeriverKeyFunc;

  +rawChangePrivateDeriverPassword: RawVariation<
    IChangePasswordRequestFunc,
    {|
      GetKeyForDerivation: Class<GetKeyForDerivation>,
      UpdateGet: Class<UpdateGet>,
    |},
    IChangePasswordRequest
  >;
  +changePrivateDeriverPassword: IChangePasswordRequestFunc,
}

export type IAddAdhocPublicDeriverRequest<Insert> = AddAdhocPublicDeriverRequest<Insert>;
export type IAddAdhocPublicDeriverResponse<Row> = AddAdhocPublicDeriverResponse<Row>;
export type IAddAdhocPublicDeriverFunc<Insert, Row> = (
  body: IAddAdhocPublicDeriverRequest<Insert>
) => Promise<IAddAdhocPublicDeriverResponse<Row>>;
export interface IAdhocPublicDeriver {
  +rawAddAdhocPubicDeriver: RawTableVariation<
    IAddAdhocPublicDeriverFunc<mixed, mixed>,
    {|
      AddAdhocPublicDeriver: Class<AddAdhocPublicDeriver>,
    |},
    IAddAdhocPublicDeriverRequest<mixed>,
  >;
  +addAdhocPubicDeriver: IAddAdhocPublicDeriverFunc<mixed, mixed>;
}

// =====================
//   For PublicDeriver
// =====================

export interface IBip44Parent {
  +getBip44Parent: (body: void) => Bip44Wallet;
}

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
