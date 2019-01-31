// @flow

import { getAddressFromRedemptionKey, getRedemptionSignedTransaction } from './lib/cardanoCrypto/cryptoRedemption';
import bs58 from 'bs58';
import { getUTXOsForAddresses } from './lib/yoroi-backend-api';
import type { RedeemResponse } from '../../../flow/declarations/CardanoCrypto';
import { getReceiverAddress } from './adaAddress';
import { RedemptionKeyAlreadyUsedError } from './errors';

export type RedeemAdaParams = {
  redemptionCode: string,
  walletId: string,
  accountIndex: number
};

export type RedeemPaperVendedAdaParams = {
  redemptionCode: string,
  walletId: string,
  accountIndex: number,
  mnemonics: Array<string>,
};

// TODO: return a Promise of AdaTransaction instead of Object, https://trello.com/c/0FOFzcfy/12-broadcast-redeem-tx
export async function redeemAda(
  redemptionParams: RedeemAdaParams
) : Promise<Object> {
  const redemptionKey = Buffer.from(redemptionParams.redemptionCode, 'base64');
  const uint8ArrayAddress = getAddressFromRedemptionKey(redemptionKey);
  const senderAddress = bs58.encode(Buffer.from(uint8ArrayAddress));
  const utxos = await getUTXOsForAddresses({ addresses: [senderAddress] });
  if (utxos.length === 0) {
    throw new RedemptionKeyAlreadyUsedError();
  }
  const receiverAddress = await getReceiverAddress();
  const redemptionSignedTransaction: RedeemResponse =
    getRedemptionSignedTransaction(redemptionKey, receiverAddress, utxos[0]);
  // TODO: broadcast tx with sendTx endpoint, https://trello.com/c/0FOFzcfy/12-broadcast-redeem-tx
  // const { cborEncodedTx } = redemptionSignedTransaction.result;
  // const signedTx = Buffer.from(cborEncodedTx).toString('base64');
  // return sendTx({ signedTx });
  return {};
}

// TODO: return a Promise of AdaTransaction instead of Object, https://trello.com/c/0FOFzcfy/12-broadcast-redeem-tx
export async function redeemPaperVendedAda(
  redemptionParams: RedeemPaperVendedAdaParams
) : Promise<Object> {
  const redemptionKey = Buffer.from(redemptionParams.redemptionCode, 'base64');
  const uint8ArrayAddress = getAddressFromRedemptionKey(redemptionKey);
  const senderAddress = bs58.encode(Buffer.from(uint8ArrayAddress));
  const utxos = await getUTXOsForAddresses({ addresses: [senderAddress] });
  if (utxos.length === 0) {
    throw new RedemptionKeyAlreadyUsedError();
  }
  const receiverAddress = await getReceiverAddress();
  const redemptionSignedTransaction: RedeemResponse =
    getRedemptionSignedTransaction(redemptionKey, receiverAddress, utxos[0]);
  // TODO: broadcast tx with sendTx endpoint, https://trello.com/c/0FOFzcfy/12-broadcast-redeem-tx
  // const { cborEncodedTx } = redemptionSignedTransaction.result;
  // const signedTx = Buffer.from(cborEncodedTx).toString('base64');
  // return sendTx({ signedTx });
  return {};
}
