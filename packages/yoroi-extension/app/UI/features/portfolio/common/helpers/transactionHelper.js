// @flow
import { HistoryItemStatus, HistoryItemType, TransactionItemType } from '../types/transaction';

export const mapStrings = (arr: TransactionItemType[], strings: any) =>
  arr.map(item => {
    let labelTemp = '';
    let statusTemp = '';

    switch (item.type) {
      case HistoryItemType.SENT:
        labelTemp = strings.sent;
        break;
      case HistoryItemType.RECEIVED:
        labelTemp = strings.received;
        break;
      case HistoryItemType.ERROR:
        labelTemp = strings.transactionError;
        break;
      case HistoryItemType.WITHDRAW:
        labelTemp = strings.rewardWithdraw;
        break;
      case HistoryItemType.DELEGATE:
        labelTemp = strings.stakeDelegate;
        break;

      default:
        break;
    }

    switch (item.status) {
      case HistoryItemStatus.LOW:
        statusTemp = strings.low;
        break;
      case HistoryItemStatus.HIGH:
        statusTemp = strings.high;
        break;
      case HistoryItemStatus.FAILED:
        statusTemp = strings.failed;
        break;
      default:
        break;
    }

    return {
      ...item,
      label: labelTemp,
      status: statusTemp,
    };
  });
