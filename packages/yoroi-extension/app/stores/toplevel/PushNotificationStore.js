// @flow
import Store from '../base/Store';
import environment from '../../environment';
import { observable, runInAction, } from 'mobx';
import LocalStorageApi, { type PushNotificationMetadata } from '../../api/localStorage';
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken } from "firebase/messaging";

const localStorageApi = new LocalStorageApi();

const DEFAULT_DURATION = 4;

const VAPID_PUBLIC_KEY = 'BKj3BumTPTjepBiiXXYVZu-W8WbofAon4GG2YMhK-QKeVtd5UQ-zB8HMckW0nw4P2PfEIcPQ-ktxefSvTyzpE9M';

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

  async _enableNotifications(): Promise<void> {
    const firebaseConfig = {
      apiKey: 'AIzaSyCzwU3ybOxkhW2sWTiryF4CYxwh2lxvZSM',
      authDomain: 'yoroi-extension-14826.firebaseapp.com',
      projectId: 'yoroi-extension-14826',
      storageBucket: 'yoroi-extension-14826.firebasestorage.app',
      messagingSenderId: '290850618958',
      appId: '1:290850618958:web:8bd5fa25dc80522b9acd1f'
    };

    const app = initializeApp(firebaseConfig);
    const messaging = getMessaging(app);
    const token = await getToken(messaging, { vapidKey: VAPID_PUBLIC_KEY });
    if (!this.metadata) {
      throw new Error('push notification metadata not loaded');
    }
    runInAction(() => {
      this.metadata.fcmToken = token;
    });
    localStorageApi.savePushNotificationMetadata(this.metadata);
  }

  _disableNotifications(): void {
  }

  get fcmToken(): ?string {
    return this.metadata?.fcmToken;
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
