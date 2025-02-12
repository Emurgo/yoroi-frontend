import {Notifications} from '@yoroi/types'
import {Subject} from 'rxjs'
import {generateNotificationId} from './id';
import * as React from 'react'

export const transactionReceivedSubject = new Subject<Notifications.TransactionReceivedEvent>();

export const useTransactionReceivedNotifications = ({enabled}: {enabled: boolean}) => {
  React.useEffect(() => {
    if (!enabled) return
    const subscriptionBeginDate = new Date()
    const notifications: Array<Notifications.TransactionReceivedEvent> = [];
    // TODO: listen for new transactions
    // When you get a new transaction, populate `transactionReceivedSubject` with data created by `createTransactionReceivedNotification`
    // Note transaction confirmation date must be bigger than `subscriptionBeginDate`
    notifications.forEach(notification => transactionReceivedSubject.next(notification));
  },[enabled])
}

const createTransactionReceivedNotification = (
  metadata: Notifications.TransactionReceivedEvent['metadata'],
  date: Date,
): Notifications.TransactionReceivedEvent => {
  return {
    id: generateNotificationId(),
    date: date.toISOString(),
    isRead: false,
    trigger: Notifications.Trigger.TransactionReceived,
    metadata,
  } as const
}