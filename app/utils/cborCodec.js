import { Buffer } from 'safe-buffer';
import cbor from 'cbor';
import base58 from 'bs58';

export const base64ToUint8Array = function (x) {
  return Buffer.from(x, 'base64');
};

// toAddress :: decodedCbor -> String
export const toAddress = function (x) {
  const encodedX = cbor.encode(x);
  return base58.encode(encodedX);
};

export const decodeTx = function (encodedTx) {
  try {
    const buffer = base64ToUint8Array(encodedTx);
    const decodedTx = cbor.decodeAllSync(buffer)[0];
    const inputs = decodedTx[0];
    const outputs = decodedTx[1].map((output) => {
      return {
        address: toAddress(output[0]),
        coin: output[1]
      };
    });
    return {
      txInputs: inputs,
      txOutputs: outputs
    };
  } catch (e) {
    return undefined;
  }
};
