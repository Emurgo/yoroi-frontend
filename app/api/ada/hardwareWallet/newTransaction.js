// @flow
import {
  Logger,
  stringifyError,
  stringifyData
} from '../../../utils/logging';
import type {
  AdaAddress,
  UTXO
} from '../adaTypes';
import type { UtxoLookupMap }  from '../lib/utils';
import { utxosToLookupMap, derivePathAsString }  from '../lib/utils';
import type {
  AdaAddressMap,
} from '../adaAddress';
import type {
  SendFunc,
  TxBodiesFunc
} from '../lib/state-fetch/types';
import {
  SendTransactionError,
  InvalidWitnessError,
} from '../errors';
import type {
  BroadcastTrezorSignedTxResponse,
  PrepareAndBroadcastLedgerSignedTxResponse
} from '..';
import type {
  TrezorInput,
  TrezorOutput,
  TrezorSignTxPayload,
  LedgerSignTxPayload,
} from '../../../domain/HWSignTx';
import type {
  BIP32Path,
  InputTypeUTxO,
  OutputTypeAddress,
  OutputTypeChange,
  SignTransactionResponse as LedgerSignTxResponse,
  Witness
} from '@cardano-foundation/ledgerjs-hw-app-cardano';
import { makeCardanoBIP44Path } from 'yoroi-extension-ledger-bridge';

import type { ConfigType } from '../../../../config/config-types';

import { RustModule } from '../lib/cardanoCrypto/rustLoader';

declare var CONFIG: ConfigType;

// ==================== TREZOR ==================== //
/** Generate a payload for Trezor SignTx */
export async function createTrezorSignTxPayload(
  addressesMap: AdaAddressMap,
  changeAddr: ?AdaAddress,
  senderUtxos: Array<UTXO>,
  unsignedTx: RustModule.Wallet.Transaction,
  getTxsBodiesForUTXOs: TxBodiesFunc,
): Promise<TrezorSignTxPayload> {
  const txJson: TransactionType = unsignedTx.to_json();

  const utxoMap = utxosToLookupMap(senderUtxos);

  // Inputs
  const trezorInputs = _transformToTrezorInputs(
    txJson.inputs,
    addressesMap,
    utxoMap
  );

  // Output
  const trezorOutputs = _generateTrezorOutputs(
    txJson.outputs,
    changeAddr
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
  signedTxHex: string,
  sendTx: SendFunc
): Promise<BroadcastTrezorSignedTxResponse> {
  Logger.debug('newTransaction::broadcastTrezorSignedTx: called');
  const signedTxBytes = Buffer.from(signedTxHex, 'hex');
  const signedTx = RustModule.Wallet.SignedTransaction.from_bytes(signedTxBytes);

  try {
    const body = { signedTx };
    const backendResponse = await sendTx(body);
    Logger.debug('newTransaction::broadcastTrezorSignedTx: success');

    return backendResponse;
  } catch (sendTxError) {
    Logger.error('newTransaction::broadcastTrezorSignedTx error: ' + stringifyError(sendTxError));
    if (sendTxError instanceof InvalidWitnessError) {
      throw new InvalidWitnessError();
    }
    throw new SendTransactionError();
  }
}

function _transformToTrezorInputs(
  inputs: Array<TxoPointerType>,
  addressMap: AdaAddressMap,
  utxoMap: UtxoLookupMap,
): Array<TrezorInput> {
  return inputs.map((input: TxoPointerType) => {
    const utxo = utxoMap[input.id][input.index];
    const addressInfo = addressMap[utxo.receiver];
    return {
      path: derivePathAsString(addressInfo.account, addressInfo.change, addressInfo.index),
      prev_hash: input.id,
      prev_index: input.index,
      type: 0
    };
  });
}

function _generateTrezorOutputs(
  txOutputs: Array<TxOutType>,
  changeAddr: ?AdaAddress,
): Array<TrezorOutput> {
  return txOutputs.map(txOutput => ({
    amount: txOutput.value.toString(),
    ..._outputAddressOrPath(txOutput, changeAddr)
  }));
}

function _outputAddressOrPath(
  txOutput: TxOutType,
  changeAddr: ?AdaAddress,
): { path: string } | { address: string } {
  if (changeAddr && txOutput.address === changeAddr.cadId) {
    return { path: derivePathAsString(changeAddr.account, changeAddr.change, changeAddr.index) };
  }

  return { address: txOutput.address };
}

// ==================== LEDGER ==================== //
/** Generate a payload for Ledger SignTx */
export async function createLedgerSignTxPayload(
  addressesMap: AdaAddressMap,
  changeAddr: ?AdaAddress,
  senderUtxos: Array<UTXO>,
  unsignedTx: RustModule.Wallet.Transaction,
  getTxsBodiesForUTXOs: TxBodiesFunc,
): Promise<LedgerSignTxPayload> {
  const txJson: TransactionType = unsignedTx.to_json();
  // Map inputs to UNIQUE tx hashes (there might be multiple inputs from the same tx)
  const txsHashes = [...new Set(txJson.inputs.map(x => x.id))];
  const txsBodiesMap = await getTxsBodiesForUTXOs({ txsHashes });

  const utxoMap = utxosToLookupMap(senderUtxos);

  // Inputs
  const ledgerInputs: Array<InputTypeUTxO> =
    _transformToLedgerInputs(
      txJson.inputs,
      addressesMap,
      utxoMap,
      txsBodiesMap,
    );

  // Outputs
  const ledgerOutputs: Array<OutputTypeAddress | OutputTypeChange> =
    _transformToLedgerOutputs(
      txJson.outputs,
      changeAddr,
    );

  return {
    inputs: ledgerInputs,
    outputs: ledgerOutputs,
  };
}

function _transformToLedgerInputs(
  inputs: Array<TxoPointerType>,
  addressMap: AdaAddressMap,
  utxoMap: UtxoLookupMap,
  txDataHexMap: {[key: string]:string}
): Array<InputTypeUTxO> {
  return inputs.map(input => {
    const utxo = utxoMap[input.id][input.index];
    const addressInfo = addressMap[utxo.receiver];
    return {
      txDataHex: txDataHexMap[input.id],
      outputIndex: input.index,
      path: makeCardanoBIP44Path(addressInfo.account, addressInfo.change, addressInfo.index),
    };
  });
}

function _transformToLedgerOutputs(
  txOutputs: Array<TxOutType>,
  changeAddr: ?AdaAddress,
): Array<OutputTypeAddress | OutputTypeChange> {
  return txOutputs.map(txOutput => ({
    amountStr: txOutput.value.toString(),
    ..._ledgerOutputAddress58OrPath(txOutput, changeAddr)
  }));
}

function _ledgerOutputAddress58OrPath(
  txOutput: TxOutType,
  changeAddr: ?AdaAddress,
): { address58: string } | { path: BIP32Path }  {
  if (changeAddr && txOutput.address === changeAddr.cadId) {
    return { path: makeCardanoBIP44Path(changeAddr.account, changeAddr.change, changeAddr.index) };
  }

  return { address58: txOutput.address };
}

export async function prepareAndBroadcastLedgerSignedTx(
  ledgerSignTxResp: LedgerSignTxResponse,
  unsignedTx: RustModule.Wallet.Transaction,
  cryptoAccount: RustModule.Wallet.Bip44AccountPublic,
  sendTx: SendFunc,
): Promise<PrepareAndBroadcastLedgerSignedTxResponse> {
  try {
    Logger.debug('newTransaction::prepareAndBroadcastLedgerSignedTx: called');

    const unsignedTxJson: TransactionType = unsignedTx.to_json();
    Logger.debug(`newTransaction::prepareAndBroadcastLedgerSignedTx unsignedTx: ${stringifyData(
      unsignedTxJson
    )}`);
    const finalizer = new RustModule.Wallet.TransactionFinalized(unsignedTx);
    ledgerSignTxResp.witnesses.map((witness) => prepareWitness(finalizer, witness, cryptoAccount));

    const backendResponse = await sendTx({ signedTx: finalizer.finalize() });
    Logger.debug('newTransaction::prepareAndBroadcastLedgerSignedTx: success');

    return backendResponse;
  } catch (sendTxError) {
    Logger.error('newTransaction::prepareAndBroadcastLedgerSignedTx error: ' + stringifyError(sendTxError));
    if (sendTxError instanceof InvalidWitnessError) {
      throw new InvalidWitnessError();
    } else {
      throw new SendTransactionError();
    }
  }
}

function prepareWitness(
  finalizer: RustModule.Wallet.TransactionFinalized,
  ledgerWitness: Witness,
  cryptoAccount: RustModule.Wallet.Bip44AccountPublic,
): void {
  const pubKey = cryptoAccount.address_key(
    ledgerWitness.path[3] === 1,
    RustModule.Wallet.AddressKeyIndex.new(ledgerWitness.path[4])
  );

  const txSignature = RustModule.Wallet.TransactionSignature.from_hex(
    ledgerWitness.witnessSignatureHex
  );

  const witness = RustModule.Wallet.Witness.from_external(pubKey, txSignature);
  finalizer.add_witness(witness);
}
