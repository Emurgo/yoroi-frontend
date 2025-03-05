import React from 'react';
import { toast } from 'react-toastify';
import { useStrings } from '../../../common/hooks/useStrings';
import { NotificationTypes } from '../../../types/notifications';
import { createToast } from '../../../components/notifications/NotificationToast';
import LocalStorageApi from '../../../../api/localStorage';
import PubSub from 'pubsub-js';
import { useHistory } from 'react-router';
import { ROUTES } from '../../../../routes-config';

export const NotificationTopics = {
  NEW_TX: 'NEW_TX',
};

const initialValue = {
  showRandomToast(): null | Promise<any> {
    return null;
  },
  createNotification(type: NotificationTypes, id?: string): void {
    console.log(type, id);
    return;
  },
};

function getRandomNotification() {
  const notifTypes = [
    NotificationTypes.Rewards,
    NotificationTypes.Cancelled,
    NotificationTypes.Income,
    NotificationTypes.Outcome,
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
  const history = useHistory();

  const notificationTexts = {
    [NotificationTypes.Rewards]: strings.stakingRewardsReceived,
    [NotificationTypes.Income]: strings.assetsReceived,
    [NotificationTypes.Outcome]: strings.assetsSent,
    [NotificationTypes.Cancelled]: strings.txFailed,
  };

  const handleToastClose = props => {
    toast.update(props.toastId, { data: { event: 'closed' } });
    // todo: implement analytics
    console.log('close toast', props);
    toast.dismiss(props.toastId);
  };

  const handleToastClick = props => {
    toast.update(props.toastId, { data: { event: 'clicked' } });
    // todo: implement analytics
    console.log('click toast', props);
    toast.dismiss(props.toastId);

    const { data } = props;
    switch (data.type) {
      case NotificationTypes.Income:
        history.push(ROUTES.WALLETS.TRANSACTIONS);
        break;
      case NotificationTypes.Outcome:
        history.push(ROUTES.WALLETS.TRANSACTIONS);
        break;
      case NotificationTypes.Rewards:
        history.push(ROUTES.STAKING);
        break;
      case NotificationTypes.Cancelled:
        history.push(ROUTES.WALLETS.TRANSACTIONS);
        break;
      default:
        return;
    }
  };

  const handleToastExpired = props => {
    // todo: implement analytics
    console.log('toast expired', props);
  };

  const isActiveSettingsForWallet = async () => {
    const activeWallet = JSON.parse(await lsApi.getSelectedWalletId());
    const notifSettings = JSON.parse((await lsApi.getNotificationsSetting()) || '{}');
    return notifSettings[activeWallet] !== undefined ? notifSettings[activeWallet] : true;
  };

  const createNotification = async (type: NotificationTypes, id?: string) => {
    const theme = await lsApi.getUserThemeMode();
    const notifyWallet = await isActiveSettingsForWallet();

    // Early returns:
    // - return if settings are off
    if (!notifyWallet) return;

    // - return if we're on the same route as the event redirection
    switch (type) {
      case NotificationTypes.Income:
      case NotificationTypes.Outcome:
      case NotificationTypes.Cancelled:
        if (history.location.pathname === ROUTES.WALLETS.TRANSACTIONS) {
          return;
        }
        break;
      case NotificationTypes.Rewards:
        if (history.location.pathname === ROUTES.STAKING) {
          return;
        }
    }

    createToast({
      theme,
      onClick: handleToastClick,
      onClose: handleToastClose,
      title: notificationTexts[type],
      subtitle: strings.clickToView,
      type,
      id: id || String(Date.now()),
    });
  };

  const handleSubscription = async (topic, data) => {
    const notifTypeByTopic = {
      [NotificationTopics.NEW_TX]: NotificationTypes.Income,
    };

    createNotification(notifTypeByTopic[topic] || NotificationTypes.Cancelled, data.txid);
  };

  const showRandomToast = async () => {
    const notif = getRandomNotification();
    createNotification(notif.type, notif.id);
  };

  const handleToastChanges = props => {
    console.log(props, toastQueue);
    // event is expired, trigger callback
    if (props.status === 'removed' && !Boolean(props.data.event)) {
      handleToastExpired(props);
      return;
    }

    // Remove the oldest toast if more than 3 exist
    if (toastQueue.length >= 3 && props.status === 'added') {
      toast.dismiss(toastQueue[0]);
      setToastQueue(prev => [...prev.slice(-2), props.id]);
      return;
    }

    // add to queue if a new one is added
    if (props.status === 'added') {
      setToastQueue(prev => [...prev.slice(-2), props.id]);
    }
  };

  React.useEffect(() => {
    const unsubscribe = toast.onChange(handleToastChanges);

    return () => {
      unsubscribe();
    };
  }, [toastQueue]);

  // subscribe to event topics on mount
  React.useEffect(() => {
    PubSub.subscribe(NotificationTopics.NEW_TX, handleSubscription);

    return () => {
      PubSub.unsubscribe(NotificationTopics.NEW_TX);
    };
  }, []);

  const value = React.useMemo(
    () => ({
      showRandomToast,
      createNotification,
    }),
    []
  );

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export const useNotifications = () => {
  const context = React.useContext(Context);

  if (context === null) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }

  return context;
};
