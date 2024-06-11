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
  type: number;
  status: string;
  time: string;
  feeValue?: number;
  feeValueUsd?: number;
  amountTotal: number;
  amountTotalUsd: number;
  amountAsset: number | string;
};
