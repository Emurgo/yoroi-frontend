// @flow

import {
  Logger,
  stringifyError,
} from '../../utils/logging';
// import { getAddressFromRedemptionKey } from './lib/cardanoCrypto/cryptoRedemption';
import { base64StringToUint8Array } from './lib/utils';
import type { AdaTransaction } from './adaTypes';

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
    const redemptionKey = base64StringToUint8Array(redemptionParams.redemptionCode);
    // TODO: get address from redemption key: const address = getAddressFromRedemptionKey(redemptionKey);
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
    const redemptionKey = base64StringToUint8Array(redemptionParams.redemptionCode);
    // TODO: get address from redemption key: const address = getAddressFromRedemptionKey(redemptionKey);
    // TODO: get adresse's utxo
    // TODO: generate tx
    // TODO: publish tx
  } catch (error) {
    Logger.error(`adaRedemption::generateRedemptionTx ${stringifyError(error)}`);
    // TODO: Handle error
    throw new Error();
  }
}
