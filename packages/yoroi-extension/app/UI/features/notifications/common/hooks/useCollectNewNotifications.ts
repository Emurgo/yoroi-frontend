import {useNotificationManager} from "@yoroi/notifications";
import * as React from "react";
import {Notifications} from '@yoroi/types'


type UseCollectNewNotificationsParams = {
  enabled: boolean;
  walletId: string;
}

export const useCollectNewNotifications = ({enabled, walletId}: UseCollectNewNotificationsParams) => {
  const manager = useNotificationManager()
  const selectedWalletId = walletId;
  const [events, setEvents] = React.useState<Notifications.Event[]>([])

  React.useEffect(() => {
    if (!enabled) return
    const pushEvent = (event: Notifications.Event) => {
      setEvents((e) => [...e, event])
    }

    const subscription = manager.newEvents$.subscribe((event) => {
      if (event.trigger === Notifications.Trigger.RewardsUpdated && event.metadata.walletId === selectedWalletId) {
        pushEvent(event)
      }

      if (event.trigger === Notifications.Trigger.TransactionReceived && event.metadata.walletId === selectedWalletId) {
        pushEvent(event)
      }
    })
    return () => {
      subscription.unsubscribe()
    }
  }, [manager, setEvents, selectedWalletId, enabled])

  const removeEvent = (id: number) => {
    setEvents((e) => e.filter((ev) => ev.id !== id))
  }

  return {events, removeEvent}
}
