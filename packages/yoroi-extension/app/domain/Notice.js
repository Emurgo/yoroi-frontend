// @flow
export const NoticeKind = {
  STAKE_DELEGATED: 0,
  STAKE_UNDELEGATED: 1,
  STAKE_REDELEGATED: 2,
  FEE_CHANGED: 3,
  COST_CHANGED: 4,
  REWARD_RECEIVED: 5,
  POOL_TO_RETIRE: 6,
  NO_REWARDS_FOR_UNDELEGATION: 7 // TODO: Right now it's Questionable
};
export type NoticeKindType = $Values<typeof NoticeKind>;

export default class Notice {
  id: string; // TODO: something which makes a relationship between a wallet and a stake pool
  kind: NoticeKindType;
  date: Date;
  poolTicker: string = 'EMG1';
  oldPoolTicker: ?string = 'EMG2'; // for STAKE_REDELEGATED
  oldFee: ?number = 0.017; // for FEE_CHANGED (in ADA)
  newFee: ?number = 0.020; // for FEE_CHANGED (in ADA)
  oldCost: ?number = 4.67; // for COST_CHANGED (in ADA)
  newCost: ?number = 8.08; // for COST_CHANGED (in ADA)
  rewardAmount: ?number = 20.082; // for REWARD_RECEIVED (in ADA)
  epochNumber: ?number = 199; // for REWARD_RECEIVED (in ADA)

  // TODO: remove all defaults and accept all parameters
  constructor(data: {|
    id: string,
    kind: NoticeKindType,
    date: Date,
    oldPoolTicker?: string,
    oldFee?: number,
    newFee?: number,
    oldCost?: number,
    newCost?: number,
  |}) {
    Object.assign(this, data);
  }
}
