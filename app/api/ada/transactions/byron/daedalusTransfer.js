// @flow

// Create byron transactions for wallets created with the v1 address scheme

import BigNumber from 'bignumber.js';
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
} from '../shelley/transactions';
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
  absSlotNumber: BigNumber,
  protocolParams: {|
    keyDeposit: RustModule.WalletV4.BigNum,
    linearFee: RustModule.WalletV4.LinearFee,
    minimumUtxoVal: RustModule.WalletV4.BigNum,
    poolDeposit: RustModule.WalletV4.BigNum,
  |}
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
    const unsignedTxResponse = sendAllUnsignedTxFromUtxo(
      outputAddr,
      senderUtxos,
      payload.absSlotNumber,
      payload.protocolParams,
    );
    const fee = new BigNumber(unsignedTxResponse.txBuilder.get_fee_or_calc().to_str());

    // sign
    const signedTx = signDaedalusTransaction(
      unsignedTxResponse.txBuilder.build(),
      addressKeys,
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
      senders: Object.keys(addressKeys), // recall: js keys are unique so need to dedupe
      receiver: outputAddr,
    };
  } catch (error) {
    Logger.error(`daedalusTransfer::${nameof(buildDaedalusTransferTx)} ${stringifyError(error)}`);
    if (error instanceof LocalizableError) {
      throw error;
    }
    throw new GenerateTransferTxError();
  }
}

function signDaedalusTransaction(
  unsignedTx: RustModule.WalletV4.TransactionBody,
  addressKeys: AddressKeyMap,
): RustModule.WalletV4.Transaction {
  const txHash = RustModule.WalletV4.hash_transaction(unsignedTx);
  const bootstrapWits = RustModule.WalletV4.BootstrapWitnesses.new();
  // recall: we only need once signature per address
  // since witnesses are a set in Shelley
  // so we iterate over addressKeys which conveniently holds all unique addresses
  for (const base58Addr of Object.keys(addressKeys)) {
    const bootstrapWit = RustModule.WalletV4.make_daedalus_bootstrap_witness(
      txHash,
      RustModule.WalletV4.ByronAddress.from_base58(base58Addr),
      RustModule.WalletV4.LegacyDaedalusPrivateKey.from_bytes(
        Buffer.from(addressKeys[base58Addr].to_hex(), 'hex')
      )
    );
    bootstrapWits.add(bootstrapWit);
  }

  const witSet = RustModule.WalletV4.TransactionWitnessSet.new();
  witSet.set_bootstraps(bootstrapWits);

  return RustModule.WalletV4.Transaction.new(
    unsignedTx,
    witSet,
    undefined,
  );
}
