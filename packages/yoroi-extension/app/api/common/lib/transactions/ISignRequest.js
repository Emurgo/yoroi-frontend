// @flow

import {
  MultiToken,
} from '../MultiToken';

export type SignedTx = {|
  id: string;
  encodedTx: Uint8Array;
|}

export type TxMetadata = {|
  label: string, data: any
|}

export interface ISignRequest<T> {
  inputs(): Array<{|
    address: string,
    value: MultiToken,
  |}>,
  totalInput(): MultiToken;
  outputs(): Array<{|
    address: string,
    value: MultiToken,
  |}>,
  totalOutput(): MultiToken;
  fee(): MultiToken;
  uniqueSenderAddresses(): Array<string>;
  receivers(includeChange: boolean): Array<string>;
  isEqual(tx: ?mixed): boolean;
  self(): T;
  +size?: () => {| full: number, outputs: number[] |};
  +sign?: (keyLevel: number,
    privateKey: string,
    stakingKeyWits: Set<string>,
    metadata: TxMetadata[]) => Promise<SignedTx>;
  neededStakingKeyHashes?: {|
    neededHashes: Set<string>, // StakeCredential
    wits: Set<string>, // Vkeywitness
  |}
}
