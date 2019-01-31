// @flow

import { getAddressFromRedemptionKey } from './lib/cardanoCrypto/cryptoRedemption';
import bs58 from 'bs58';
import { getUTXOsForAddresses } from './lib/yoroi-backend-api';

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
  const address = bs58.encode(Buffer.from(uint8ArrayAddress));
  const utxos = await getUTXOsForAddresses({ addresses: [address] });
  // TODO: generate ada redeem tx with createRedemptionTransaction function from cardanoCrypto, https://trello.com/c/iAmeNvGk/11-create-a-redeem-tx
  // TODO: broadcast tx with sendTx endpoint, https://trello.com/c/0FOFzcfy/12-broadcast-redeem-tx
  return {};
}

// TODO: return a Promise of AdaTransaction instead of Object, https://trello.com/c/0FOFzcfy/12-broadcast-redeem-tx
export async function redeemPaperVendedAda(
  redemptionParams: RedeemPaperVendedAdaParams
) : Promise<Object> {
  const redemptionKey = Buffer.from(redemptionParams.redemptionCode, 'base64');
  const uint8ArrayAddress = getAddressFromRedemptionKey(redemptionKey);
  const address = bs58.encode(Buffer.from(uint8ArrayAddress));
  const utxos = await getUTXOsForAddresses({ addresses: [address] });
  // TODO: generate ada redeem tx with createRedemptionTransaction function from cardanoCrypto, https://trello.com/c/iAmeNvGk/11-create-a-redeem-tx
  // TODO: broadcast tx with sendTx endpoint, https://trello.com/c/0FOFzcfy/12-broadcast-redeem-tx
}
