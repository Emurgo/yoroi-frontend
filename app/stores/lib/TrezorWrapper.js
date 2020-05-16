// @flow

import TrezorConnect from 'trezor-connect';

/* eslint-disable no-restricted-properties */

// TODO: explain why we want this file

export async function wrapWithFrame<T>(
  func: (typeof TrezorConnect) => Promise<T>
): Promise<T> {
  await TrezorConnect.init({});
  const result = await func(TrezorConnect);
  await TrezorConnect.dispose();
  return result;
}

export function wrapWithoutFrame<T>(func: (typeof TrezorConnect) => T): T {
  return func(TrezorConnect);
}
