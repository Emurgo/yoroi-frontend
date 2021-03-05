// @flow

import Config from '../../config';
import environment from '../../environment';
import TrezorConnect, { UI_EVENT, DEVICE_EVENT } from 'trezor-connect';
import type { Manifest } from 'trezor-connect';
import type { DeviceEvent } from 'trezor-connect/lib/types/trezor/device';
import type { UiEvent } from 'trezor-connect/lib/types/events';

/* eslint-disable no-restricted-properties */

/*
 * Trezor needs to embed an iframe inside Yoroi to function (created by TrezorConnect.init)
 * Some TrezorConnect functions depend on this iframe existing, while others don't
 * Goal: want to only keep the Trezor iframe open for the least amount of time for safety & privacy
 *
 * To do this safely, we disallow the usage of TrezorConnect in the whole codebase
 * except for this function that exposes wrapper functions
 * that forces the programmer to explicitly decide to initialize the iframe or not
*/

export function getTrezorManifest(): Manifest {
  /** Starting from v7 Trezor Connect Manifest has been made mandatory
  * https://github.com/trezor/connect/blob/develop/docs/index.md#trezor-connect-manifest */
  const { manifest } = Config.wallets.hardwareWallet.trezorT;

  const trezorManifest: Manifest = {
    email: manifest.EMAIL,
    appUrl: (() => {
      if (environment.userAgentInfo.isFirefox()) {
        // Set appUrl for `moz-extension:` protocol using browser (like Firefox)
        return manifest.appURL.FIREFOX;
      }
      // For all other browser supported that uses `chrome-extension:` protocol
      // In future if other non chrome like browser is supported them we can consider updating
      return manifest.appURL.CHROME;
    })(),
  };

  return trezorManifest;
}

export async function wrapWithFrame<T>(
  func: (typeof TrezorConnect) => Promise<T>,
  onDeviceEvent?: DeviceEvent => void,
  onUiEvent?: UiEvent => void,
): Promise<T> {
  const trezorManifest = getTrezorManifest();
  await TrezorConnect.init({
    manifest: trezorManifest,
  });
  if (onDeviceEvent) {
    TrezorConnect.on(DEVICE_EVENT, onDeviceEvent);
  }
  if (onUiEvent) {
    TrezorConnect.on(UI_EVENT, onUiEvent);
  }
  const result = await func(TrezorConnect);
  if (onDeviceEvent) {
    TrezorConnect.off(DEVICE_EVENT, onDeviceEvent);
  }
  if (onUiEvent) {
    TrezorConnect.off(UI_EVENT, onUiEvent);
  }
  await TrezorConnect.dispose();
  return result;
}

export function wrapWithoutFrame<T>(func: (typeof TrezorConnect) => T): T {
  return func(TrezorConnect);
}
