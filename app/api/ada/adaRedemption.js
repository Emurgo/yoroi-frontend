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

// TODO: return a Promise of AdaTransaction instead of Object, https://trello.com/c/0FOFzcfy/12-broadcast-redeem-tx
export async function redeemPaperVendedAda(
  redemptionParams: RedeemPaperVendedAdaParams
) : Promise<Object> {
  // Crear buffer a partir del redemptionCode (seed encriptada con AES)
  const redemptionCodeBuffer = bs58.decode(redemptionParams.redemptionCode);
  // A partir del mnemonic obtener la key de AES
    // convertir mnemonic a bytes
    // hacer un hash de los bytes para tener la key de AES
  const seed = decryptRegularVend(transformMnemonic(redemptionParams.mnemonics), redemptionCodeBuffer);

  const uint8ArrayAddress2 = getAddressFromRedemptionKey(Buffer.from(seed, 'base64'));
  // en base a la key de AES y el buffer del redemptionCode -> desencryptar la seed (redemptionCode)
  // Ahora tenemos la seed
  // usar el paquete para obtener las keys  a partir del seed
  // secret del key = redemptionKey


  const redemptionKey = Buffer.from(redemptionParams.redemptionCode, 'base64');
  const uint8ArrayAddress = getAddressFromRedemptionKey(redemptionKey);
  const address = bs58.encode(Buffer.from(uint8ArrayAddress));
  const utxos = await getUTXOsForAddresses({ addresses: [address] });
  // TODO: generate ada redeem tx with createRedemptionTransaction function from cardanoCrypto, https://trello.com/c/iAmeNvGk/11-create-a-redeem-tx
  // TODO: broadcast tx with sendTx endpoint, https://trello.com/c/0FOFzcfy/12-broadcast-redeem-tx
}
