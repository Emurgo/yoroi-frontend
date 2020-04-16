// @flow
import { RustModule } from './ada/lib/cardanoCrypto/rustLoader';
import type { ResponseTicker } from './ada/lib/state-fetch/types';

function serializeTicker(ticker: ResponseTicker): Buffer {
  return Buffer.from(
    ticker.from + ticker.timestamp +
      Object.keys(ticker.prices).sort().map(to => to + ticker.prices[to]).join(''),
    'utf8'
  );
}

function verify(
  obj: any,
  serializer: any => Buffer,
  signatureHex: string,
  publicKey: RustModule.WalletV3.PublicKey
): boolean {
  return publicKey.verify(
    serializer(obj),
    RustModule.WalletV3.Ed25519Signature.from_hex(signatureHex)
  );
}

export function verifyTicker(
  ticker: ResponseTicker,
  pubKeyData: RustModule.WalletV3.PublicKey
): boolean {
  if (ticker.signature == null) {
    throw new Error('ticker has no signature');
  }
  return verify(ticker, serializeTicker, ticker.signature, pubKeyData);
}

export function verifyPubKeyDataReplacement(
  pubKeyData: string,
  pubKeyDataSignature: string,
  pubKeyMaster: string
): boolean {
  return verify(
    pubKeyData,
    s => Buffer.from(s),
    pubKeyDataSignature,
    RustModule.WalletV3.PublicKey.from_bytes(Buffer.from(pubKeyMaster, 'hex'))
  );
}
