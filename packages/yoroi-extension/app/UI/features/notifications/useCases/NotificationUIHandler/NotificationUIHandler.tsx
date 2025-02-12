import { useCollectNewNotifications } from '../../common/hooks/useCollectNewNotifications';
import * as React from 'react';

const displayLimit = 3

export const NotificationUIHandler = () => {
  // TODO: check if notifications are enabled
  const enabled = true;
  // TODO: Pass correct wallet ID
  const walletId = '';

  const { events, removeEvent } = useCollectNewNotifications({ enabled, walletId });
  const last3Events = React.useMemo(() => events.slice(-displayLimit), [events]);

  if (last3Events.length === 0) {
    return null
  }

  // TODO: Render notification stack showing last 3 events
  return null
}