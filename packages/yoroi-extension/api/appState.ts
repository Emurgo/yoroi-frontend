import { lazy, mutateFunc, makeAccessor } from './objectModel';
import Dexie, { type EntityTable } from 'dexie';

interface NotificationData {
  fcmMessageId: string;
  read: boolean;
  title: string;
  body: string;
  time: string;
  isExternalUrl?: boolean;
  redirection?: string | null;
}
interface Notification extends NotificationData {
  id: number;
}

const db = new Dexie('yoroi-ng') as Dexie & {
  notifications: EntityTable<Notification, 'id'>;
};

db.version(1).stores({
  notifications: '++id, fcmMessageId',
});

const notifications = {
  all: lazy(async () => {
    return (await db.notifications.reverse().toArray()).map(notification => ({
      ...notification,
      setRead: mutateFunc((path, emitChange) => async () => {
        await db.notifications.update(notification.id, { read: true });
        emitChange([...path, 'read'], true);
        emitChange(['hasUnread']);
      }),
    }));
  }),
  setRead: mutateFunc((path, emitChange) => async (fcmMessageId: string) => {
    await db.notifications.where('fcmMessageId').equals(fcmMessageId).modify({ read: true });
    emitChange([...path, 'all']);
    emitChange([...path, 'hasUnread']);
  }),
  markAllRead: mutateFunc((path, emitChange) => async () => {
    await db.notifications.toCollection().modify({ read: true });
    emitChange([...path, 'all']);
    emitChange([...path, 'hasUnread'], false);
  }),
  add: mutateFunc((path, emitChange) => async (notification: NotificationData) => {
    await db.notifications.put(notification);
    emitChange([...path, 'all']);
    emitChange([...path, 'hasUnread']);
  }),
  hasUnread: lazy(async () => {
    let hasUnread = false;
    await db.notifications
      .toCollection()
      .reverse()
      .each((notification, cursor) => {
        if (!notification.read) {
          hasUnread = true;
          // @ts-ignore: undocumented
          cursor.stop();
        }
      });
    return hasUnread;
  }),
};

export default makeAccessor({ notifications });
