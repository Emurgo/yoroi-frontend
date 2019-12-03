// @flow

// Create byron transactions for wallets created with the v1 address scheme

import BigNumber from 'bignumber.js';
import { getShelleyTxFee, } from './utils';
import {
  Logger,
  stringifyError,
} from '../../../../utils/logging';
import { LOVELACES_PER_ADA } from '../../../../config/numbersConfig';
import { Bech32Prefix } from '../../../../config/stringConfig';
import {
  GenerateTransferTxError
} from '../../errors';
import {
  sendAllUnsignedTxFromUtxo,
} from './utxoTransactions';
import type {
  RemoteUnspentOutput
} from '../../lib/state-fetch/types';
import type {
  TransferTx
} from '../../../../types/TransferTypes';
import { RustModule } from '../../lib/cardanoCrypto/rustLoader';
import type {
  V3UnsignedTxUtxoResponse,
  AddressKeyMap,
} from '../types';

import type { ConfigType } from '../../../../../config/config-types';

declare var CONFIG : ConfigType;

/**
 * Generate transaction including all addresses with no change.
*/
export async function buildDaedalusTransferTx(payload: {|
  addressKeys: AddressKeyMap,
  senderUtxos: Array<RemoteUnspentOutput>,
  outputAddr: string,
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
    const utxoResponse = sendAllUnsignedTxFromUtxo(
      outputAddr,
      senderUtxos
    );
    const fee = getShelleyTxFee(utxoResponse.IOs, false);

    // sign
    const signedTx = signDaedalusTransaction(
      utxoResponse,
      addressKeys,
    );

    const fragment = RustModule.WalletV3.Fragment.from_transaction(signedTx);

    // return summary of transaction
    return {
      recoveredBalance: totalBalance.dividedBy(LOVELACES_PER_ADA),
      fee: fee.dividedBy(LOVELACES_PER_ADA),
      id: Buffer.from(fragment.id().as_bytes()).toString('hex'),
      encodedTx: fragment.as_bytes(),
      // recall: Daedalus addresses all have to be legacy so we don't turn them to bech32
      senders: Object.keys(addressKeys),
      receiver: RustModule.WalletV3.Address.from_bytes(
        Buffer.from(outputAddr, 'hex')
      ).to_string(Bech32Prefix.ADDRESS)
    };
  } catch (error) {
    Logger.error(`daedalusTransfer::buildTransferTx ${stringifyError(error)}`);
    throw new GenerateTransferTxError();
  }
}

function signDaedalusTransaction(
  signRequest: V3UnsignedTxUtxoResponse,
  addressKeys: AddressKeyMap,
): RustModule.WalletV3.Transaction {
  const { senderUtxos, IOs } = signRequest;

  const txbuilder = new RustModule.WalletV3.TransactionBuilder();
  const builderSetIOs = txbuilder.no_payload();
  const builderSetWitnesses = builderSetIOs.set_ios(
    IOs.inputs(),
    IOs.outputs()
  );

  const builderSetAuthData = addWitnesses(
    builderSetWitnesses,
    addressKeys,
    senderUtxos,
  );

  const signedTx = builderSetAuthData.set_payload_auth(
    // can't add a certificate to a UTXO transaction
    RustModule.WalletV3.PayloadAuthData.for_no_payload()
  );
  return signedTx;
}

function addWitnesses(
  builderSetWitnesses: RustModule.WalletV3.TransactionBuilderSetWitness,
  addressKeys: AddressKeyMap,
  senderUtxos: Array<RemoteUnspentOutput>,
): RustModule.WalletV3.TransactionBuilderSetAuthData {
  const witnesses = RustModule.WalletV3.Witnesses.new();
  for (let i = 0; i < senderUtxos.length; i++) {
    const witness = RustModule.WalletV3.Witness.for_legacy_daedalus_utxo(
      RustModule.WalletV3.Hash.from_hex(CONFIG.genesis.genesisHash),
      builderSetWitnesses.get_auth_data_for_witness(),
      RustModule.WalletV3.LegacyDaedalusPrivateKey.from_bytes(
        Buffer.from(addressKeys[senderUtxos[i].receiver].to_hex(), 'hex')
      ),
    );
    witnesses.add(witness);
  }
  return builderSetWitnesses.set_witnesses(witnesses);
}
