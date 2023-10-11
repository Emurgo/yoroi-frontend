// @flow

export * from 'crypto-browserify';

export function randomUUID(): string {
  return window.crypto.randomUUID();
}
