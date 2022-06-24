// @flow //

import type {
  OperationNameType,
  TransportIdType
} from './enum';
import type {
  ShowAddressRequest,
} from '@cardano-foundation/ledgerjs-hw-app-cardano';

export type MessageType = {
  action: string,
  extension: ?string,
  success: boolean,
  payload: any
};

export type RequestType = {
  action: OperationNameType,
  params: any,
}

export type URLParams = {
  transportId: TransportIdType,
  locale: string
}

export type GetVersionRequest = void;
export type GetSerialRequest = void;

export type ShowAddressRequestWrapper = {|
  ...ShowAddressRequest,
  expectedAddr: string,
|};
