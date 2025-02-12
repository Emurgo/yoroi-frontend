import { Notifications } from '@yoroi/types'
import { notificationManagerMaker } from '@yoroi/notifications';
import { transactionReceivedSubject } from './transaction-received-notification';
import { mountLocalStorage } from './storage';


const appStorage = mountLocalStorage({ path: '/' })
const notificationStorage = appStorage.join('notifications/')

export const notificationManager = notificationManagerMaker({
  eventsStorage: notificationStorage.join('events/'),
  configStorage: notificationStorage.join('settings/'),
  subscriptions: {
    [Notifications.Trigger.TransactionReceived]: transactionReceivedSubject,
  },
})
