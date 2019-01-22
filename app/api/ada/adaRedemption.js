// @flow

import {
  Logger,
  stringifyError,
} from '../../utils/logging';
import { getAddressFromRedemptionKey } from './lib/cardanoCrypto/cryptoRedemption';
import type { AdaTransaction } from './adaTypes';
import bs58 from 'bs58';

export type RedeemAdaParams = {
  redemptionCode: string,
  mnemonic: ?Array<string>,
  spendingPassword?: string,
  walletId: string,
  accountIndex: number
};

export type RedeemPaperVendedAdaParams = {
  ...RedeemAdaParams,
  mnemonic: Array<string>,
};

export async function redeemAda(
  redemptionParams: RedeemAdaParams
) : Promise<AdaTransaction> {
  try {
    const redemptionKey = Buffer.from(redemptionParams.redemptionCode, 'base64');
    const addressBuffer = getAddressFromRedemptionKey(redemptionKey);
    const address = bs58.encode(Buffer.from(addressBuffer));
    // TODO: get adresse's utxo
    // TODO: generate tx
    // TODO: publish tx
  } catch (error) {
    Logger.error(`adaRedemption::generateRedemptionTx ${stringifyError(error)}`);
    // TODO: Handle error
    throw new Error();
  }
}

export async function redeemPaperVendedAda(
  redemptionParams: RedeemPaperVendedAdaParams
) : Promise<AdaTransaction> {
  try {
    const redemptionKey = Buffer.from(redemptionParams.redemptionCode, 'base64');
    const addressBuffer = getAddressFromRedemptionKey(redemptionKey);
    const address = bs58.encode(Buffer.from(addressBuffer));
    // TODO: get adresse's utxo
    // TODO: generate tx
    // TODO: publish tx
  } catch (error) {
    Logger.error(`adaRedemption::generateRedemptionTx ${stringifyError(error)}`);
    // TODO: Handle error
    throw new Error();
  }
}
