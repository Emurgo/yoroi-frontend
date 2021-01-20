// @flow

import BigNumber from 'bignumber.js';
import { getJormungandrTxFee, } from '../JormungandrTxSignRequest';
import {
  Logger,
  stringifyError,
} from '../../../../../utils/logging';
import { addressToDisplayString } from '../../../../ada/lib/storage/bridge/utils';
import {
  GenerateTransferTxError
} from '../../../../common/errors';
import LocalizableError from '../../../../../i18n/LocalizableError';
import {
  sendAllUnsignedTx,
  signTransaction,
} from '../utxoTransactions';
import type { CardanoAddressedUtxo } from '../../../../ada/transactions/types';
import type {
  TransferTx
} from '../../../../../types/TransferTypes';
import { RustModule } from '../../../../ada/lib/cardanoCrypto/rustLoader';
import { networks } from '../../../../ada/lib/storage/database/prepackaged/networks';
import type {
  AddressUtxoFunc,
} from '../../state-fetch/types';
import type {
  Address, Addressing
} from '../../../../ada/lib/storage/models/PublicDeriver/interfaces';
import { toSenderUtxos } from '../../../../ada/transactions/transfer/utils';
import type { NetworkRow, JormungandrFeeConfig } from '../../../../ada/lib/storage/database/primitives/tables';
import {
  MultiToken,
} from '../../../../common/lib/MultiToken';
import { PRIMARY_ASSET_CONSTANTS } from '../../../../ada/lib/storage/database/primitives/enums';

/**
 * Generate transaction including all addresses with no change.
*/
export async function buildYoroiTransferTx(payload: {|
  senderUtxos: Array<CardanoAddressedUtxo>,
  outputAddr: string,
  keyLevel: number,
  signingKey: RustModule.WalletV3.Bip32PrivateKey,
  useLegacyWitness: boolean,
  protocolParams: {|
    feeConfig: JormungandrFeeConfig,
    networkId: number,
    genesisHash: string,
  |},
|}): Promise<TransferTx> {
  try {
    const { senderUtxos, outputAddr, } = payload;

    const totalBalance = new MultiToken(
      [{
        identifier: PRIMARY_ASSET_CONSTANTS.Jormungandr,
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
        defaultIdentifier: PRIMARY_ASSET_CONSTANTS.Jormungandr,
      }
    );

    // first build a transaction to see what the fee will be
    const unsignedTxResponse = sendAllUnsignedTx(
      outputAddr,
      senderUtxos,
      undefined,
      {
        feeConfig: payload.protocolParams.feeConfig,
        networkId: payload.protocolParams.networkId,
      },
    );
    const fee = getJormungandrTxFee(unsignedTxResponse.IOs, payload.protocolParams.networkId);

    // sign inputs
    const fragment = signTransaction(
      unsignedTxResponse,
      payload.keyLevel,
      payload.signingKey,
      payload.useLegacyWitness,
      undefined,
      payload.protocolParams.genesisHash,
    );

    const uniqueSenders = Array.from(new Set(senderUtxos.map(utxo => utxo.receiver)));

    // return summary of transaction
    return {
      recoveredBalance: totalBalance,
      fee,
      id: Buffer.from(fragment.id().as_bytes()).toString('hex'),
      encodedTx: fragment.as_bytes(),
      // recall: some addresses may be legacy, some may be Shelley
      senders: uniqueSenders.map(addr => addressToDisplayString(addr, networks.JormungandrMainnet)),
      receivers: [outputAddr],
    };
  } catch (error) {
    Logger.error(`transfer::${nameof(buildYoroiTransferTx)} ${stringifyError(error)}`);
    if (error instanceof LocalizableError) {
      throw error;
    }
    throw new GenerateTransferTxError();
  }
}


export async function yoroiTransferTxFromAddresses(payload: {|
  addresses: Array<{| ...Address, ...Addressing |}>,
  outputAddr: string,
  keyLevel: number,
  signingKey: RustModule.WalletV3.Bip32PrivateKey,
  network: $ReadOnly<NetworkRow>,
  getUTXOsForAddresses: AddressUtxoFunc,
  useLegacyWitness: boolean,
  protocolParams: {|
    feeConfig: JormungandrFeeConfig,
    networkId: number,
    genesisHash: string,
  |},
|}): Promise<TransferTx> {
  const senderUtxos = await toSenderUtxos({
    network: payload.network,
    addresses: payload.addresses,
    getUTXOsForAddresses: payload.getUTXOsForAddresses,
  });
  return buildYoroiTransferTx({
    outputAddr: payload.outputAddr,
    keyLevel: payload.keyLevel,
    signingKey: payload.signingKey,
    senderUtxos,
    useLegacyWitness: payload.useLegacyWitness,
    protocolParams: payload.protocolParams,
  });
}
