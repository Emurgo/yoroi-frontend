// @flow
import { RustModule } from './ada/lib/cardanoCrypto/rustLoader';
import type { ResponseTicker } from './common/lib/state-fetch/types';
import { utfToBytes } from '../coreUtils';

function serializeTicker(ticker: ResponseTicker): Buffer {
  return utfToBytes(
    ticker.from + ticker.timestamp
    + Object.keys(ticker.prices).sort().map(to => to + ticker.prices[to]).join('')
  );
}

function verify(
  obj: any,
  serializer: any => Buffer,
  signatureHex: string,
  publicKey: RustModule.WalletV4.PublicKey
): boolean {
  return RustModule.WasmScope(Scope => {
    return publicKey.verify(
      serializer(obj),
      Scope.WalletV4.Ed25519Signature.from_hex(signatureHex)
    );
  })
}

export function verifyTicker(
  ticker: ResponseTicker,
  pubKeyData: RustModule.WalletV4.PublicKey
): boolean {
  if (ticker.signature == null) {
    throw new Error('ticker has no signature');
  }
  return verify(ticker, serializeTicker, ticker.signature, pubKeyData);
}
