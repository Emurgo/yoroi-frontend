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
import type { CardanoAddressedUtxo, BaseSignRequest } from '../types';
import type {
  TransferTx
} from '../../../../types/TransferTypes';
import { RustModule } from '../../lib/cardanoCrypto/rustLoader';
import type {
  Address, Addressing,
} from '../../lib/storage/models/PublicDeriver/interfaces';
import {
  MultiToken,
} from '../../../common/lib/MultiToken';
import { PRIMARY_ASSET_CONSTANTS } from '../../lib/storage/database/primitives/enums';

/**
 * Generate transaction including all addresses with no change.
*/
export async function buildYoroiTransferTx(payload: {|
  senderUtxos: Array<CardanoAddressedUtxo>,
  outputAddr: {|
    ...Address,
    ...InexactSubset<Addressing>,
  |},
  keyLevel: number,
  signingKey: RustModule.WalletV4.Bip32PrivateKey,
  absSlotNumber: BigNumber,
  protocolParams: {|
    keyDeposit: RustModule.WalletV4.BigNum,
    linearFee: RustModule.WalletV4.LinearFee,
    minimumUtxoVal: RustModule.WalletV4.BigNum,
    poolDeposit: RustModule.WalletV4.BigNum,
    networkId: number,
  |},
|}): Promise<TransferTx> {
  try {
    const { senderUtxos, } = payload;

    const totalBalance = new MultiToken(
      [{
        identifier: PRIMARY_ASSET_CONSTANTS.Cardano,
        amount: senderUtxos
          .map(utxo => new BigNumber(utxo.amount))
          .reduce(
            (acc, amount) => acc.plus(amount),
            new BigNumber(0)
          ),
        networkId: payload.protocolParams.networkId,
      }],
      {
        defaultNetworkId: payload.protocolParams.networkId,
        defaultIdentifier: PRIMARY_ASSET_CONSTANTS.Cardano,
      }
    );

    // first build a transaction to see what the fee will be
    const unsignedTxResponse = sendAllUnsignedTx(
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
      {
        defaultNetworkId: payload.protocolParams.networkId,
        defaultIdentifier: PRIMARY_ASSET_CONSTANTS.Cardano,
      }
    );

    // sign inputs
    const signedTx = signTransaction(
      ({
        senderUtxos: unsignedTxResponse.senderUtxos,
        unsignedTx: unsignedTxResponse.txBuilder,
        changeAddr: unsignedTxResponse.changeAddr,
        certificate: undefined,
      }: BaseSignRequest<RustModule.WalletV4.TransactionBuilder>),
      payload.keyLevel,
      payload.signingKey,
      new Set(),
      undefined,
    );

    // return summary of transaction
    return {
      recoveredBalance: totalBalance,
      fee,
      id: Buffer.from(
        RustModule.WalletV4.hash_transaction(signedTx.body()).to_bytes()
      ).toString('hex'),
      encodedTx: signedTx.to_bytes(),
      // only display unique addresses
      senders: Array.from(new Set(senderUtxos.map(utxo => utxo.receiver))),
      receivers: [payload.outputAddr.address],
    };
  } catch (error) {
    Logger.error(`transfer::${nameof(buildYoroiTransferTx)} ${stringifyError(error)}`);
    if (error instanceof LocalizableError) {
      throw error;
    }
    throw new GenerateTransferTxError();
  }
}
