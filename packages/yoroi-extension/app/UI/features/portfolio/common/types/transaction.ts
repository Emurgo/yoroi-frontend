// @flow
export const HistoryItemType = Object.freeze({
  SENT: 1,
  RECEIVED: 2,
  ERROR: 3,
  WITHDRAW: 4,
  DELEGATE: 5,
});

export const HistoryItemStatus = Object.freeze({
  LOW: 'Low',
  HIGH: 'High',
  FAILED: 'Failed',
});

export type TransactionItemType = {
  type: typeof HistoryItemType,
  status: typeof HistoryItemStatus,
  time: number,
  feeValue?: number,
  feeValueUsd?: number,
  amountTotal: number,
  amountTotalUsd: number,
  amountAsset: number | string,
};
