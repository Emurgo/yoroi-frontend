// @flow

// Create byron transactions for wallets created with the v1 address scheme

import BigNumber from 'bignumber.js';
import { getJormungandrTxFee, } from './JormungandrTxSignRequest';
import {
  Logger,
  stringifyError,
} from '../../../../utils/logging';
import {
  GenerateTransferTxError
} from '../../../common/errors';
import LocalizableError from '../../../../i18n/LocalizableError';
import {
  sendAllUnsignedTxFromUtxo,
} from './utxoTransactions';
import type {
  RemoteUnspentOutput
} from '../state-fetch/types';
import type {
  TransferTx
} from '../../../../types/TransferTypes';
import { RustModule } from '../../../ada/lib/cardanoCrypto/rustLoader';
import type {
  V3UnsignedTxUtxoResponse,
  AddressKeyMap,
} from '../../../ada/transactions/types';
import type { JormungandrFeeConfig } from '../../../ada/lib/storage/database/primitives/tables';
import {
  MultiToken,
} from '../../../common/lib/MultiToken';
import { PRIMARY_ASSET_CONSTANTS } from '../../../ada/lib/storage/database/primitives/enums';

/**
 * Generate transaction including all addresses with no change.
*/
export async function buildDaedalusTransferTx(payload: {|
  addressKeys: AddressKeyMap,
  senderUtxos: Array<RemoteUnspentOutput>,
  outputAddr: string,
  protocolParams: {|
    genesisHash: string,
    feeConfig: JormungandrFeeConfig,
    networkId: number,
  |},
|}): Promise<TransferTx> {
  try {
    const { addressKeys, senderUtxos, outputAddr } = payload;

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

    // build tx
    const utxoResponse = sendAllUnsignedTxFromUtxo(
      outputAddr,
      senderUtxos,
      undefined,
      {
        feeConfig: payload.protocolParams.feeConfig,
        networkId: payload.protocolParams.networkId,
      }
    );
    const fee = getJormungandrTxFee(utxoResponse.IOs, payload.protocolParams.networkId);

    // sign
    const signedTx = signDaedalusTransaction(
      utxoResponse,
      addressKeys,
      payload.protocolParams.genesisHash,
    );

    const fragment = RustModule.WalletV3.Fragment.from_transaction(signedTx);
    // return summary of transaction
    return {
      recoveredBalance: totalBalance,
      fee,
      id: Buffer.from(fragment.id().as_bytes()).toString('hex'),
      encodedTx: fragment.as_bytes(),
      // recall: Daedalus addresses all have to be legacy so we don't turn them to bech32
      senders: Object.keys(addressKeys),  // recall: js keys are unique so need to dedupe
      receivers: [outputAddr]
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
  signRequest: V3UnsignedTxUtxoResponse,
  addressKeys: AddressKeyMap,
  genesisHash: string,
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
    genesisHash,
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
  genesisHash: string,
): RustModule.WalletV3.TransactionBuilderSetAuthData {
  const witnesses = RustModule.WalletV3.Witnesses.new();
  for (let i = 0; i < senderUtxos.length; i++) {
    const witness = RustModule.WalletV3.Witness.for_legacy_daedalus_utxo(
      RustModule.WalletV3.Hash.from_hex(genesisHash),
      builderSetWitnesses.get_auth_data_for_witness(),
      RustModule.WalletV3.LegacyDaedalusPrivateKey.from_bytes(
        Buffer.from(addressKeys[senderUtxos[i].receiver].to_hex(), 'hex')
      ),
    );
    witnesses.add(witness);
  }
  return builderSetWitnesses.set_witnesses(witnesses);
}
