// @flow
import { RustModule } from './ada/lib/cardanoCrypto/rustLoader'
import type { ResponseTicker } from './ada/lib/state-fetch/types.js';

function serializeTicker(ticker: ResponseTicker): Buffer {
  return new Buffer(ticker.from +
    ticker.timestamp +
    Object.keys(ticker.prices).sort().map(to => to + ticker.prices[to]).join(''),
    'utf8'
  );
}

function verify(
  obj: any,
  serializer: any => Buffer,
  signatureHex: string,
  publicKey: publicKey): string {

  return publicKey.verify(serializer(obj), RustModule.Wallet.Signature.from_hex(signatureHex));
}

let pubKeyData;

export function verifyTicker(ticker: ResponseTicker): boolean {
  if (!pubKeyData) {
    pubKeyData = RustModule.Wallet.PublicKey.from_hex(CONFIG.app.pubKeyData);
  }
  return verify(ticker, serializeTicker, ticker.signature, pubKeyData);
}

