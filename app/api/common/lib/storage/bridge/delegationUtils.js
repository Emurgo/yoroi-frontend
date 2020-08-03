// @flow

import BigNumber from 'bignumber.js';
import {
  PublicDeriver,
} from '../../../../ada/lib/storage/models/PublicDeriver/index';
import type {
  IGetStakingKey,
} from '../../../../ada/lib/storage/models/PublicDeriver/interfaces';
import type { CertificateForKey } from '../../../../ada/lib/storage/database/primitives/api/read';
import type { ToRelativeSlotNumberFunc } from './timeUtils';

export type GetDelegatedBalanceRequest = {|
  publicDeriver: PublicDeriver<> & IGetStakingKey,
  rewardBalance: BigNumber,
  stakingAddress: string,
|};
export type GetDelegatedBalanceResponse = {|
  utxoPart: BigNumber,
  accountPart: BigNumber,
|};
export type GetDelegatedBalanceFunc = (
  request: GetDelegatedBalanceRequest
) => Promise<GetDelegatedBalanceResponse>;

export type GetCurrentDelegationRequest = {|
  publicDeriver: PublicDeriver<> & IGetStakingKey,
  stakingKeyAddressId: number,
  currentEpoch: number,
  toRelativeSlotNumber: ToRelativeSlotNumberFunc,
|};
export type PoolTuples = [
  string, // PoolId
  number, // parts
];
export type CertificateForEpoch = {|
  ...CertificateForKey,
  pools: Array<PoolTuples>,
|};
export type GetCurrentDelegationResponse = {|
  currEpoch: void | CertificateForEpoch,
  prevEpoch: void | CertificateForEpoch,
  prevPrevEpoch: void | CertificateForEpoch,
  fullHistory: Array<CertificateForKey>,
  allPoolIds: Array<string>
|};
export type GetCurrentDelegationFunc = (
  request: GetCurrentDelegationRequest
) => Promise<GetCurrentDelegationResponse>;
