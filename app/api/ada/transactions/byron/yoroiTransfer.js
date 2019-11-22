// @flow

import { isEmpty } from 'lodash';
import BigNumber from 'bignumber.js';
import { coinToBigNumber, v3SecretToV2, } from '../utils';
import {
  Logger,
  stringifyError,
} from '../../../../utils/logging';
import { LOVELACES_PER_ADA } from '../../../../config/numbersConfig';
import {
  NoInputsError,
  GenerateTransferTxError
} from '../../errors';
import {
  sendAllUnsignedTx,
  signTransaction,
} from './transactionsV2';
import type { AddressedUtxo } from '../types';
import type {
  AddressUtxoFunc,
} from '../../lib/state-fetch/types';
import type {
  TransferTx
} from '../../../../types/TransferTypes';
import { RustModule } from '../../lib/cardanoCrypto/rustLoader';
import type {
  Address, Addressing
} from '../../lib/storage/models/PublicDeriver/interfaces';

/**
 * Generate transaction including all addresses with no change.
*/
export async function generateYoroiTransferTx(payload: {
  addresses: Array<{| ...Address, ...Addressing |}>,
  outputAddr: string,
  keyLevel: number,
  signingKey: RustModule.WalletV3.Bip32PrivateKey,
  getUTXOsForAddresses: AddressUtxoFunc,
}): Promise<TransferTx> {
  // fetch UTXO
  const utxos = await payload.getUTXOsForAddresses({
    addresses: payload.addresses.map(addr => addr.address)
  });

  // add addressing info to the UTXO
  const addressingMap = new Map<string, Addressing>(
    payload.addresses.map(entry => [
      entry.address,
      { addressing: entry.addressing }
    ])
  );
  const senderUtxos = utxos.map(utxo => {
    const addressing = addressingMap.get(utxo.receiver);
    if (addressing == null) {
      throw new Error('should never happen');
    }
    return {
      ...utxo,
      addressing: addressing.addressing
    };
  });

  if (isEmpty(utxos)) {
    const error = new NoInputsError();
    Logger.error(`yoroiTransfer::generateYoroiTransferTx ${stringifyError(error)}`);
    throw error;
  }

  return buildYoroiTransferTx({
    senderUtxos,
    outputAddr: payload.outputAddr,
    keyLevel: payload.keyLevel,
    signingKey: payload.signingKey,
  });
}

/**
 * Generate transaction including all addresses with no change.
*/
export async function buildYoroiTransferTx(payload: {
  senderUtxos: Array<AddressedUtxo>,
  outputAddr: string,
  keyLevel: number,
  signingKey: RustModule.WalletV3.Bip32PrivateKey,
}): Promise<TransferTx> {
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
      },
      payload.keyLevel,
      v3SecretToV2(payload.signingKey)
      ,
    );

    // return summary of transaction
    return {
      recoveredBalance: totalBalance.dividedBy(LOVELACES_PER_ADA),
      fee: fee.dividedBy(LOVELACES_PER_ADA),
      signedTx,
      // only display unique addresses
      senders: Array.from(new Set(senderUtxos.map(utxo => utxo.receiver))),
      receiver: outputAddr,
    };
  } catch (error) {
    Logger.error(`transfer::buildTransferTx ${stringifyError(error)}`);
    throw new GenerateTransferTxError();
  }
}
