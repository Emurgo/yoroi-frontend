// @flow
import Store from '../base/Store';
import { observable, runInAction } from 'mobx';
import LocalStorageApi, { type PushNotificationMetadata } from '../../api/localStorage';
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken } from 'firebase/messaging';
import type { ConfigType } from '../../../config/config-types';

declare var CONFIG: ConfigType;

const localStorageApi = new LocalStorageApi();

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
    this.stores.loading.registerBlockingLoadingRequest(
      (async () => {
        const metadata = await localStorageApi.getPushNotificationMetadata();
        runInAction(() => {
          this.metadata = metadata;
        });
        if (
          // first time after upgrading
          this.metadata?.isEnabled === undefined ||
          // By observation we need to re-run `getToken` after manually reloading the extension,
          // and the returned token may change. So it is possible that we need to also do this after upgrading.
          this.metadata?.isEnabled
        ) {
          //this._enableNotifications();
        }
      })(),
      'load push notification metadata'
    );
  }

  get duration(): number {
    if (!this.metadata) {
      throw new Error('push notification metadata not loaded');
    }
    return this.metadata.duration ?? CONFIG.notifications.defaultDuration;
  }
  set duration(duration: number): void {
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
      success = await this._disableNotifications();
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
  };

  async _enableNotifications(): Promise<boolean> {
    const app = initializeApp(CONFIG.fcm);
    const messaging = getMessaging(app);
    const result = await Notification.requestPermission();
    if (result === 'denied') {
      return false;
    }
    const token = await getToken(messaging, {
      vapidKey: CONFIG.notifications.vapidPublicKey,
      serviceWorkerRegistration: await this._getBackgroundServiceWorkerRegistration(),
    });
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

  async _disableNotifications(): Promise<boolean> {
    const registration = await this._getBackgroundServiceWorkerRegistration();

    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      throw new Error('unexpected missing subscription');
    }
    return await subscription.unsubscribe();
  }

  async _getBackgroundServiceWorkerRegistration(): Promise<ServiceWorkerRegistration> {
    return window.navigator.serviceWorker.getRegistration();
  }

  get fcmToken(): ?string {
    return this.metadata?.fcmToken;
  }
}
