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
  type: typeof HistoryItemType[keyof typeof HistoryItemType];
  status: typeof HistoryItemStatus[keyof typeof HistoryItemStatus];
  time: string;
  feeValue?: number;
  feeValueUsd?: number;
  amountTotal: number;
  amountTotalUsd: number;
  amountAsset: number | string;
};
