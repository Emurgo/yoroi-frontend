// @flow

import BigNumber from 'bignumber.js';
import { getJormungandrTxFee, } from './utils';
import {
  Logger,
  stringifyError,
} from '../../../../utils/logging';
import { Bech32Prefix } from '../../../../config/stringConfig';
import { addressToDisplayString } from '../../lib/storage/bridge/utils';
import {
  GenerateTransferTxError
} from '../../errors';
import LocalizableError from '../../../../i18n/LocalizableError';
import {
  sendAllUnsignedTx,
  signTransaction,
} from './utxoTransactions';
import type { AddressedUtxo } from '../types';
import type {
  TransferTx
} from '../../../../types/TransferTypes';
import { RustModule } from '../../lib/cardanoCrypto/rustLoader';
import { getAdaCurrencyMeta } from '../../currencyInfo';

/**
 * Generate transaction including all addresses with no change.
*/
export async function buildYoroiTransferTx(payload: {|
  senderUtxos: Array<AddressedUtxo>,
  outputAddr: string,
  keyLevel: number,
  signingKey: RustModule.WalletV3.Bip32PrivateKey,
  useLegacyWitness: boolean,
|}): Promise<TransferTx> {
  try {
    const { senderUtxos, outputAddr, } = payload;

    const totalBalance = senderUtxos
      .map(utxo => new BigNumber(utxo.amount))
      .reduce(
        (acc, amount) => acc.plus(amount),
        new BigNumber(0)
      );

    // first build a transaction to see what the fee will be
    const unsignedTxResponse = sendAllUnsignedTx(
      outputAddr,
      senderUtxos
    );
    const fee = getJormungandrTxFee(unsignedTxResponse.IOs, false);

    // sign inputs
    const fragment = signTransaction(
      unsignedTxResponse,
      payload.keyLevel,
      payload.signingKey,
      payload.useLegacyWitness,
    );

    const uniqueSenders = Array.from(new Set(senderUtxos.map(utxo => utxo.receiver)));

    const lovelacesPerAda = new BigNumber(10).pow(getAdaCurrencyMeta().decimalPlaces);
    // return summary of transaction
    return {
      recoveredBalance: totalBalance.dividedBy(lovelacesPerAda),
      fee: fee.dividedBy(lovelacesPerAda),
      id: Buffer.from(fragment.id().as_bytes()).toString('hex'),
      encodedTx: fragment.as_bytes(),
      // recall: some addresses may be legacy, some may be Shelley
      senders: uniqueSenders.map(addr => addressToDisplayString(addr)),
      receiver: RustModule.WalletV3.Address.from_bytes(
        Buffer.from(outputAddr, 'hex')
      ).to_string(Bech32Prefix.ADDRESS)
    };
  } catch (error) {
    Logger.error(`transfer::${nameof(buildYoroiTransferTx)} ${stringifyError(error)}`);
    if (error instanceof LocalizableError) {
      throw error;
    }
    throw new GenerateTransferTxError();
  }
}
