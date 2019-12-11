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
  id: string = ''; // TODO: this should be something which makes a relationship between a wallet and a stake pool
  kind: NoticeKindType;
  date: Date

  constructor(data: {
    id: string,
    kind: NoticeKindType,
    date: Date,
  }) {
    Object.assign(this, data);
  }
}
