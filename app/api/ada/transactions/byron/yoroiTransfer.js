// @flow

import BigNumber from 'bignumber.js';
import { v3SecretToV2, } from '../utils';
import { coinToBigNumber, } from './utils';
import {
  Logger,
  stringifyError,
} from '../../../../utils/logging';
import { LOVELACES_PER_ADA } from '../../../../config/numbersConfig';
import {
  GenerateTransferTxError
} from '../../errors';
import LocalizableError from '../../../../i18n/LocalizableError';
import {
  sendAllUnsignedTx,
  signTransaction,
} from './transactionsV2';
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
    const fee = coinToBigNumber(
      unsignedTxResponse.txBuilder.get_balance_without_fees().value()
    );

    // sign inputs
    const signedTx = signTransaction(
      {
        senderUtxos: unsignedTxResponse.senderUtxos,
        unsignedTx: unsignedTxResponse.txBuilder.make_transaction(),
        changeAddr: unsignedTxResponse.changeAddr,
        certificate: undefined,
      },
      payload.keyLevel,
      v3SecretToV2(payload.signingKey)
      ,
    );

    // return summary of transaction
    return {
      recoveredBalance: totalBalance.dividedBy(LOVELACES_PER_ADA),
      fee: fee.dividedBy(LOVELACES_PER_ADA),
      id: signedTx.id(),
      encodedTx: Buffer.from(signedTx.to_hex(), 'hex'),
      // only display unique addresses
      senders: Array.from(new Set(senderUtxos.map(utxo => utxo.receiver))),
      receiver: outputAddr,
    };
  } catch (error) {
    Logger.error(`transfer::buildTransferTx ${stringifyError(error)}`);
    if (error instanceof LocalizableError) {
      throw error;
    }
    throw new GenerateTransferTxError();
  }
}
