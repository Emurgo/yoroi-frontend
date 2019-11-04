// @flow

import type {
  lf$Database, lf$Transaction,
} from 'lovefield';

import {
  BigNumber
} from 'bignumber.js';

import { Bip44Wallet } from '../Bip44Wallet/index';
import { ConceptualWallet } from '../ConceptualWallet/index';

import type {
  TreeInsert,
} from '../../database/walletTypes/bip44/api/write';
import type {
  Bip44AddressRow,
  AccountingDerivationRow,
} from '../../database/walletTypes/common/tables';

import {
  GetUtxoTxOutputsWithTx,
} from '../../database/transactionModels/utxo/api/read';
import type { UtxoTxOutput } from '../../database/transactionModels/utxo/api/read';

import type {
  AddressRow,
  KeyRow,
  KeyDerivationRow,
} from '../../database/primitives/tables';
import type { PublicDeriverRow, LastSyncInfoRow, } from '../../database/walletTypes/core/tables';

import type {
  IChangePasswordRequestFunc, IChangePasswordRequest,
  Address, Addressing,
} from '../common/interfaces';
import {
  GetPublicDeriver,
  GetKeyForPublicDeriver,
  GetLastSyncForPublicDeriver,
} from '../../database/walletTypes/core/api/read';
import {
  GetPathWithSpecific,
  GetDerivationsByPath,
  GetKeyDerivation,
  GetKey,
  GetAddress,
} from '../../database/primitives/api/read';
import {
  AddBip44Tree,
  ModifyDisplayCutoff,
} from '../../database/walletTypes/bip44/api/write';
import { GetBip44DerivationSpecific } from '../../database/walletTypes/bip44/api/read';
import { UpdateGet, GetOrAddAddress, } from '../../database/primitives/api/write';
import type {
  FilterFunc,
} from '../../../state-fetch/types';

export type WalletAccountNumberPlate = {
  hash: string,
  id: string,
}

type RawVariation<Func, Deps, Arg> = (
  tx: lf$Transaction,
  deps: Deps,
  // should be able to extract Arg type with a $Call on Func
  // but for some reason it isn't working :/
  body: Arg,
) => ReturnType<Func>;

export type IPublicDeriverConstructor = {
  publicDeriverId: number,
  conceptualWallet: ConceptualWallet,
  pathToPublic: Array<number>;
  derivationId: number,
};
export interface IPublicDeriver {
  constructor(data: IPublicDeriverConstructor): IPublicDeriver;
  getDb(): lf$Database;
  getPublicDeriverId(): number;
  getConceptualWallet(): ConceptualWallet;
  getPathToPublic(): Array<number>;
  getDerivationId(): number;
  getFullPublicDeriverInfo(): Promise<$ReadOnly<PublicDeriverRow>>;
}

export interface IBip44Parent {
  +getBip44Parent: (body: void) => Bip44Wallet;
}

export type PathRequest = void;
type BaseAddressPath = {|
  addr: $ReadOnly<AddressRow>,
  ...Addressing,
|};
export type UtxoAddressPath = {|
  ...BaseAddressPath,
  row: $ReadOnly<Bip44AddressRow>,
|};
export type AccountingAddressPath = {|
  ...BaseAddressPath,
  row: $ReadOnly<AccountingDerivationRow>,
|};

export type IAddFromPublicRequest = {|
  tree: TreeInsert<any>,
|};
export type IAddFromPublicResponse = void;
export type IAddFromPublicFunc = (
  body: IAddFromPublicRequest
) => Promise<IAddFromPublicResponse>;
export interface IAddFromPublic {
  +rawAddFromPublic: RawVariation<
    IAddFromPublicFunc,
    {|
      GetPublicDeriver: Class<GetPublicDeriver>,
      AddBip44Tree: Class<AddBip44Tree>,
      ModifyDisplayCutoff: Class<ModifyDisplayCutoff>,
      GetDerivationsByPath: Class<GetDerivationsByPath>,
      GetPathWithSpecific: Class<GetPathWithSpecific>,
      GetBip44DerivationSpecific: Class<GetBip44DerivationSpecific>,
    |},
    IAddFromPublicRequest
  >;
  +addFromPublic: IAddFromPublicFunc;
}

export type IGetPublicRequest = void;
export type IGetPublicResponse = $ReadOnly<KeyRow>;
export type IGetPublicFunc = (
  body: IGetPublicRequest
) => Promise<IGetPublicResponse>;
export interface IGetPublic {
  +rawGetPublicKey: RawVariation<
  IGetPublicFunc,
    {| GetKeyForPublicDeriver: Class<GetKeyForPublicDeriver> |},
    IGetPublicRequest
  >;
  +getPublicKey: IGetPublicFunc;

  +rawChangePubDeriverPassword: RawVariation<
    IChangePasswordRequestFunc,
    {| UpdateGet: Class<UpdateGet>, GetKeyForPublicDeriver: Class<GetKeyForPublicDeriver> |},
    IChangePasswordRequest
  >;
  +changePubDeriverPassword: IChangePasswordRequestFunc,
}

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
      GetBip44DerivationSpecific: Class<GetBip44DerivationSpecific>,
    |},
    IGetAllAccountingAddressesRequest
  >;
  +getAllAccountingAddresses: IGetAllAccountingAddressesFunc
}

export type IGetAllUtxoAddressesRequest = PathRequest;
export type IGetAllUtxoAddressesResponse = Array<UtxoAddressPath>;
export type IGetAllUtxoAddressesFunc = (
  body: IGetAllUtxoAddressesRequest
) => Promise<IGetAllUtxoAddressesResponse>;
export type IGetAllUtxosRequest = void;
export type IGetAllUtxosResponse = Array<{|
  output: $ReadOnly<UtxoTxOutput>;
  ...Addressing,
  ...Address,
|}>;
export type IGetAllUtxosFunc = (
  body: IGetAllUtxosRequest
) => Promise<IGetAllUtxosResponse>;
export interface IGetAllUtxos {
  +rawGetAllUtxos: RawVariation<
    IGetAllUtxosFunc,
    {|
      GetPathWithSpecific: Class<GetPathWithSpecific>,
      GetAddress: Class<GetAddress>,
      GetUtxoTxOutputsWithTx: Class<GetUtxoTxOutputsWithTx>,
      GetBip44DerivationSpecific: Class<GetBip44DerivationSpecific>,
    |},
    IGetAllUtxosRequest
  >;
  +getAllUtxos: IGetAllUtxosFunc;

  +rawGetAllUtxoAddresses: RawVariation<
    IGetAllUtxoAddressesFunc,
    {|
      GetPathWithSpecific: Class<GetPathWithSpecific>,
      GetAddress: Class<GetAddress>,
      GetBip44DerivationSpecific: Class<GetBip44DerivationSpecific>,
    |},
    IGetAllUtxoAddressesRequest
  >;
  +getAllUtxoAddresses: IGetAllUtxoAddressesFunc
}

export type IDisplayCutoffPopRequest = void;
export type IDisplayCutoffPopResponse = {
  index: number,
  row: $ReadOnly<Bip44AddressRow>,
  addr: $ReadOnly<AddressRow>,
};
export type IDisplayCutoffPopFunc = (
  body: IDisplayCutoffPopRequest
) => Promise<IDisplayCutoffPopResponse>;

export type IDisplayCutoffGetRequest = void;
export type IDisplayCutoffGetResponse = number;
export type IDisplayCutoffGetFunc = (
  body: IDisplayCutoffGetRequest
) => Promise<IDisplayCutoffGetResponse>;

export type IDisplayCutoffSetRequest = {
  newIndex: number,
};
export type IDisplayCutoffSetResponse = void;
export type IDisplayCutoffSetFunc = (
  body: IDisplayCutoffSetRequest
) => Promise<IDisplayCutoffSetResponse>;

export interface IDisplayCutoff {
  +rawPopAddress: RawVariation<
    IDisplayCutoffPopFunc,
    {|
      ModifyDisplayCutoff: Class<ModifyDisplayCutoff>,
      GetAddress: Class<GetAddress>,
    |},
    IDisplayCutoffPopRequest
  >;
  /**
   * Throws exception if there are no addresses to pop
   * Chain must have a non-null DisplayCutoff
   */
  +popAddress: IDisplayCutoffPopFunc;

  +rawGetCutoff: RawVariation<
    IDisplayCutoffGetFunc,
    {|
      GetBip44DerivationSpecific: Class<GetBip44DerivationSpecific>,
      GetPathWithSpecific: Class<GetPathWithSpecific>
    |},
    IDisplayCutoffGetRequest
  >;
  +getCutoff: IDisplayCutoffGetFunc,

  +rawSetCutoff: RawVariation<
    IDisplayCutoffSetFunc,
    {|
      ModifyDisplayCutoff: Class<ModifyDisplayCutoff>,
      GetDerivationsByPath: Class<GetDerivationsByPath>
    |},
    IDisplayCutoffSetRequest
  >;
  +setCutoff: IDisplayCutoffSetFunc,
}

export type IGetNextUnusedForChainRequest = void;
export type IGetNextUnusedForChainResponse = {
  addressInfo: void | UtxoAddressPath,
  index: number,
};
export type IGetNextUnusedForChainFunc = (
  body: IGetNextUnusedForChainRequest
) => Promise<IGetNextUnusedForChainResponse>;
export type IHasChainsRequest = {|
  chainId: number,
|};
export type IHasChainsResponse = Array<UtxoAddressPath>;
export type IHasChainsGetAddressesFunc = (
  body: IHasChainsRequest
) => Promise<IHasChainsResponse>;
export type IHasChainsNextUnusedFunc = (
  body: IHasChainsRequest
) => Promise<IGetNextUnusedForChainResponse>;
export interface IHasChains {
  +rawGetAddressesForChain: RawVariation<
    IHasChainsGetAddressesFunc,
    {|
      GetAddress: Class<GetAddress>,
      GetPathWithSpecific: Class<GetPathWithSpecific>,
      GetBip44DerivationSpecific: Class<GetBip44DerivationSpecific>,
    |},
    IHasChainsRequest
  >;
  +getAddressesForChain: IHasChainsGetAddressesFunc;

  +rawNextInternal: RawVariation<
    IGetNextUnusedForChainFunc,
    {|
      GetUtxoTxOutputsWithTx: Class<GetUtxoTxOutputsWithTx>,
      GetAddress: Class<GetAddress>,
      GetPathWithSpecific: Class<GetPathWithSpecific>,
      GetBip44DerivationSpecific: Class<GetBip44DerivationSpecific>,
    |},
    IGetNextUnusedForChainRequest
  >;
  +nextInternal: IGetNextUnusedForChainFunc;
}

export type IGetUtxoBalanceRequest = void;
export type IGetUtxoBalanceResponse = BigNumber;
export type IGetUtxoBalanceFunc = (
  body: IGetUtxoBalanceRequest
) => Promise<IGetUtxoBalanceResponse>;
export interface IGetUtxoBalance {
  +rawGetBalance: RawVariation<
    IGetUtxoBalanceFunc,
    {|
      GetPathWithSpecific: Class<GetPathWithSpecific>,
      GetAddress: Class<GetAddress>,
      GetUtxoTxOutputsWithTx: Class<GetUtxoTxOutputsWithTx>,
      GetBip44DerivationSpecific: Class<GetBip44DerivationSpecific>,
    |},
    IGetUtxoBalanceRequest
  >;
  +getBalance: IGetUtxoBalanceFunc;
}

export type IGetSigningKeyRequest = void;
export type IGetSigningKeyResponse = {
  level: number,
  path: $ReadOnlyArray<$ReadOnly<KeyDerivationRow>>,
  row: $ReadOnly<KeyRow>,
};
export type IGetSigningKeyFunc = (
  body: IGetSigningKeyRequest
) => Promise<IGetSigningKeyResponse>;
export type INormalizeKeyRequest = IGetSigningKeyResponse & {
  password: string,
};
export type INormalizeKeyResponse = {
  prvKeyHex: string,
  pubKeyHex: string,
};
export type INormalizeKeyFunc = (
  body: INormalizeKeyRequest
) => Promise<INormalizeKeyResponse>;
export interface IGetSigningKey {
  +rawGetSigningKey: RawVariation<
    IGetSigningKeyFunc,
    {|
      GetDerivationsByPath: Class<GetDerivationsByPath>,
      GetPublicDeriver: Class<GetPublicDeriver>,
      GetKeyDerivation: Class<GetKeyDerivation>,
      GetKey: Class<GetKey>,
    |},
    IGetSigningKeyRequest
  >;
  +getSigningKey: IGetSigningKeyFunc;

  /**
   * The signing level may not be the same as the public deriver level
   * so uses derivations to normalize the key to the public deriver level
   */
  +normalizeKey: INormalizeKeyFunc;

  +rawChangeSigningKeyPassword: RawVariation<
    IChangePasswordRequestFunc,
    {|
      GetDerivationsByPath: Class<GetDerivationsByPath>,
      GetPublicDeriver: Class<GetPublicDeriver>,
      GetKeyDerivation: Class<GetKeyDerivation>,
      GetKey: Class<GetKey>,
      UpdateGet: Class<UpdateGet>,
    |},
    IChangePasswordRequest
  >;
  +changeSigningKeyPassword: IChangePasswordRequestFunc,
}

export type IGetLastSyncInfoRequest = void;
export type IGetLastSyncInfoResponse = $ReadOnly<LastSyncInfoRow>;
export type IGetLastSyncInfoFunc = (
  body: IGetLastSyncInfoRequest
) => Promise<IGetLastSyncInfoResponse>;
export interface IGetLastSyncInfo {
  +rawGetLastSyncInfo: RawVariation<
    IGetLastSyncInfoFunc,
    {|
      GetLastSyncForPublicDeriver: Class<GetLastSyncForPublicDeriver>,
    |},
    IGetLastSyncInfoRequest
  >;
  +getLastSyncInfo: IGetLastSyncInfoFunc;
}


export type IScanAddressesRequest = {
  checkAddressesInUse: FilterFunc,
};
export type IScanAddressesResponse = void;
export type IScanAddressesFunc = (
  body: IScanAddressesRequest
) => Promise<IScanAddressesResponse>;
export interface IScanAddresses {
  +rawScanAddresses: RawVariation<
    IScanAddressesFunc,
    {|
      GetKeyForPublicDeriver: Class<GetKeyForPublicDeriver>,
      GetAddress: Class<GetAddress>,
      GetPathWithSpecific: Class<GetPathWithSpecific>,
      GetUtxoTxOutputsWithTx: Class<GetUtxoTxOutputsWithTx>,
      GetOrAddAddress: Class<GetOrAddAddress>,
      GetPublicDeriver: Class<GetPublicDeriver>,
      AddBip44Tree: Class<AddBip44Tree>,
      ModifyDisplayCutoff: Class<ModifyDisplayCutoff>,
      GetDerivationsByPath: Class<GetDerivationsByPath>,
      GetPathWithSpecific: Class<GetPathWithSpecific>,
      GetBip44DerivationSpecific: Class<GetBip44DerivationSpecific>,
    |},
    IScanAddressesRequest
  >;
  +scanAddresses: IScanAddressesFunc;
}
