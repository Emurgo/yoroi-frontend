// @flow

import type {
  lf$Database,
} from 'lovefield';

import {
  BigNumber
} from 'bignumber.js';

import { ConceptualWallet } from '../ConceptualWallet/index';
import type { IConceptualWallet } from '../ConceptualWallet/interfaces';

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
import {
  EXTERNAL,
  INTERNAL,
} from '../../../../../../config/numbersConfig';
import type {
  TreeInsert,
} from '../../database/walletTypes/common/utils';
import type { Bip44ChainInsert } from '../../database/walletTypes/common/tables';

export type WalletAccountNumberPlate = {
  hash: string,
  id: string,
}

export type Address = {|
  +address: string,
|};
export type Value = {|
  /**
   * note: an undefined value is different than a value of 0
   * since you can have a UTXO with a value of 0
   * which is different from having no UTXO at all
   */
  +value: void | BigNumber,
|};
export type Addressing = {|
  +addressing: {|
    +path: Array<number>,
    +startLevel: number,
  |}
|};

export type UsedStatus = {|
  isUsed: boolean,
|};


export type IPublicDeriverConstructor<+Parent: IConceptualWallet> = {
  publicDeriverId: number,
  +parent: Parent,
  pathToPublic: Array<number>;
  derivationId: number,
};
export interface IPublicDeriver<+Parent: ConceptualWallet = ConceptualWallet> {
  constructor(data: IPublicDeriverConstructor<Parent>): IPublicDeriver<Parent>;
  getDb(): lf$Database;
  getPublicDeriverId(): number;
  getParent(): Parent;
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
export type IHasUtxoChainsRequest = {|
  chainId: typeof EXTERNAL | typeof INTERNAL,
|};
export type IHasUtxoChainsResponse = Array<UtxoAddressPath>;
export type IHasUtxoChainsGetAddressesFunc = (
  body: IHasUtxoChainsRequest
) => Promise<IHasUtxoChainsResponse>;
export interface IHasUtxoChains {
  +rawGetAddressesForChain: RawTableVariation<
    IHasUtxoChainsGetAddressesFunc,
    {|
      GetAddress: Class<GetAddress>,
      GetPathWithSpecific: Class<GetPathWithSpecific>,
      GetDerivationSpecific: Class<GetDerivationSpecific>,
    |},
    IHasUtxoChainsRequest
  >;
  +getAddressesForChain: IHasUtxoChainsGetAddressesFunc;

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
      GetDerivationSpecific: Class<GetDerivationSpecific>,
    |},
    IScanAddressesRequest
  >;
  +scanAddresses: IScanAddressesFunc;
}

export type IGetBalanceRequest = void;
export type IGetBalanceResponse = BigNumber;
export type IGetBalanceFunc = (
  body: IGetBalanceRequest
) => Promise<IGetBalanceResponse>;
export interface IGetBalance {
  +getBalance: IGetBalanceFunc;
}

export type IScanAccountRequest = {|
  accountPublicKey: string,
  lastUsedInternal: number,
  lastUsedExternal: number,
  internalAddresses: Array<number>,
  externalAddresses: Array<number>,
  checkAddressesInUse: FilterFunc,
|};
export type IScanAccountResponse = TreeInsert<Bip44ChainInsert>;
export type IScanAccountFunc = (
  body: IScanAccountRequest
) => Promise<IScanAccountResponse>;

export interface IScanUtxo {
  +rawScanAccount: RawTableVariation<
    IScanAccountFunc,
    {|
      GetPathWithSpecific: Class<GetPathWithSpecific>,
      GetAddress: Class<GetAddress>,
      GetDerivationSpecific: Class<GetDerivationSpecific>,
    |},
    IScanAccountRequest
  >;
}

export type AccountingAddressPath = {|
  ...BaseAddressPath,
|};

export type IGetStakingKeyRequest = void;
export type IGetStakingKeyResponse = BaseSingleAddressPath;
export type IGetStakingKeyFunc = (
  body: IGetStakingKeyRequest
) => Promise<IGetStakingKeyResponse>;

export interface IGetStakingKey {
  +rawGetStakingKey: RawTableVariation<
  IGetStakingKeyFunc,
    {|
      GetPathWithSpecific: Class<GetPathWithSpecific>,
      GetAddress: Class<GetAddress>,
      GetDerivationSpecific: Class<GetDerivationSpecific>,
    |},
    IGetStakingKeyRequest
  >;

  +getStakingKey: IGetStakingKeyFunc
}


export type IGetAllAccountingAddressesRequest = void;
export type IGetAllAccountingAddressesResponse = Array<AccountingAddressPath>;
export type IGetAllAccountingAddressesFunc = (
  body: IGetAllAccountingAddressesRequest
) => Promise<IGetAllAccountingAddressesResponse>;
export interface IGetAllAccounting {
  +rawGetAllAccountingAddresses: RawTableVariation<
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
