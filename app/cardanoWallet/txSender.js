import CardanoNodeApi from '../api/CardanoNodeApi';
import { decodeTx } from '../utils/cborCodec';
import { hashTransaction, signTransaction, derivePublic } from '../utils/crypto/cryptoUtils';

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
  const txResponse = await CardanoNodeApi.transactions.buildTx(rawTx);
  const encodedTx = txResponse.Right;
  const decodedTx = decodeTx(encodedTx);
  if (!decodedTx || (decodedTx && !validateSimpleTx(decodedTx, rawTx))) {
    throw new Error('Invalid Tx');
  }

  const txHash = Buffer.from(hashTransaction(Buffer.from(encodedTx, 'base64'))).toString('hex');
  const signTag = '01';
  const protocolMagic = '1A25C00FA9';
  const tag = `${signTag}${protocolMagic}5820`;
  const toSign = Buffer.from(`${tag}${txHash}`, 'hex');
  // We currently sign with a single private key for this PoC
  const txWitness = decodedTx.txInputs.map(() => {
    const pub = derivePublic(xprv);
    const key = Buffer.from(pub).toString('base64');
    const sig = Buffer.from(signTransaction(xprv, toSign)).toString('hex');

    return {
      tag: 'PkWitness',
      key,
      sig,
    };
  });

  const toSend = {
    encodedTx,
    txWitness
  };
  return CardanoNodeApi.transactions.sendTx(toSend);
};

export default sendTx;
