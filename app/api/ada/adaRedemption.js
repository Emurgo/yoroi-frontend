// @flow

import { getAddressFromRedemptionKey, getRedemptionSignedTransaction } from './lib/cardanoCrypto/cryptoRedemption';
import { SeedWithInvalidLengthError } from './lib/cardanoCrypto/cryptoErrors';
import bs58 from 'bs58';
import { decryptRegularVend } from './lib/decrypt';
import { getReceiverAddress } from './adaAddress';
import { RedemptionKeyAlreadyUsedError } from './errors';
import BigNumber from 'bignumber.js';
import type { AddressUtxoFunc, SendFunc } from './lib/state-fetch/types';

import { RustModule } from './lib/cardanoCrypto/rustLoader';

export type RedeemAdaParams = {
  redemptionCode: string,
  getUTXOsForAddresses: AddressUtxoFunc,
  sendTx: SendFunc,
};

export type RedeemPaperVendedAdaParams = {
  redemptionCode: string,
  mnemonics: Array<string>,
  getUTXOsForAddresses: AddressUtxoFunc,
  sendTx: SendFunc,
};

async function createAndSendTx(
  keyBytes: Buffer,
  getUTXOsForAddresses: AddressUtxoFunc,
  sendTx: SendFunc,
) : Promise<BigNumber> {
  let redeemKey;
  try {
    redeemKey = RustModule.Wallet.PrivateRedeemKey.from_bytes(keyBytes);
  } catch (err) {
    throw new SeedWithInvalidLengthError();
  }
  const address = getAddressFromRedemptionKey(redeemKey);
  const utxos = await getUTXOsForAddresses({ addresses: [address.to_base58()] });
  if (utxos.length === 0) {
    throw new RedemptionKeyAlreadyUsedError();
  }
  const receiverAddress = await getReceiverAddress();

  const signedTx = getRedemptionSignedTransaction(
    redeemKey,
    receiverAddress,
    utxos[0]  // note: redemptions should only ever have a single UTXO
  );
  await sendTx({ signedTx });
  return new BigNumber(utxos[0].amount);
}

export async function redeemAda(
  redemptionParams: RedeemAdaParams
) : Promise<BigNumber> {
  const redemptionKey = Buffer.from(redemptionParams.redemptionCode, 'base64');

  return createAndSendTx(
    redemptionKey,
    redemptionParams.getUTXOsForAddresses,
    redemptionParams.sendTx,
  );
}

export async function redeemPaperVendedAda(
  redemptionParams: RedeemPaperVendedAdaParams
) : Promise<BigNumber> {
  const redemptionCodeBuffer = bs58.decode(redemptionParams.redemptionCode);
  const mnemonicAsString = redemptionParams.mnemonics.join(' ');
  const seed = decryptRegularVend(mnemonicAsString, redemptionCodeBuffer);
  const redemptionKey = Buffer.from(seed, 'base64');

  return createAndSendTx(
    redemptionKey,
    redemptionParams.getUTXOsForAddresses,
    redemptionParams.sendTx,
  );
}
