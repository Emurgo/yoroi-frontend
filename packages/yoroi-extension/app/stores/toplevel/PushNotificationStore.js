// @flow
import Store from '../base/Store';
import { observable, runInAction, } from 'mobx';
import LocalStorageApi, { type PushNotificationMetadata } from '../../api/localStorage';
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken } from 'firebase/messaging';
import type { ConfigType } from '../../../config/config-types';

declare var CONFIG: ConfigType;

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

  toggleEnabled: () => Promise<void> = async () => {
    runInAction(() => {
      if (!this.metadata) {
        throw new Error('push notification metadata not loaded');
      }
      this.metadata.isEnabled = !this.metadata.isEnabled;
    });


    let success;
    if (this.isEnabled) {
      success = await this._enableNotifications();
    } else {
      this._disableNotifications();
      success = true;
    }

    if (!success) {
      runInAction(() => {
        if (!this.metadata) {
          throw new Error('push notification metadata not loaded');
        }
        this.metadata.isEnabled = !this.metadata.isEnabled;
      });

      return;
    }
    if (!this.metadata) {
      throw new Error('push notification metadata not loaded');
    }
    localStorageApi.savePushNotificationMetadata(this.metadata);
  }

  async _enableNotifications(): Promise<boolean> {
    const app = initializeApp(CONFIG.fcm);
    const messaging = getMessaging(app);
    const result = await Notification.requestPermission();
    if (result === 'denied') {
      return false;
    }
    const token = await getToken(messaging, { vapidKey: VAPID_PUBLIC_KEY });
    runInAction(() => {
      if (!this.metadata) {
        throw new Error('push notification metadata not loaded');
      }
      this.metadata.fcmToken = token;
    });
    if (!this.metadata) {
      throw new Error('push notification metadata not loaded');
    }
    localStorageApi.savePushNotificationMetadata(this.metadata);
    return true;
  }

  _disableNotifications(): void {
  }

  get fcmToken(): ?string {
    return this.metadata?.fcmToken;
  }
}
