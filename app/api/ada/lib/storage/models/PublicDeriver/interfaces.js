// @flow

import type {
  lf$Database,
} from 'lovefield';

import {
  BigNumber
} from 'bignumber.js';

import { ConceptualWallet } from '../ConceptualWallet/index';

import {
  GetUtxoTxOutputsWithTx,
} from '../../database/transactionModels/utxo/api/read';
import type { UtxoTxOutput } from '../../database/transactionModels/utxo/api/read';

import type {
  AddressRow,
  KeyRow,
  CanonicalAddressRow,
  KeyDerivationRow,
} from '../../database/primitives/tables';
import type { PublicDeriverRow, LastSyncInfoRow, } from '../../database/walletTypes/core/tables';

import type {
  IChangePasswordRequestFunc, IChangePasswordRequest,
  Address, Addressing,
  RawVariation,
  RawTableVariation,
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
  ModifyDisplayCutoff,
} from '../../database/walletTypes/bip44/api/write';
import {
  AddDerivationTree,
} from '../../database/walletTypes/common/api/write';
import { GetDerivationSpecific } from '../../database/walletTypes/common/api/read';
import { UpdateGet, AddAddress, } from '../../database/primitives/api/write';
import type {
  FilterFunc,
} from '../../../state-fetch/types';

export type WalletAccountNumberPlate = {
  hash: string,
  id: string,
}

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

export type PathRequest = void;
export type BaseAddressPath = {|
  addrs: $ReadOnlyArray<$ReadOnly<AddressRow>>,
  row: $ReadOnly<CanonicalAddressRow>,
  ...Addressing,
|};
export type BaseSingleAddressPath = {|
  addr: $ReadOnly<AddressRow>,
  row: $ReadOnly<CanonicalAddressRow>,
  ...Addressing,
|};
export type UtxoAddressPath = {|
  ...BaseAddressPath,
|};

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
  +rawGetAllUtxos: RawTableVariation<
    IGetAllUtxosFunc,
    {|
      GetPathWithSpecific: Class<GetPathWithSpecific>,
      GetAddress: Class<GetAddress>,
      GetUtxoTxOutputsWithTx: Class<GetUtxoTxOutputsWithTx>,
      GetDerivationSpecific: Class<GetDerivationSpecific>,
    |},
    IGetAllUtxosRequest
  >;
  +getAllUtxos: IGetAllUtxosFunc;

  +rawGetAllUtxoAddresses: RawTableVariation<
    IGetAllUtxoAddressesFunc,
    {|
      GetPathWithSpecific: Class<GetPathWithSpecific>,
      GetAddress: Class<GetAddress>,
      GetDerivationSpecific: Class<GetDerivationSpecific>,
    |},
    IGetAllUtxoAddressesRequest
  >;
  +getAllUtxoAddresses: IGetAllUtxoAddressesFunc
}

export type IDisplayCutoffPopRequest = void;
export type IDisplayCutoffPopResponse = {
  index: number,
  row: $ReadOnly<CanonicalAddressRow>,
  addrs: $ReadOnlyArray<$ReadOnly<AddressRow>>,
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
  +rawPopAddress: RawTableVariation<
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

  +rawGetCutoff: RawTableVariation<
    IDisplayCutoffGetFunc,
    {|
      GetDerivationSpecific: Class<GetDerivationSpecific>,
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
export type IGetNextUnusedForChainResponse = {|
  addressInfo: void | BaseSingleAddressPath,
  index: number,
|};
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
export interface IHasChains {
  +rawGetAddressesForChain: RawTableVariation<
    IHasChainsGetAddressesFunc,
    {|
      GetAddress: Class<GetAddress>,
      GetPathWithSpecific: Class<GetPathWithSpecific>,
      GetDerivationSpecific: Class<GetDerivationSpecific>,
    |},
    IHasChainsRequest
  >;
  +getAddressesForChain: IHasChainsGetAddressesFunc;

  +rawNextInternal: RawTableVariation<
    IGetNextUnusedForChainFunc,
    {|
      GetUtxoTxOutputsWithTx: Class<GetUtxoTxOutputsWithTx>,
      GetAddress: Class<GetAddress>,
      GetPathWithSpecific: Class<GetPathWithSpecific>,
      GetDerivationSpecific: Class<GetDerivationSpecific>,
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
  +rawGetUtxoBalance: RawTableVariation<
    IGetUtxoBalanceFunc,
    {|
      GetPathWithSpecific: Class<GetPathWithSpecific>,
      GetAddress: Class<GetAddress>,
      GetUtxoTxOutputsWithTx: Class<GetUtxoTxOutputsWithTx>,
      GetDerivationSpecific: Class<GetDerivationSpecific>,
    |},
    IGetUtxoBalanceRequest
  >;
  +getUtxoBalance: IGetUtxoBalanceFunc;
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
  +rawScanAddresses: RawTableVariation<
    IScanAddressesFunc,
    {|
      GetKeyForPublicDeriver: Class<GetKeyForPublicDeriver>,
      GetAddress: Class<GetAddress>,
      GetPathWithSpecific: Class<GetPathWithSpecific>,
      GetUtxoTxOutputsWithTx: Class<GetUtxoTxOutputsWithTx>,
      AddAddress: Class<AddAddress>,
      GetPublicDeriver: Class<GetPublicDeriver>,
      AddDerivationTree: Class<AddDerivationTree>,
      ModifyDisplayCutoff: Class<ModifyDisplayCutoff>,
      GetDerivationsByPath: Class<GetDerivationsByPath>,
      GetPathWithSpecific: Class<GetPathWithSpecific>,
      GetDerivationSpecific: Class<GetDerivationSpecific>,
    |},
    IScanAddressesRequest
  >;
  +scanAddresses: IScanAddressesFunc;
}
