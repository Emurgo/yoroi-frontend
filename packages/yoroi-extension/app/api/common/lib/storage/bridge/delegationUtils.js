// @flow

import {
  PublicDeriver,
} from '../../../../ada/lib/storage/models/PublicDeriver/index';
import type {
  IGetStakingKey,
} from '../../../../ada/lib/storage/models/PublicDeriver/interfaces';
import { MultiToken } from '../../MultiToken';

export type GetDelegatedBalanceRequest = {|
  publicDeriver: PublicDeriver<> & IGetStakingKey,
  rewardBalance: MultiToken,
  stakingAddress: string,
  delegation: string | null,
  allRewards: string | null,
  stakeRegistered: ?boolean,
|};
export type GetDelegatedBalanceResponse = {|
  utxoPart: MultiToken,
  accountPart: MultiToken,
  delegation: string | null,
  allRewards: string | null,
  stakeRegistered: ?boolean,
|};
export type GetDelegatedBalanceFunc = (
  request: GetDelegatedBalanceRequest
) => Promise<GetDelegatedBalanceResponse>;

export type RewardHistoryRequest = string;
export type RewardHistoryResponse = Array<[
  number, // epoch
  MultiToken, // amount
  string, // poolHash
]>;
export type RewardHistoryFunc = (
  request: RewardHistoryRequest
) => Promise<RewardHistoryResponse>;
