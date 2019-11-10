// @flow

import type {
  AddressType
} from '../../adaTypes';


// Temporary place to store types until we split off the API

// updateBestBlockNumber

export type UpdateBestBlockNumberRequest = {
  bestBlockNum: number
};
export type UpdateBestBlockNumberResponse = void;
export type UpdateBestBlockNumberFunc = (
  request: UpdateBestBlockNumberRequest
) => Promise<UpdateBestBlockNumberResponse>;

// getAddressList

export type GetAddressListRequest = void;
export type GetAddressListResponse = Array<string>;
export type GetAddressListFunc = (
  request: GetAddressListRequest
) => Promise<GetAddressListResponse>;

// saveAsAdaAddresses

export type SaveAsAdaAddressesRequest = {
  accountIndex: number,
  addresses: Array<string>,
  offset: number,
  addressType: AddressType,
};
export type SaveAsAdaAddressesResponse = void;
export type SaveAsAdaAddressesFunc = (
  request: SaveAsAdaAddressesRequest
) => Promise<SaveAsAdaAddressesResponse>;
