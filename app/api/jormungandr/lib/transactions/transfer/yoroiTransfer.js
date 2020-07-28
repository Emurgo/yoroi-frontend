// @flow

import BigNumber from 'bignumber.js';
import { getJormungandrTxFee, } from '../JormungandrTxSignRequest';
import {
  Logger,
  stringifyError,
} from '../../../../../utils/logging';
import { Bech32Prefix } from '../../../../../config/stringConfig';
import { addressToDisplayString } from '../../../../ada/lib/storage/bridge/utils';
import {
  GenerateTransferTxError
} from '../../../../common/errors';
import LocalizableError from '../../../../../i18n/LocalizableError';
import {
  sendAllUnsignedTx,
  signTransaction,
} from '../utxoTransactions';
import type { AddressedUtxo } from '../../../../ada/transactions/types';
import type {
  TransferTx
} from '../../../../../types/TransferTypes';
import { RustModule } from '../../../../ada/lib/cardanoCrypto/rustLoader';
import { getJormungandrCurrencyMeta } from '../../../currencyInfo';
import { networks } from '../../../../ada/lib/storage/database/prepackaged/networks';
import type {
  AddressUtxoFunc,
} from '../../state-fetch/types';
import type {
  Address, Addressing
} from '../../../../ada/lib/storage/models/PublicDeriver/interfaces';
import { toSenderUtxos } from '../../../../ada/transactions/transfer/utils';
import type { JormungandrFeeConfig } from '../../../../ada/lib/storage/database/primitives/tables';

/**
 * Generate transaction including all addresses with no change.
*/
export async function buildYoroiTransferTx(payload: {|
  senderUtxos: Array<AddressedUtxo>,
  outputAddr: string,
  keyLevel: number,
  signingKey: RustModule.WalletV3.Bip32PrivateKey,
  useLegacyWitness: boolean,
  genesisHash: string,
  feeConfig: JormungandrFeeConfig,
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
      undefined,
      payload.feeConfig
    );
    const fee = getJormungandrTxFee(unsignedTxResponse.IOs, false);

    // sign inputs
    const fragment = signTransaction(
      unsignedTxResponse,
      payload.keyLevel,
      payload.signingKey,
      payload.useLegacyWitness,
      undefined,
      payload.genesisHash,
    );

    const uniqueSenders = Array.from(new Set(senderUtxos.map(utxo => utxo.receiver)));

    const lovelacesPerAda = new BigNumber(10).pow(getJormungandrCurrencyMeta().decimalPlaces);
    // return summary of transaction
    return {
      recoveredBalance: totalBalance.dividedBy(lovelacesPerAda),
      fee: fee.dividedBy(lovelacesPerAda),
      id: Buffer.from(fragment.id().as_bytes()).toString('hex'),
      encodedTx: fragment.as_bytes(),
      // recall: some addresses may be legacy, some may be Shelley
      senders: uniqueSenders.map(addr => addressToDisplayString(addr, networks.JormungandrMainnet)),
      receiver: RustModule.WalletV3.Address.from_bytes(
        Buffer.from(outputAddr, 'hex')
      ).to_string(Bech32Prefix.ADDRESS)
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
  getUTXOsForAddresses: AddressUtxoFunc,
  useLegacyWitness: boolean,
  genesisHash: string,
  feeConfig: JormungandrFeeConfig,
|}): Promise<TransferTx> {
  const senderUtxos = await toSenderUtxos({
    addresses: payload.addresses,
    getUTXOsForAddresses: payload.getUTXOsForAddresses,
  });
  return buildYoroiTransferTx({
    outputAddr: payload.outputAddr,
    keyLevel: payload.keyLevel,
    signingKey: payload.signingKey,
    senderUtxos,
    useLegacyWitness: payload.useLegacyWitness,
    genesisHash: payload.genesisHash,
    feeConfig: payload.feeConfig,
  });
}
