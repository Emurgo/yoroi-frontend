// @flow
import cryptoRandomString from 'crypto-random-string';
import querystring from 'querystring';

import LocalStorageApi, {
  loadAnalyticsInstanceId,
  saveAnalyticsInstanceId,
} from '../localStorage';
import { environment } from '../../environment';
import { TRACKED_ROUTES } from '../../routes-config';
import type { StoresMap } from '../../stores';
import { isTestnet as isTestnetFunc} from '../ada/lib/storage/database/prepackaged/networks';

const MATOMO_URL = 'https://analytics.emurgo-rnd.com/matomo.php';
const SITE_ID = '4';
let INSTANCE_ID;
let stores;

export async function trackStartup(stores_: StoresMap): Promise<void> {
  stores = stores_;

  let event;
  if (await (new LocalStorageApi()).getUserLocale() != null) {
    INSTANCE_ID = await loadAnalyticsInstanceId();
    if (INSTANCE_ID) {
      emitEvent(INSTANCE_ID, 'launch');
      return;
    }
    event = 'pre-existing-instance';
  } else {
    event = 'new-instance';
  }
  INSTANCE_ID = generateAnalyticsInstanceId();
  await saveAnalyticsInstanceId(INSTANCE_ID);
  emitEvent(INSTANCE_ID, event);
}

type NewWalletType = 'hardware' | 'created' | 'restored';

export function trackWalletCreation(newWalletType: NewWalletType): void {
  if (INSTANCE_ID == null) {
    return;
  }
  emitEvent(INSTANCE_ID, 'new-wallet/' + newWalletType);
}

export function trackNavigation(path: string): void {
  if (path.match(TRACKED_ROUTES)) {
    if (INSTANCE_ID == null) {
      return;
    }
    emitEvent(INSTANCE_ID, 'navigate' + path);
  }
}

export function trackSend(): void {
  if (INSTANCE_ID == null) {
    return;
  }
  emitEvent(INSTANCE_ID, 'new-transaction/send');
}

export function trackDelegation(): void {
  if (INSTANCE_ID == null) {
    return;
  }
  emitEvent(INSTANCE_ID, 'delegation');
}

export function trackWithdrawal(shouldDeregister: boolean): void {
  if (INSTANCE_ID == null) {
    return;
  }
  if (shouldDeregister) {
    emitEvent(INSTANCE_ID, 'deregister');
  } else {
    emitEvent(INSTANCE_ID, 'withdrawal');
  }
}

export function trackCatalystRegistration(): void {
  if (INSTANCE_ID == null) {
    return;
  }
  emitEvent(INSTANCE_ID, 'new-transaction/catalyst');
}

export function trackSetLocale(locale: string): void {
  if (INSTANCE_ID == null) {
    return;
  }
  emitEvent(INSTANCE_ID, 'set-locale/' + locale);
}

export function trackSetUnitOfAccount(unitOfAccount: string): void {
  if (INSTANCE_ID == null) {
    return;
  }
  emitEvent(INSTANCE_ID, 'unit-of-account/' + unitOfAccount);
}

export function trackUpdateTheme(theme: string): void {
  if (INSTANCE_ID == null) {
    return;
  }
  emitEvent(INSTANCE_ID, 'update-theme/' + theme);
}

export function trackUriPrompt(choice: 'skip' | 'allow'): void {
  if (INSTANCE_ID == null) {
    return;
  }
  emitEvent(INSTANCE_ID, 'uri-prompt/' + choice);
}

export function trackBuySellDialog(): void {
  if (INSTANCE_ID == null) {
    return;
  }
  emitEvent(INSTANCE_ID, 'buy-sell-ada');
}

export function trackExportWallet(): void {
  if (INSTANCE_ID == null) {
    return;
  }
  emitEvent(INSTANCE_ID, 'export-wallet');
}

export function trackRemoveWallet(): void {
  if (INSTANCE_ID == null) {
    return;
  }
  emitEvent(INSTANCE_ID, 'remove-wallet');
}

export function trackResyncWallet(): void {
  if (INSTANCE_ID == null) {
    return;
  }
  emitEvent(INSTANCE_ID, 'remove-wallet');
}

function generateAnalyticsInstanceId(): string {
  // Matomo requires 16 character hex string
  return cryptoRandomString({ length: 16 });
}

function getCurrentWalletInfo() {
}

function emitEvent(instanceId: string, event: string): void {
  if (/*fixme environment.isDev() ||*/ environment.isTest()) {
    return;
  }

  const isTestnet = stores.profile.selectedNetwork != null ?
    isTestnetFunc(stores.profile.selectedNetwork) :
    false;

  // https://developer.matomo.org/api-reference/tracking-api
  const params = {
    idsite: SITE_ID,
    rec: '1',
    action_name: event,
    url: `yoroi.extension/${isTestnet ? 'testnet/' : ''}${event}`,
    _id: INSTANCE_ID,
    rand: `${Date.now()}-${Math.random()}`,
    apiv: '1'
  };
  const url = `${MATOMO_URL}?${querystring.stringify(params)}`;

  fetch(url);
}
