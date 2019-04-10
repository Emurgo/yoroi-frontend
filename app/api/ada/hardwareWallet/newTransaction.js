// @flow
import _ from 'lodash';

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
import { utxosToLookupMap }  from '../lib/utils';
import type {
  AdaAddressMap,
} from '../adaAddress';
import {
  sendTx,
  getTxsBodiesForUTXOs
} from '../lib/yoroi-backend-api';
import {
  SendTransactionError,
  InvalidWitnessError,
  GetTxsBodiesForUTXOsError
} from '../errors';
import type {
  BroadcastTrezorSignedTxResponse,
  PrepareAndBroadcastLedgerSignedTxResponse
} from '../../common';
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
import Config from '../../../config';
import { getSingleCryptoAccount } from '../adaLocalStorage';

import { RustModule } from '../lib/cardanoCrypto/rustLoader';

declare var CONFIG: ConfigType;

// ==================== TREZOR ==================== //
/** Generate a payload for Trezor SignTx */
export async function createTrezorSignTxPayload(
  addressesMap: AdaAddressMap,
  changeAddr: AdaAddress,
  senderUtxos: Array<UTXO>,
  unsignedTx: RustModule.Wallet.Transaction,
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
  const txsBodiesMap = await txsBodiesForInputs(txJson.inputs);
  const txsBodies = txJson.inputs.map((x) => txsBodiesMap[x.id]);

  return {
    inputs: trezorInputs,
    outputs: trezorOutputs,
    transactions: txsBodies,
    protocol_magic: CONFIG.network.protocolMagic,
  };
}

/** List of Body hashes for a list of utxos by batching backend requests */
export async function txsBodiesForInputs(
  inputs: Array<TxoPointerType>
): Promise<{[key: string]:string}> {
  if (!inputs) return {};
  try {

    // Map inputs to UNIQUE tx hashes (there might be multiple inputs from the same tx)
    const txsHashes = [...new Set(inputs.map(x => x.id))];

    // split up all txs into chunks of equal size
    const groupsOfTxsHashes = _.chunk(txsHashes, CONFIG.app.txsBodiesRequestSize);

    // convert chunks into list of Promises that call the backend-service
    const promises = groupsOfTxsHashes
      .map(groupOfTxsHashes => getTxsBodiesForUTXOs(groupOfTxsHashes));

    // Sum up all the utxo
    return Promise.all(promises)
      .then(groupsOfTxBodies => {
        const bodies = groupsOfTxBodies
          .reduce((acc, groupOfTxBodies) => Object.assign(acc, groupOfTxBodies), {});
        if (txsHashes.length !== Object.keys(bodies).length) {
          throw new GetTxsBodiesForUTXOsError();
        }
        return bodies;
      });
  } catch (getTxBodiesError) {
    Logger.error('newTransaction::txsBodiesForInputs error: ' +
      stringifyError(getTxBodiesError));
    throw new GetTxsBodiesForUTXOsError();
  }
}

/** Send a transaction and save the new change address */
export async function broadcastTrezorSignedTx(
  signedTxHex: string,
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

function _derivePathAsString(chain: number, addressIndex: number): string {
  // Assumes this is only for Cardano and Web Yoroi (only one account).
  return `${Config.wallets.BIP44_CARDANO_FIRST_ACCOUNT_SUB_PATH}/${chain}/${addressIndex}`;
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
      path: _derivePathAsString(addressInfo.change, addressInfo.index),
      prev_hash: input.id,
      prev_index: input.index,
      type: 0
    };
  });
}

function _generateTrezorOutputs(
  txOutputs: Array<TxOutType>,
  changeAddr: AdaAddress,
): Array<TrezorOutput> {
  return txOutputs.map(txOutput => ({
    amount: txOutput.value.toString(),
    ..._outputAddressOrPath(txOutput, changeAddr)
  }));
}

function _outputAddressOrPath(
  txOutput: TxOutType,
  changeAddr: AdaAddress,
): { path: string } | { address: string } {
  if (txOutput.address === changeAddr.cadId) {
    return { path: _derivePathAsString(changeAddr.change, changeAddr.index) };
  }

  return { address: txOutput.address };
}

// ==================== LEDGER ==================== //
/** Generate a payload for Ledger SignTx */
export async function createLedgerSignTxPayload(
  addressesMap: AdaAddressMap,
  changeAddr: AdaAddress,
  senderUtxos: Array<UTXO>,
  unsignedTx: RustModule.Wallet.Transaction,
): Promise<LedgerSignTxPayload> {
  const txJson: TransactionType = unsignedTx.to_json();
  const txDataHexMap = await txsBodiesForInputs(txJson.inputs);

  const utxoMap = utxosToLookupMap(senderUtxos);

  // Inputs
  const ledgerInputs: Array<InputTypeUTxO> =
    _transformToLedgerInputs(
      txJson.inputs,
      addressesMap,
      utxoMap,
      txDataHexMap,
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

function _derivePathAsBIP32Path(
  chain: number,
  addressIndex: number
): BIP32Path {
  // Assumes this is only for Cardano and Web Yoroi (only one account).
  return makeCardanoBIP44Path(0, chain, addressIndex);
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
      path: _derivePathAsBIP32Path(addressInfo.change, addressInfo.index),
    };
  });
}

function _transformToLedgerOutputs(
  txOutputs: Array<TxOutType>,
  changeAddr: AdaAddress,
): Array<OutputTypeAddress | OutputTypeChange> {
  return txOutputs.map(txOutput => ({
    amountStr: txOutput.value.toString(),
    ..._ledgerOutputAddress58OrPath(txOutput, changeAddr)
  }));
}

function _ledgerOutputAddress58OrPath(
  txOutput: TxOutType,
  changeAddr: AdaAddress,
): { address58: string } | { path: BIP32Path }  {
  if (txOutput.address === changeAddr.cadId) {
    return { path: _derivePathAsBIP32Path(changeAddr.change, changeAddr.index) };
  }

  return { address58: txOutput.address };
}

export async function prepareAndBroadcastLedgerSignedTx(
  ledgerSignTxResp: LedgerSignTxResponse,
  unsignedTx: RustModule.Wallet.Transaction,
): Promise<PrepareAndBroadcastLedgerSignedTxResponse> {
  try {
    Logger.debug('newTransaction::prepareAndBroadcastLedgerSignedTx: called');

    const unsignedTxJson: TransactionType = unsignedTx.to_json();
    Logger.debug(`newTransaction::prepareAndBroadcastLedgerSignedTx unsignedTx: ${stringifyData(
      unsignedTxJson
    )}`);
    const finalizer = new RustModule.Wallet.TransactionFinalized(unsignedTx);
    ledgerSignTxResp.witnesses.map((witness) => prepareWitness(finalizer, witness));

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
): void {
  const cryptoAccount = getSingleCryptoAccount();
  const pubKey = cryptoAccount.root_cached_key.address_key(
    ledgerWitness.path[3] === 1,
    RustModule.Wallet.AddressKeyIndex.new(ledgerWitness.path[4])
  );

  const txSignature = RustModule.Wallet.TransactionSignature.from_hex(
    ledgerWitness.witnessSignatureHex
  );

  const witness = RustModule.Wallet.Witness.from_external(pubKey, txSignature);
  finalizer.add_witness(witness);
}
