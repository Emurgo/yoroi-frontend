// @flow

import { getAddressFromRedemptionKey } from './lib/cardanoCrypto/cryptoRedemption';
import bs58 from 'bs58';
import supercop from 'supercop.js';
import { getUTXOsForAddresses } from './lib/yoroi-backend-api';
import { decryptRegularVend } from './lib/decrypt';

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

function transformMnemonicToString(mnemonic) {
  let aux = '';

  mnemonic.forEach(word => {
    aux += ` ${word}`;
  });

  return aux.trim();
}

// TODO: return a Promise of AdaTransaction instead of Object, https://trello.com/c/0FOFzcfy/12-broadcast-redeem-tx
export async function redeemPaperVendedAda(
  redemptionParams: RedeemPaperVendedAdaParams
) : Promise<Object> {
  const redemptionCodeBuffer = bs58.decode(redemptionParams.redemptionCode);
  const mnemonicAsString = transformMnemonicToString(redemptionParams.mnemonics);
  const seed = decryptRegularVend(mnemonicAsString, redemptionCodeBuffer);
  const uint8ArrayAddress = getAddressFromRedemptionKey(Buffer.from(seed, 'base64'));
  const address = bs58.encode(Buffer.from(uint8ArrayAddress));
  const utxos = await getUTXOsForAddresses({ addresses: [address] });
  // TODO: generate ada redeem tx with createRedemptionTransaction function from cardanoCrypto, https://trello.com/c/iAmeNvGk/11-create-a-redeem-tx
  // TODO: broadcast tx with sendTx endpoint, https://trello.com/c/0FOFzcfy/12-broadcast-redeem-tx
}
