export * from 'crypto-browserify';

export function randomUUID() {
  return window.crypto.randomUUID();
}
