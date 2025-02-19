import React from 'react';
import { toast } from 'react-toastify';
import { useStrings } from '../../../common/hooks/useStrings';
import { NotificationTypes } from '../../../types/notifications';
import { createToast } from '../../../components/notifications/NotificationToast';
import LocalStorageApi from '../../../../api/localStorage';

export const NotificationTopics = {
  NEW_TX: "NEW_TX"
}

const initialValue = {
  showRandomToast(): (null | Promise<any>) {
    return null
  },
  createNotification(type: NotificationTypes, id?: string): void {
    console.log(type, id)
    return;
  }
}

function getRandomNotification() {
  const notifTypes = [
    NotificationTypes.Rewards,
    NotificationTypes.Cancelled,
    NotificationTypes.Income,
    NotificationTypes.Outcome
  ];

  const randomIdx: number = Math.floor(Math.random() * notifTypes.length);
  const notifType: any = notifTypes[randomIdx] || notifTypes[0];

  return {
    id: String(Math.floor(Math.random() * 100) + 1),
    type: notifType,
  };
}

const Context = React.createContext(initialValue);

export default function NotificationsProvider({ children }) {
  const lsApi = new LocalStorageApi();
  const [toastQueue, setToastQueue] = React.useState<any>([]);
  const strings = useStrings();
  const notificationTexts = {
    [NotificationTypes.Rewards]: strings.stakingRewardsReceived,
    [NotificationTypes.Income]: strings.tokensReceived,
    [NotificationTypes.Outcome]: strings.tokensSent,
    [NotificationTypes.Cancelled]: strings.txFailed,
  }

  const handleToastClose = (props) => {
    toast.update(props.toastId, { data: { event: "closed" } })
    console.log("close toast", props)
    toast.dismiss(props.toastId);
  }

  const handleToastClick = (props) => {
    toast.update(props.toastId, { data: { event: "clicked" } })
    console.log("click toast", props)
    toast.dismiss(props.toastId);
  }

  const handleToastExpired = (props) => {
    console.log("toast expired", props)
  }

  const createNotification = async (type: NotificationTypes, id?: string) => {
    const theme = await lsApi.getUserThemeMode();
    createToast({
      theme,
      onClick: handleToastClick,
      onClose: handleToastClose,
      title: notificationTexts[type],
      subtitle: strings.clickToView,
      type,
      id: id || String(Date.now())
    });
  }

  const handleSubscription = async (topic, data) => {
    const notifTypeByTopic = {
      [NotificationTopics.NEW_TX]: NotificationTypes.Income
    }

    await createNotification(notifTypeByTopic[topic] || NotificationTypes.Cancelled, data.txid)
  }

  const showRandomToast = async () => {
    const notif = getRandomNotification();
    const theme = await lsApi.getUserThemeMode();

    createToast({
      theme,
      onClick: handleToastClick,
      onClose: handleToastClose,
      title: notificationTexts[notif.type],
      subtitle: strings.clickToView,
      ...notif,
    });

  };

  const handleToastChanges = (props) => {
    // event is expired, trigger callback
    if (props.status === "removed" && !Boolean(props.data.event)) {
      handleToastExpired(props);
      return;
    }

    // Remove the oldest toast if more than 3 exist
    if (toastQueue.length >= 3 && props.status === "added") {
      toast.dismiss(toastQueue[0]);
      setToastQueue((prev) => [...prev.slice(1), props.id]);
      return;
    }

    // add to queue if a new one is added
    if (props.status === "added") {
      setToastQueue((prev) => [...prev, props.id]);
    }
  }

  React.useEffect(() => {
    const unsubscribe = toast.onChange(handleToastChanges)

    return () => {
      unsubscribe()
    }
  }, [toastQueue])


  const value = React.useMemo(() => ({
    showRandomToast,
    createNotification
  }), [])

  return <Context.Provider value={value}>{children}</Context.Provider>
}

export const useNotifications = () => {
  const context = React.useContext(Context)

  if (context === null) {
    throw new Error(
      'useNotifications must be used within a NotificationsProvider',
    )
  }

  return context
}