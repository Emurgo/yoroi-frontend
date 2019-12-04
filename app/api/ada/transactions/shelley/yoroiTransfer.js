// @flow

import BigNumber from 'bignumber.js';
import { getShelleyTxFee, } from './utils';
import {
  Logger,
  stringifyError,
} from '../../../../utils/logging';
import { LOVELACES_PER_ADA } from '../../../../config/numbersConfig';
import { Bech32Prefix } from '../../../../config/stringConfig';
import { addressToDisplayString } from '../../lib/storage/bridge/utils';
import {
  GenerateTransferTxError
} from '../../errors';
import {
  sendAllUnsignedTx,
  signTransaction,
} from './utxoTransactions';
import type { AddressedUtxo } from '../types';
import type {
  TransferTx
} from '../../../../types/TransferTypes';
import { RustModule } from '../../lib/cardanoCrypto/rustLoader';

/**
 * Generate transaction including all addresses with no change.
*/
export async function buildYoroiTransferTx(payload: {|
  senderUtxos: Array<AddressedUtxo>,
  outputAddr: string,
  keyLevel: number,
  signingKey: RustModule.WalletV3.Bip32PrivateKey,
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
    const fee = getShelleyTxFee(unsignedTxResponse.IOs, false);

    // sign inputs
    const fragment = signTransaction(
      unsignedTxResponse,
      payload.keyLevel,
      payload.signingKey,
      true,
    );

    const uniqueSenders = Array.from(new Set(senderUtxos.map(utxo => utxo.receiver)));

    // return summary of transaction
    return {
      recoveredBalance: totalBalance.dividedBy(LOVELACES_PER_ADA),
      fee: fee.dividedBy(LOVELACES_PER_ADA),
      id: Buffer.from(fragment.id().as_bytes()).toString('hex'),
      encodedTx: fragment.as_bytes(),
      // recall: some addresses may be legacy, some may be Shelley
      senders: uniqueSenders.map(addr => addressToDisplayString(addr)),
      receiver: RustModule.WalletV3.Address.from_bytes(
        Buffer.from(outputAddr, 'hex')
      ).to_string(Bech32Prefix.ADDRESS)
    };
  } catch (error) {
    Logger.error(`transfer::buildTransferTx ${stringifyError(error)}`);
    throw new GenerateTransferTxError();
  }
}
