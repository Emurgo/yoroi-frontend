// @flow

export const EmumNotice = Object.freeze({
  reward_recieved: 'reward_recieved',
  stake_pool_will_retire: 'stake_pool_will_retire',
});
export type NoticeType = $Values<typeof EmumNotice>;

export default class Notice {
  id: string = '';
  type: NoticeType
}
