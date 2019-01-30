// @flow

import { getAddressFromRedemptionKey, getRedemptionSignedTransaction } from './lib/cardanoCrypto/cryptoRedemption';
import bs58 from 'bs58';
import { getUTXOsForAddresses } from './lib/yoroi-backend-api';
import type { RedeemResponse } from '../../../flow/declarations/CardanoCrypto';
import { getReceiverAddress } from './adaAddress';

export type RedeemAdaParams = {
  redemptionCode: string,
  mnemonic: ?Array<string>,
  spendingPassword: string,
  walletId: string,
  accountIndex: number
};

export type RedeemPaperVendedAdaParams = {
  redemptionCode: string,
  spendingPassword: string,
  walletId: string,
  accountIndex: number,
  mnemonic: Array<string>,
};

// TODO: return a Promise of AdaTransaction instead of Object
export async function redeemAda(
  redemptionParams: RedeemAdaParams
) : Promise<Object> {
  const redemptionKey = Buffer.from(redemptionParams.redemptionCode, 'base64');
  const uint8ArrayAddress = getAddressFromRedemptionKey(redemptionKey);
  const senderAddress = bs58.encode(Buffer.from(uint8ArrayAddress));
  const utxos = await getUTXOsForAddresses({ addresses: [senderAddress] });
  if (utxos.length === 0) {
    // FIXME: show 'Redemption key already used' message
    throw new Error();
  }
  const receiverAddress = await getReceiverAddress();
  const redemptionSignedTransaction: RedeemResponse =
    getRedemptionSignedTransaction(redemptionKey, receiverAddress, utxos[0]);
  // TODO: broadcast tx with sendTx endpoint
  // const { cborEncodedTx } = redemptionSignedTransaction.result;
  // const signedTx = Buffer.from(cborEncodedTx).toString('base64');
  // return sendTx({ signedTx });
  return {};
}

// TODO: return a Promise of AdaTransaction instead of Object
export async function redeemPaperVendedAda(
  redemptionParams: RedeemPaperVendedAdaParams
) : Promise<Object> {
  const redemptionKey = Buffer.from(redemptionParams.redemptionCode, 'base64');
  const uint8ArrayAddress = getAddressFromRedemptionKey(redemptionKey);
  const address = bs58.encode(Buffer.from(uint8ArrayAddress));
  const utxos = await getUTXOsForAddresses({ addresses: [address] });
  // TODO: generate ada redeem tx with createRedemptionTransaction function from cardanoCrypto
  // TODO: broadcast tx with sendTx endpoint
}
