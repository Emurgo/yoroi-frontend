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
import type {
  Address, Addressing,
} from '../../lib/storage/models/PublicDeriver/interfaces';
import {
  MultiToken,
} from '../../../common/lib/MultiToken';
import { PRIMARY_ASSET_CONSTANTS } from '../../lib/storage/database/primitives/enums';
import { multiTokenFromRemote } from '../utils';

/**
 * Generate transaction including all addresses with no change.
*/
export async function buildDaedalusTransferTx(payload: {|
  addressKeys: AddressKeyMap,
  senderUtxos: Array<RemoteUnspentOutput>,
  outputAddr: {|
    ...Address,
    ...InexactSubset<Addressing>,
  |},
  absSlotNumber: BigNumber,
  protocolParams: {|
    keyDeposit: RustModule.WalletV4.BigNum,
    linearFee: RustModule.WalletV4.LinearFee,
    coinsPerUtxoWord: RustModule.WalletV4.BigNum,
    poolDeposit: RustModule.WalletV4.BigNum,
    networkId: number,
  |},
|}): Promise<TransferTx> {
  try {
    const { addressKeys, senderUtxos, } = payload;

    const defaultEntryInfo = {
      defaultNetworkId: payload.protocolParams.networkId,
      defaultIdentifier: PRIMARY_ASSET_CONSTANTS.Cardano,
    };

    const totalBalance = senderUtxos
      .map(utxo => multiTokenFromRemote(
        utxo,
        payload.protocolParams.networkId
      ))
      .reduce(
        (acc, next) => acc.joinAddMutable(next),
        new MultiToken([], defaultEntryInfo)
      );

    // build tx
    const unsignedTxResponse = sendAllUnsignedTxFromUtxo(
      payload.outputAddr,
      senderUtxos,
      payload.absSlotNumber,
      payload.protocolParams,
    );
    const fee = new MultiToken(
      [{
        identifier: PRIMARY_ASSET_CONSTANTS.Cardano,
        amount: new BigNumber(
          unsignedTxResponse.txBuilder.get_fee_if_set()?.to_str() || '0'
        ).plus(unsignedTxResponse.txBuilder.get_deposit().to_str()),
        networkId: payload.protocolParams.networkId,
      }],
      defaultEntryInfo
    );

    // sign
    const signedTx = signDaedalusTransaction(
      unsignedTxResponse.txBuilder.build(),
      addressKeys,
    );

    // return summary of transaction
    return {
      recoveredBalance: totalBalance,
      fee,
      id: Buffer.from(
        RustModule.WalletV4.hash_transaction(signedTx.body()).to_bytes()
      ).toString('hex'),
      encodedTx: signedTx.to_bytes(),
      senders: Object.keys(addressKeys), // recall: js keys are unique so need to dedupe
      receivers: [payload.outputAddr.address],
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
