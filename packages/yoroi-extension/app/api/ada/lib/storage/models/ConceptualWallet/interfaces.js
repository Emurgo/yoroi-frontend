// @flow

import type {
  lf$Database, lf$Transaction,
} from 'lovefield';
import type { HwWalletMetaRow } from '../../database/walletTypes/core/tables';

import {
  DerivePublicDeriverFromKey, AddAdhocPublicDeriver,
} from '../../database/walletTypes/common/api/write';
import type {
  AddAdhocPublicDeriverRequest, AddAdhocPublicDeriverResponse,
} from '../../database/walletTypes/common/api/write';
import type {
  TreeInsert,
} from '../../database/walletTypes/common/utils.types';
import type { AddPublicDeriverResponse } from '../../database/walletTypes/core/api/write';
import { ModifyKey, } from '../../database/primitives/api/write';
import {
  GetKeyForDerivation,
} from '../../database/primitives/api/read';

import type {
  KeyRow,
  KeyDerivationRow,
  NetworkRow,
  TokenRow,
} from '../../database/primitives/tables';

import type {
  IChangePasswordRequest, IChangePasswordRequestFunc,
  RawVariation, RawTableVariation,
} from '../common/interfaces';

export const WalletTypeOption = Object.freeze({
  WEB_WALLET: 0,
  HARDWARE_WALLET: 1
});
export type WalletType = $Values<typeof WalletTypeOption>;

export type IConceptualWalletConstructor = {|
  db: lf$Database,
  conceptualWalletId: number,
  walletType: WalletType,
  hardwareInfo: ?$ReadOnly<HwWalletMetaRow>,
  networkInfo: $ReadOnly<NetworkRow>,
  defaultToken: $ReadOnly<TokenRow>,
|};

export interface IConceptualWallet {
  constructor(data: IConceptualWalletConstructor): IConceptualWallet;
  getWalletType(): WalletType;
  getHwWalletMeta(): ?$ReadOnly<HwWalletMetaRow>;
  getDb(): lf$Database;
  getConceptualWalletId(): number;
  getNetworkInfo(): $ReadOnly<NetworkRow>;
  rawRemove(db: lf$Database, tx: lf$Transaction): Promise<void>
}

export interface IHasPrivateDeriver {
  getPrivateDeriverLevel(): number | null;
  getPrivateDeriverKeyDerivationId(): number | null;
}

export interface IHasLevels {
  getPublicDeriverLevel(): number;
  getDerivationTables(): Map<number, string>;
}

export interface IHasSign {
  getSigningLevel(): number | null;
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
  path: Array<{|
    index: number,
    insert: any,
  |}>,
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
export type IGetPrivateDeriverKeyResponse = {|
  keyRow: $ReadOnly<KeyRow>,
  keyDerivation: $ReadOnly<KeyDerivationRow>,
|};
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
      ModifyKey: Class<ModifyKey>,
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
