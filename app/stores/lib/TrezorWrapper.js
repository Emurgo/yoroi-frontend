// @flow

import Config from '../../config';
import environment from '../../environment';
import TrezorConnect from 'trezor-connect';
import type { Manifest } from 'trezor-connect';

/* eslint-disable no-restricted-properties */

// TODO: explain why we want this file

export function getTrezorManifest(): Manifest {
  /** Starting from v7 Trezor Connect Manifest has been made mandatory
  * https://github.com/trezor/connect/blob/develop/docs/index.md#trezor-connect-manifest */
  const { manifest } = Config.wallets.hardwareWallet.trezorT;

  const trezorManifest: Manifest = {
    email: manifest.EMAIL,
    appUrl: (() => {
      if (environment.userAgentInfo.isFirefox) {
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
  func: (typeof TrezorConnect) => Promise<T>
): Promise<T> {
  const trezorManifest = getTrezorManifest();
  await TrezorConnect.init({
    manifest: trezorManifest
  });
  const result = await func(TrezorConnect);
  await TrezorConnect.dispose();
  return result;
}

export function wrapWithoutFrame<T>(func: (typeof TrezorConnect) => T): T {
  return func(TrezorConnect);
}
