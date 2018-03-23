import CardanoNodeApi from '../api/CardanoNodeApi';
import { decodeTx } from '../utils/cborCodec';
import { signTransaction, derivePublic } from '../utils/crypto/cryptoUtils';

const receiverIsValid = function (decodedTx, rawTx) {
  const receivers = decodedTx.txOutputs.filter((output) => {
    return output.address === rawTx.to &&
      output.coin === rawTx.amount;
  });
  return receivers.length === 1;
};

const senderIsValid = function (decodedTx, rawTx) {
  const senders = decodedTx.txOutputs.filter((output) => {
    return output.address === rawTx.from;
  });
  return senders.length === 0 || senders.length === 1;
};

const validateSimpleTx = function (decodedTx, rawTx) {
  return receiverIsValid(decodedTx, rawTx) &&
    senderIsValid(decodedTx, rawTx);
};

const sendTx = async function (rawTx, xprv) {
  const encodedTx = await CardanoNodeApi.transactions.buildTx(rawTx);
  const decodedTx = decodeTx(encodedTx);
  if (!decodedTx || (decodedTx && validateSimpleTx(decodedTx, rawTx))) {
    throw new Error('Invalid Tx');
  }
  // We currently sign with a single private key for this PoC
  const witnesses = decodedTx.txInputs.map(() => {
    const pub = derivePublic(xprv);
    const key = Buffer.from(pub).toString('base64');
    const sig = Buffer.from(signTransaction(encodedTx, xprv)).toString('hex');

    return {
      tag: 'PkWitness',
      key,
      sig,
    };
  });

  const toSend = {
    encodedTx,
    witnesses
  };
  // TODO: Send it!
  //const result = await CardanoNodeApi.transactions.sendTx(signed);
  //return result;
  return true;
};

export default sendTx;
