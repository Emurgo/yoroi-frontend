import {Notifications} from '@yoroi/types'
import {Subject} from 'rxjs'

export const transactionReceivedSubject = new Subject<Notifications.TransactionReceivedEvent>();
