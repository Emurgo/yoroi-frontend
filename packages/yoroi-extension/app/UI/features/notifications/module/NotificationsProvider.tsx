import React, {ReactNode} from 'react';
import PubSub from 'pubsub-js';
import { toast } from 'react-toastify';
import { useStrings } from '../../../common/hooks/useStrings';
import { NotificationTypes } from '../../../types/notifications';
import { createToast } from '../../../components/notifications/NotificationToast';
import { useHistory } from 'react-router';
import { ROUTES } from '../../../../routes-config';
import { ampli } from '../../../../../ampli/index';
import { getNetworkById, getCardanoHaskellBaseConfig } from '../../../../api/ada/lib/storage/database/prepackaged/networks';
import LocalStorageApi from '../../../../api/localStorage';
import TimeUtils from '../../../../api/ada/lib/storage/bridge/timeUtils';

export const NotificationTopics = {
  NEW_TX: 'NEW_TX',
  REWARDS: 'REWARDS_RECEIVED',
};

type TransactionType = 'self' | 'multi' | 'expend' | 'income';

const TransactionTypeMap: Record<TransactionType, NotificationTypes> = {
  self: NotificationTypes.Intrawallet,
  multi: NotificationTypes.Income,
  expend: NotificationTypes.Outcome,
  income: NotificationTypes.Income,
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

type Props = {
  children: ReactNode,
  appLoadedSlots: { [networkId: number]: number },
  walletsStore: any,
}

export default function NotificationsProvider({ children, appLoadedSlots = {}, walletsStore }: Props) {
  const lsApi = new LocalStorageApi();
  const [notifLimitSlots] = React.useState<Object>(appLoadedSlots);
  const [toastQueue, setToastQueue] = React.useState<any>([]);
  const strings = useStrings();
  const history = useHistory();

  const getSelectedWalletId =
    () => walletsStore.selected?.publicDeriverId;

  const notificationTexts = {
    [NotificationTypes.Intrawallet]: strings.intrawalletTxConfirmed,
    [NotificationTypes.Rewards]: strings.stakingRewardsReceived,
    [NotificationTypes.Income]: strings.assetsReceived,
    [NotificationTypes.Outcome]: strings.assetsSent,
    [NotificationTypes.Cancelled]: strings.txFailed,
  };

  const handleToastClose = props => {
    toast.update(props.toastId, { data: { event: 'closed' } });
    toast.dismiss(props.toastId);

    // analytics for close event
    const { data } = props;
    const analyticsTypeValue = data.type === NotificationTypes.Rewards ? 'staking_rewards' : 'tx_received';
    ampli.inAppNotificationClosed({ type: analyticsTypeValue });
  };

  const handleToastClick = props => {
    toast.update(props.toastId, { data: { event: 'clicked' } });
    toast.dismiss(props.toastId);

    const { data } = props;
    // analytics for click event
    const analyticsTypeValue = data.type === NotificationTypes.Rewards ? 'staking_rewards' : 'tx_received';
    ampli.inAppNotificationOpened({ type: analyticsTypeValue });
    // redirect after analytics
    const redirectTo = data.type === NotificationTypes.Rewards ? ROUTES.STAKING : ROUTES.WALLETS.TRANSACTIONS;
    history.push(redirectTo);
  };

  const handleToastExpired = () => {
    // do nothing for now
  };

  const isActiveSettingsForWallet = async () => {
    const selectedWalletId = getSelectedWalletId();
    if (selectedWalletId == undefined) {
      return false;
    }
    const notifSettings = JSON.parse((await lsApi.getNotificationsSetting()) ?? '{}');
    return notifSettings[selectedWalletId] ?? true;
  };

  const createNotification = async (type: NotificationTypes, id?: string) => {
    const theme = await lsApi.getUserThemeMode();
    const notifyWallet = await isActiveSettingsForWallet();
    // Early returns:
    // return if settings are off
    if (!notifyWallet) return;
    // return if we're on the same route as the event redirection
    switch (type) {
      case NotificationTypes.Intrawallet:
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

    const selectedWalletId = getSelectedWalletId();
    if (data.walletId != null && data.walletId !== selectedWalletId) {
      // ignore notifications for non-selected wallets
      return;
    }

    const notifTypeByTopic = {
      [NotificationTopics.NEW_TX]: NotificationTypes.Income,
      [NotificationTopics.REWARDS]: NotificationTypes.Rewards,
    };

    let notifType = notifTypeByTopic[topic] || NotificationTypes.Cancelled;

    // We only have epoch for rewards notifications
    if (topic === NotificationTopics.REWARDS) {
      const epoch = data.reward[0];
      const network = getNetworkById(data.networkId);
      const config = getCardanoHaskellBaseConfig(network);
      const localTimeSlot = notifLimitSlots[data.networkId];
      const relativeSlot = TimeUtils.toRelativeSlotNumber(config, localTimeSlot);
      // If the local epoch is greater, reward is old and we don't show it
      if (relativeSlot.epoch > epoch) {
        return;
      }
    } else if (data.slot < notifLimitSlots[data.networkId]) {
      return;
    } else if (topic === NotificationTopics.NEW_TX) {
      const txType = data.tx.type as TransactionType;
      notifType = TransactionTypeMap[txType] || NotificationTypes.Cancelled;
    }

    await createNotification(notifType, data.txid);
  };

  const showRandomToast = async () => {
    const notif = getRandomNotification();
    await createNotification(notif.type, notif.id);
  };

  const handleToastChanges = props => {
    // event is expired, trigger callback
    if (props.status === 'removed' && !Boolean(props.data.event)) {
      handleToastExpired();
      return;
    }

    if (props.status === 'added') {
      ampli.inAppNotificationViewed();
      // Remove the oldest toast if more than 3 exist
      toastQueue.length >= 3 && toast.dismiss(toastQueue[0]);
      // Update toast queue
      setToastQueue(prev => [...prev.slice(-2), props.id]);
      return;
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
    PubSub.subscribe(NotificationTopics.REWARDS, handleSubscription);

    return () => {
      PubSub.unsubscribe(NotificationTopics.NEW_TX);
      PubSub.unsubscribe(NotificationTopics.REWARDS);
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
