// @flow

import BigNumber from 'bignumber.js';
import {
  Logger,
  stringifyError,
} from '../../../../utils/logging';
import {
  GenerateTransferTxError
} from '../../../common/errors';
import LocalizableError from '../../../../i18n/LocalizableError';
import {
  sendAllUnsignedTx,
  signTransaction,
} from '../shelley/transactions';
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
  signingKey: RustModule.WalletV4.Bip32PrivateKey,
  absSlotNumber: BigNumber,
  protocolParams: {|
    keyDeposit: RustModule.WalletV4.BigNum,
    linearFee: RustModule.WalletV4.LinearFee,
    minimumUtxoVal: RustModule.WalletV4.BigNum,
    poolDeposit: RustModule.WalletV4.BigNum,
  |}
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
      senderUtxos,
      payload.absSlotNumber,
      payload.protocolParams,
    );
    const fee = new BigNumber(unsignedTxResponse.txBuilder.get_fee_or_calc().to_str());

    // sign inputs
    const signedTx = signTransaction(
      {
        senderUtxos: unsignedTxResponse.senderUtxos,
        unsignedTx: unsignedTxResponse.txBuilder.build(),
        changeAddr: unsignedTxResponse.changeAddr,
        certificate: undefined,
      },
      payload.keyLevel,
      payload.signingKey,
      undefined,
    );

    const lovelacesPerAda = new BigNumber(10).pow(getAdaCurrencyMeta().decimalPlaces);
    // return summary of transaction
    return {
      recoveredBalance: totalBalance.dividedBy(lovelacesPerAda),
      fee: fee.dividedBy(lovelacesPerAda),
      id: Buffer.from(
        RustModule.WalletV4.hash_transaction(signedTx.body()).to_bytes()
      ).toString('hex'),
      encodedTx: signedTx.to_bytes(),
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
