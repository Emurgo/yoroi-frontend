// @flow
import { SeedWithInvalidLengthError } from './cryptoErrors';
import type { ConfigType } from '../../../../../config/config-types';
import type { UTXO } from '../../adaTypes';
import {
  addTxInputs,
  addOutput,
  utxoToTxInput
} from '../../adaTransactions/adaNewTransactions';

import { RustModule } from './rustLoader';

declare var CONFIG : ConfigType;

const protocolMagic = CONFIG.network.protocolMagic;

export function getAddressFromRedemptionKey(
  redemptionKey: RustModule.Wallet.PrivateRedeemKey,
): RustModule.Wallet.Address {
  const setting = RustModule.Wallet.BlockchainSettings.from_json({
    protocol_magic: protocolMagic
  });
  try {
    return redemptionKey.public().address(setting);
  } catch (err) {
    throw new SeedWithInvalidLengthError();
  }
}

export function getRedemptionSignedTransaction(
  redemptionKey: RustModule.Wallet.PrivateRedeemKey,
  receiverAddress: string,
  utxo: UTXO
): RustModule.Wallet.SignedTransaction {
  const txBuilder = new RustModule.Wallet.TransactionBuilder();

  const inputs = utxoToTxInput([utxo]);
  addTxInputs(txBuilder, inputs);
  addOutput(txBuilder, receiverAddress, utxo.amount);

  const unsignedTx = txBuilder.make_transaction();
  const txId = unsignedTx.id();
  const txFinalizer = new RustModule.Wallet.TransactionFinalized(unsignedTx);

  // sign the transactions
  const setting = RustModule.Wallet.BlockchainSettings.from_json({
    protocol_magic: protocolMagic
  });
  const witness = RustModule.Wallet.Witness.new_redeem_key(
    setting,
    redemptionKey,
    txId
  );
  txFinalizer.add_witness(witness);

  const signedTx = txFinalizer.finalize();
  return signedTx;
}
