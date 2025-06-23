// @flow
import Store from '../base/Store';
import environment from '../../environment';
import { observable, runInAction, } from 'mobx';
import LocalStorageApi, { type PushNotificationMetadata } from '../../api/localStorage';

const localStorageApi = new LocalStorageApi();

const DEFAULT_DURATION = 4;

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
  StoresMapType: {
    +loading: {
      +registerBlockingLoadingRequest: (promise: Promise<void>, name: string) => void,
      ...
    },
    ...
  },
> extends Store<StoresMapType> {
  @observable metadata: PushNotificationMetadata | null = null;
  @observable subscription: PushSubscription | null = null;

  setup(): void {
    this.stores.loading.registerBlockingLoadingRequest((async () => {
      const metadata = await localStorageApi.getPushNotificationMetadata();
      runInAction(() => {
        this.metadata = metadata;
      });
      if (this.metadata?.isEnabled === undefined) {
        this._enableNotifications();
      }
    })(), 'load push notification metadata');

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

  get duration(): number {
    if (!this.metadata) {
      throw new Error('push notification metadata not loaded');
    }
    return this.metadata.duration ?? DEFAULT_DURATION;
  }
  set duration(duration:number): void {
    runInAction(() => {
      if (!this.metadata) {
        throw new Error('push notification metadata not loaded');
      }

      this.metadata.duration = duration;
    });
    if (!this.metadata) {
      throw new Error('push notification metadata not loaded');
    }
    localStorageApi.savePushNotificationMetadata(this.metadata);
  }

  get isEnabled(): boolean {
    // we treat unset value has enabled because we requested notifications permission in manifest.json
    return this.metadata?.isEnabled !== false;
  }

  toggleEnabled: () => void = () => {
    runInAction(() => {
      if (!this.metadata) {
        throw new Error('push notification metadata not loaded');
      }
      this.metadata.isEnabled = !this.metadata.isEnabled;
    });
    if (!this.metadata) {
      throw new Error('push notification metadata not loaded');
    }
    localStorageApi.savePushNotificationMetadata(this.metadata);
    if (!this.isEnabled) {
      this._enableNotifications();
    } else {
      this._disableNotifications();
    }
  }

  _enableNotifications(): void {
  }

  _disableNotifications(): void {
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
