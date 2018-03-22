import { Buffer } from 'safe-buffer';
import cbor from 'cbor';
// import  base58 from 'bs58';

const base64ToUint8Array = function (x) {
  return Buffer.from(x, 'base64');
};

export const decodeTx = function (encodedTx) {
  const buffer = base64ToUint8Array(encodedTx);
  // TODO: Implement special decoding for tagged 24 addresses
  const tx = cbor.decodeAllSync(buffer);
  return tx;
};
