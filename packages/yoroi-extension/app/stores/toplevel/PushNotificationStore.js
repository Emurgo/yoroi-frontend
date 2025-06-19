// @flow
import Store from '../base/Store';
import environment from '../../environment';
import { observable, runInAction, } from 'mobx';

const VAPID_PUBLIC_KEY = 'BKj3BumTPTjepBiiXXYVZu-W8WbofAon4GG2YMhK-QKeVtd5UQ-zB8HMckW0nw4P2PfEIcPQ-ktxefSvTyzpE9M';

export type PushSubscription = {|
  endpoint: string,
  expirationTime: null | DOMHighResTimeStamp,
  keys: {|
    p256dh: string,
    auth: string,
  |},
|}

export default class PushNotificationStore<
  StoresMapType: { ... }, // no dependency on other stores
> extends Store<StoresMapType> {
  @observable subscription: PushSubscription | null = null;

  setup(): void {
    (async () => {
      if (environment.isDev() || environment.isNightly()) {
        const result = await Notification.requestPermission();
        if (result === 'denied') {
          // todo: save and don't ask again
          return;
        }
        if (result === 'granted') {
          console.info('The user accepted the permission request.');
        }
        const registration = await navigator.serviceWorker?.getRegistration();
        if (!registration) {
          throw new Error('unexpectedly missing service worker registration');
        }
        let subscription  = await registration.pushManager.getSubscription();
        if (!subscription) {
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlB64ToUint8Array(VAPID_PUBLIC_KEY)
          });
        }
        runInAction(() => { this.subscription = JSON.parse(JSON.stringify(subscription)); });
      }
    })().catch(error => {
      console.error('error when setting up push', error);
    })
  }
}

function urlB64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
