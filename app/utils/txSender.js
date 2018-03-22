
import CardanoNodeApi from '../api/CardanoNodeApi';
import { decodeTx } from './cborCodec';

/*
const txJsonExample = {
  "_txInputs": [
    "TxInUtxo_7883b62d76b2df628d98d3ed147330ac9cd0ad9271f48eee04086405226f6154_1"
  ],
  "_txOutputs": [
    {
      "coin": 99832172,
      "address": "Ae2tdPwUPEZMeiDfNHZ45V7RoaSqd4oSMuG4jo7asvmNHS193EEad1tUkeT"
    },
    {
      "coin": 10,
      "address": "Ae2tdPwUPEZMeiDfNHZ45V7RoaSqd4oSMuG4jo7asvmNHS193EEad1tUkeT"
    }
  ],
  "_txAttributes": {
    "attrData": [],
    "attrRemain": {}
  }
}
*/

// validate :: CborEncodedTx -> RawTx -> Boolean
export const validate = function (encodedTx, rawTx) {
  // FIXME: Remove hardcoded encoded tx
  encodedTx = 'g5+CANgYWCSCWCB4g7YtdrLfYo2Y0+0UczCsnNCtknH0ju4ECGQFIm9hVAH/n4KC2BhYIYNYHPj8vY0S5G6sIuIcZ9L4ZUberlHazG4Y0DG4PRegABr0/HxwGgXzUWyCgtgYWCGDWBz4/L2NEuRurCLiHGfS+GVG3q5R2sxuGNAxuD0XoAAa9Px8cAr/oA==';
  const tx = decodeTx(encodedTx);
  // TODO: Validate tx vs rawTx
  return true;
};

const sendTx = function (rawTx) {
  return CardanoNodeApi.transactions.buildTx(rawTx)
  .then(({ encodedTx }) => {
    console.log('encodedTx', encodedTx);
    if (validate(encodedTx, rawTx)) {
      return Promise.resolve(encodedTx);
    }
    throw new Error('Invalid Tx');
  })
  .then(({ encodeValidTx }) => {
    console.log('encodeValidTx', encodeValidTx);
    // TODO: sign encodeValidTx and send it!
    //return CardanoNodeApi.transactions.sendTx();
    return Promise.resolve();
  });
};

export default sendTx;
