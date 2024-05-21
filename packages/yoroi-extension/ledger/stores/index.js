// @flow //
import ProfileStore from './ProfileStore';
import ConnectStore from './ConnectStore';
import {
  DEFAULT_TRANSPORT_PROTOCOL,
  DEFAULT_LOCALE
} from '../const';
import { SUPPORTED_LOCALS } from '../i18n/translations';
import type { URLParams } from '../types/cmn';
import type { TransportIdType } from '../types/enum';
import { TRANSPORT_ID } from '../types/enum';
import packageInfo from '../../package.json';

const appVersion = packageInfo.version;

/**
 * This is the RootStore, RootStore is responsible for creating all store
 * Refer: https://mobx.js.org/best/store.html (Combining multiple stores section)
 */
export default class RootStore {
  profileStore: ProfileStore;
  connectStore: ConnectStore;

  constructor() {
    const urlParams: URLParams = this.parseURLParams();
    this.profileStore = new ProfileStore(urlParams.locale, appVersion);
    this.connectStore = new ConnectStore(urlParams.transportId);
  }

  parseURLParams: () => URLParams = () => {
    const urlParams = new URLSearchParams(window.location.search);

    // Parse Transport
    let transportId: TransportIdType;
    const urlTransportId = urlParams.get('transport') || DEFAULT_TRANSPORT_PROTOCOL;
    switch (urlTransportId) {
      case TRANSPORT_ID.U2F:
        transportId = TRANSPORT_ID.U2F;
        break;
      case TRANSPORT_ID.WEB_USB:
        transportId = TRANSPORT_ID.WEB_USB;
        break;
      default:
        transportId = DEFAULT_TRANSPORT_PROTOCOL;
        break;
    }

    // Parse Locale
    let locale = urlParams.get('locale');
    if (locale == null ||
      locale === '' ||
      !SUPPORTED_LOCALS.includes(locale)) {
      locale = DEFAULT_LOCALE;
    }

    return {
      transportId,
      locale,
    };
  }
}
