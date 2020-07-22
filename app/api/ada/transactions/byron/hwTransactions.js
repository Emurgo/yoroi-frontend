// @flow
import {
  Logger,
  stringifyError,
  stringifyData
} from '../../../../utils/logging';
import type {
  BaseSignRequest,
} from '../types';
import type { UtxoLookupMap }  from '../utils';
import { utxosToLookupMap, verifyFromBip44Root }  from '../utils';
import type {
  SendFunc,
  TxBodiesFunc,
  SignedRequest,
} from '../../lib/state-fetch/types';
import {
  SendTransactionError,
  InvalidWitnessError,
} from '../../../common/errors';
import type {
  BroadcastTrezorSignedTxResponse,
  PrepareAndBroadcastLedgerSignedTxResponse
} from '../../index';
import type {
  LedgerSignTxPayload,
} from '../../../../domain/HWSignTx';
import type {
  InputTypeUTxO,
  OutputTypeAddress,
  OutputTypeChange,
  SignTransactionResponse as LedgerSignTxResponse,
  Witness
} from '@cardano-foundation/ledgerjs-hw-app-cardano';
import { toDerivationPathString } from '@emurgo/ledger-connect-handler';
import type {
  CardanoSignTransaction,
  CardanoInput,
  CardanoOutput,
} from 'trezor-connect/lib/types/networks/cardano';
import type {
  Address, Value, Addressing,
} from '../../lib/storage/models/PublicDeriver/interfaces';

import type { ConfigType } from '../../../../../config/config-types';

import { RustModule } from '../../lib/cardanoCrypto/rustLoader';

declare var CONFIG: ConfigType;

// ==================== TREZOR ==================== //
/** Generate a payload for Trezor SignTx */
export async function createTrezorSignTxPayload(
  signRequest: BaseSignRequest<RustModule.WalletV2.Transaction>,
  getTxsBodiesForUTXOs: TxBodiesFunc,
): Promise<$Exact<CardanoSignTransaction>> {
  const txJson = signRequest.unsignedTx.to_json();

  const utxoMap = utxosToLookupMap(
    signRequest.senderUtxos.map(utxo => ({
      utxo_id: utxo.utxo_id,
      tx_hash: utxo.tx_hash,
      tx_index: utxo.tx_index,
      receiver: utxo.receiver,
      amount: utxo.amount,
    }))
  );

  // Inputs
  const trezorInputs = _transformToTrezorInputs(
    txJson.inputs,
    new Map(signRequest.senderUtxos.map(utxo => [
      utxo.receiver,
      { addressing: utxo.addressing },
    ])),
    utxoMap,
  );

  // Output
  const trezorOutputs = _generateTrezorOutputs(
    txJson.outputs,
    signRequest.changeAddr
  );

  // Transactions
  // Map inputs to UNIQUE tx hashes (there might be multiple inputs from the same tx)
  const txsHashes = [...new Set(txJson.inputs.map(x => x.id))];
  const txsBodiesMap = await getTxsBodiesForUTXOs({ txsHashes });
  const txsBodies = txJson.inputs.map((x) => txsBodiesMap[x.id]);

  return {
    inputs: trezorInputs,
    outputs: trezorOutputs,
    transactions: txsBodies,
    protocol_magic: CONFIG.network.protocolMagic,
  };
}

/** Send a transaction and save the new change address */
export async function broadcastTrezorSignedTx(
  signedTxRequest: SignedRequest,
  sendTx: SendFunc,
): Promise<BroadcastTrezorSignedTxResponse> {
  Logger.debug('hwTransactions::broadcastTrezorSignedTx: called');
  try {
    const backendResponse = await sendTx(signedTxRequest);
    Logger.debug('hwTransactions::broadcastTrezorSignedTx: success');

    return backendResponse;
  } catch (sendTxError) {
    Logger.error('hwTransactions::broadcastTrezorSignedTx error: ' + stringifyError(sendTxError));
    if (sendTxError instanceof InvalidWitnessError) {
      throw new InvalidWitnessError();
    }
    throw new SendTransactionError();
  }
}

function _transformToTrezorInputs(
  inputs: Array<TxoPointerType>,
  addressMap: Map<string, Addressing>,
  utxoMap: UtxoLookupMap,
): Array<CardanoInput> {
  return inputs.map((input: TxoPointerType) => {
    const utxo = utxoMap[input.id][input.index];
    const addressingInfo = addressMap.get(utxo.receiver);
    if (addressingInfo == null) throw new Error(`${nameof(_transformToTrezorInputs)} should never happen`);
    verifyFromBip44Root(addressingInfo);
    return {
      path: toDerivationPathString(addressingInfo.addressing.path),
      prev_hash: input.id,
      prev_index: input.index,
      type: 0
    };
  });
}

function _generateTrezorOutputs(
  txOutputs: Array<TxOutType<number>>,
  changeAddr: Array<{| ...Address, ...Value, ...Addressing |}>,
): Array<CardanoOutput> {
  return txOutputs.map(txOutput => {
    const change = changeAddr.find(addr => addr.address === txOutput.address);
    if (change != null) {
      verifyFromBip44Root({ addressing: change.addressing });
      return {
        amount: txOutput.value.toString(),
        path: toDerivationPathString(change.addressing.path),
      };
    }
    return {
      address: txOutput.address,
      amount: txOutput.value.toString(),
    };
  });
}

// ==================== LEDGER ==================== //
/** Generate a payload for Ledger SignTx */
export async function createLedgerSignTxPayload(
  signRequest: BaseSignRequest<RustModule.WalletV2.Transaction>,
  getTxsBodiesForUTXOs: TxBodiesFunc,
): Promise<LedgerSignTxPayload> {
  const txJson = signRequest.unsignedTx.to_json();
  // Map inputs to UNIQUE tx hashes (there might be multiple inputs from the same tx)
  const txsHashes = [...new Set(txJson.inputs.map(x => x.id))];
  const txsBodiesMap = await getTxsBodiesForUTXOs({ txsHashes });

  const utxoMap = utxosToLookupMap(
    signRequest.senderUtxos.map(utxo => ({
      utxo_id: utxo.utxo_id,
      tx_hash: utxo.tx_hash,
      tx_index: utxo.tx_index,
      receiver: utxo.receiver,
      amount: utxo.amount,
    }))
  );

  // Inputs
  const ledgerInputs: Array<InputTypeUTxO> =
    _transformToLedgerInputs(
      txJson.inputs,
      new Map(signRequest.senderUtxos.map(utxo => [
        utxo.receiver,
        { addressing: utxo.addressing },
      ])),
      utxoMap,
      txsBodiesMap,
    );

  // Outputs
  const ledgerOutputs: Array<OutputTypeAddress | OutputTypeChange> =
    _transformToLedgerOutputs(
      txJson.outputs,
      signRequest.changeAddr,
    );

  return {
    inputs: ledgerInputs,
    outputs: ledgerOutputs,
  };
}

function _transformToLedgerInputs(
  inputs: Array<TxoPointerType>,
  addressMap: Map<string, Addressing>,
  utxoMap: UtxoLookupMap,
  txDataHexMap: { [key: string]:string, ... }
): Array<InputTypeUTxO> {
  return inputs.map(input => {
    const utxo = utxoMap[input.id][input.index];
    const addressingInfo = addressMap.get(utxo.receiver);
    if (addressingInfo == null) throw new Error(`${nameof(_transformToLedgerInputs)} should never happen`);
    verifyFromBip44Root(addressingInfo);
    return {
      txDataHex: txDataHexMap[input.id],
      outputIndex: input.index,
      path: addressingInfo.addressing.path,
    };
  });
}

function _transformToLedgerOutputs(
  txOutputs: Array<TxOutType<number>>,
  changeAddr: Array<{| ...Address, ...Value, ...Addressing |}>,
): Array<OutputTypeAddress | OutputTypeChange> {
  return txOutputs.map(txOutput => {
    const amountStr = txOutput.value.toString();
    const change = changeAddr.find(addr => addr.address === txOutput.address);
    if (change != null) {
      verifyFromBip44Root({ addressing: change.addressing });
      return {
        path: change.addressing.path,
        amountStr,
      };
    }

    return {
      address58: txOutput.address,
      amountStr,
    };
  });
}

export async function prepareAndBroadcastLedgerSignedTx(
  ledgerSignTxResp: LedgerSignTxResponse,
  unsignedTx: RustModule.WalletV2.Transaction,
  publicKey: RustModule.WalletV2.PublicKey,
  keyLevel: number,
  sendTx: SendFunc,
): Promise<PrepareAndBroadcastLedgerSignedTxResponse> {
  try {
    Logger.debug('hwTransactions::prepareAndBroadcastLedgerSignedTx: called');

    const unsignedTxJson = unsignedTx.to_json();
    Logger.debug(`hwTransactions::prepareAndBroadcastLedgerSignedTx unsignedTx: ${stringifyData(
      unsignedTxJson
    )}`);
    const finalizer = new RustModule.WalletV2.TransactionFinalized(unsignedTx);
    ledgerSignTxResp.witnesses.map((witness) => prepareWitness(
      finalizer,
      witness,
      publicKey,
      keyLevel,
    ));

    const signedTx = finalizer.finalize();
    const backendResponse = await sendTx({
      id: signedTx.id(),
      encodedTx: Buffer.from(signedTx.to_hex(), 'hex'),
    });
    Logger.debug('hwTransactions::prepareAndBroadcastLedgerSignedTx: success');

    return backendResponse;
  } catch (sendTxError) {
    Logger.error('hwTransactions::prepareAndBroadcastLedgerSignedTx error: ' + stringifyError(sendTxError));
    if (sendTxError instanceof InvalidWitnessError) {
      throw new InvalidWitnessError();
    } else {
      throw new SendTransactionError();
    }
  }
}

function prepareWitness(
  finalizer: RustModule.WalletV2.TransactionFinalized,
  ledgerWitness: Witness,
  publicKey: RustModule.WalletV2.PublicKey,
  keyLevel: number,
): void {
  let finalKey = publicKey;
  for (let i = keyLevel; i < ledgerWitness.path.length; i++) {
    finalKey = finalKey.derive(
      RustModule.WalletV2.DerivationScheme.v2(),
      ledgerWitness.path[i]
    );
  }

  const txSignature = RustModule.WalletV2.TransactionSignature.from_hex(
    ledgerWitness.witnessSignatureHex
  );

  const witness = RustModule.WalletV2.Witness.from_external(finalKey, txSignature);
  finalizer.add_witness(witness);
}
