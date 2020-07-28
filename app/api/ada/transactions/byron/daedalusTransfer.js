// @flow

// Create byron transactions for wallets created with the v1 address scheme

import BigNumber from 'bignumber.js';
import { coinToBigNumber, } from './utils';
import {
  Logger,
  stringifyError,
} from '../../../../utils/logging';
import {
  GenerateTransferTxError,
} from '../../../common/errors';
import LocalizableError from '../../../../i18n/LocalizableError';
import {
  sendAllUnsignedTxFromUtxo,
} from './transactionsV2';
import type {
  RemoteUnspentOutput
} from '../../lib/state-fetch/types';
import type {
  TransferTx,
} from '../../../../types/TransferTypes';
import type { AddressKeyMap } from '../types';
import { RustModule } from '../../lib/cardanoCrypto/rustLoader';
import { getAdaCurrencyMeta } from '../../currencyInfo';

/**
 * Generate transaction including all addresses with no change.
*/
export async function buildDaedalusTransferTx(payload: {|
  addressKeys: AddressKeyMap,
  senderUtxos: Array<RemoteUnspentOutput>,
  outputAddr: string,
  byronNetworkMagic: number,
|}): Promise<TransferTx> {
  try {
    const { addressKeys, senderUtxos, outputAddr } = payload;

    const totalBalance = senderUtxos
      .map(utxo => new BigNumber(utxo.amount))
      .reduce(
        (acc, amount) => acc.plus(amount),
        new BigNumber(0)
      );

    // build tx
    const txBuilder = sendAllUnsignedTxFromUtxo(
      outputAddr,
      senderUtxos
    ).txBuilder;
    const fee = coinToBigNumber(txBuilder.get_balance_without_fees().value());

    // sign
    const signedTx = signDaedalusTransaction(
      txBuilder.make_transaction(),
      addressKeys,
      senderUtxos,
      payload.byronNetworkMagic,
    );

    const lovelacesPerAda = new BigNumber(10).pow(getAdaCurrencyMeta().decimalPlaces);
    // return summary of transaction
    return {
      recoveredBalance: totalBalance.dividedBy(lovelacesPerAda),
      fee: fee.dividedBy(lovelacesPerAda),
      id: signedTx.id(),
      encodedTx: Buffer.from(signedTx.to_hex(), 'hex'),
      senders: Object.keys(addressKeys),
      receiver: outputAddr,
    };
  } catch (error) {
    Logger.error(`daedalusTransfer::buildTransferTx ${stringifyError(error)}`);
    if (error instanceof LocalizableError) {
      throw error;
    }
    throw new GenerateTransferTxError();
  }
}

function signDaedalusTransaction(
  unsignedTx: RustModule.WalletV2.Transaction,
  addressKeys: AddressKeyMap,
  senderUtxos: Array<RemoteUnspentOutput>,
  byronNetworkMagic: number,
): RustModule.WalletV2.SignedTransaction {
  const txFinalizer = new RustModule.WalletV2.TransactionFinalized(unsignedTx);

  const setting = RustModule.WalletV2.BlockchainSettings.from_json({
    protocol_magic: byronNetworkMagic
  });
  for (let i = 0; i < senderUtxos.length; i++) {
    const witness = RustModule.WalletV2.Witness.new_extended_key(
      setting,
      addressKeys[senderUtxos[i].receiver],
      txFinalizer.id()
    );
    txFinalizer.add_witness(witness);
  }

  const signedTx = txFinalizer.finalize();
  return signedTx;
}
