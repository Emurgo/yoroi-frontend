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
  publicKey: RustModule.Wallet.PublicKey
): boolean {
  return publicKey.verify(serializer(obj), RustModule.Wallet.Signature.from_hex(signatureHex));
}

export function verifyTicker(
  ticker: ResponseTicker,
  pubKeyData: RustModule.Wallet.PublicKey
): boolean {
  if (!ticker.signature) {
    throw new Error('ticker has no signature');
  }
  return verify(ticker, serializeTicker, ticker.signature, pubKeyData);
}

export function verifyPubKeyDataReplacement(
  pubKeyData: string,
  pubKeyDataSignature: string,
  pubKeyMaster: string
): boolean {
  return verify(pubKeyData,
    s => new Buffer(s),
    pubKeyDataSignature,
    RustModule.Wallet.PublicKey.from_hex(pubKeyMaster)
  );
}
