// @flow

import { getAddressFromRedemptionKey } from './lib/cardanoCrypto/cryptoRedemption';
import type { AdaTransaction } from './adaTypes';
import bs58 from 'bs58';
import { getUTXOsForAddresses } from './lib/yoroi-backend-api';

export type RedeemAdaParams = {
  redemptionCode: string,
  mnemonic: ?Array<string>,
  spendingPassword?: string,
  walletId: string,
  accountIndex: number
};

export type RedeemPaperVendedAdaParams = {
  redemptionCode: string,
  mnemonic: ?Array<string>,
  spendingPassword?: string,
  walletId: string,
  accountIndex: number,
  mnemonic: Array<string>,
};

export async function redeemAda(
  redemptionParams: RedeemAdaParams
) : Promise<AdaTransaction> {
  const redemptionKey = Buffer.from(redemptionParams.redemptionCode, 'base64');
  const addressBuffer = getAddressFromRedemptionKey(redemptionKey);
  const address = bs58.encode(Buffer.from(addressBuffer));
  const utxos = await getUTXOsForAddresses({ addresses: [address] });
  // TODO: generate ada redeem tx with createRedemptionTransaction function from cardanoCrypto
  // TODO: broadcast tx with sendTx endpoint
}

export async function redeemPaperVendedAda(
  redemptionParams: RedeemPaperVendedAdaParams
) : Promise<AdaTransaction> {
  const redemptionKey = Buffer.from(redemptionParams.redemptionCode, 'base64');
  const addressBuffer = getAddressFromRedemptionKey(redemptionKey);
  const address = bs58.encode(Buffer.from(addressBuffer));
  const utxos = await getUTXOsForAddresses({ addresses: [address] });
  // TODO: generate ada redeem tx with createRedemptionTransaction function from cardanoCrypto
  // TODO: broadcast tx with sendTx endpoint
}
