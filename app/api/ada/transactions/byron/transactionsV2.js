// @flow

// Handles interfacing w/ rust-cardano to create transaction

import BigNumber from 'bignumber.js';
import type {
  BaseSignRequest,
  UnsignedTxFromUtxoResponse,
  UnsignedTxResponse,
  AddressedUtxo,
} from '../types';
import type { RemoteUnspentOutput, } from '../../lib/state-fetch/types';
import {
  NotEnoughMoneyToSendError,
} from '../../errors';
import type { ConfigType } from '../../../../../config/config-types';
import { utxosToLookupMap, } from '../utils';
import { coinToBigNumber } from './utils';

import { RustModule } from '../../lib/cardanoCrypto/rustLoader';

import {
  Bip44DerivationLevels,
} from '../../lib/storage/database/walletTypes/bip44/api/utils';
import type {
  Address, Value, Addressing,
  IGetAllUtxosResponse
} from '../../lib/storage/models/PublicDeriver/interfaces';

declare var CONFIG: ConfigType;
const protocolMagic = CONFIG.network.protocolMagic;

export function sendAllUnsignedTx(
  receiver: string,
  allUtxos: Array<AddressedUtxo>,
): UnsignedTxResponse {
  const addressingMap = new Map<RemoteUnspentOutput, AddressedUtxo>();
  for (const utxo of allUtxos) {
    addressingMap.set({
      amount: utxo.amount,
      receiver: utxo.receiver,
      tx_hash: utxo.tx_hash,
      tx_index: utxo.tx_index,
      utxo_id: utxo.utxo_id
    }, utxo);
  }
  const unsignedTxResponse = sendAllUnsignedTxFromUtxo(
    receiver,
    Array.from(addressingMap.keys())
  );

  const addressedUtxos = unsignedTxResponse.senderUtxos.map(
    utxo => {
      const addressedUtxo = addressingMap.get(utxo);
      if (addressedUtxo == null) {
        throw new Error('sendAllUnsignedTx utxo reference was changed. Should not happen');
      }
      return addressedUtxo;
    }
  );

  return {
    senderUtxos: addressedUtxos,
    txBuilder: unsignedTxResponse.txBuilder,
    changeAddr: unsignedTxResponse.changeAddr,
  };
}

export function sendAllUnsignedTxFromUtxo(
  receiver: string,
  allUtxos: Array<RemoteUnspentOutput>,
): UnsignedTxFromUtxoResponse {
  const totalBalance = allUtxos
    .map(utxo => new BigNumber(utxo.amount))
    .reduce(
      (acc, amount) => acc.plus(amount),
      new BigNumber(0)
    );
  if (totalBalance.isZero()) {
    throw new NotEnoughMoneyToSendError();
  }

  const feeAlgorithm = RustModule.WalletV2.LinearFeeAlgorithm.default();
  let fee;
  {
    // first build a transaction to see what the cost would be
    const fakeTxBuilder = new RustModule.WalletV2.TransactionBuilder();
    const inputs = utxoToTxInput(allUtxos);
    addTxInputs(fakeTxBuilder, inputs);
    const inputAmount = coinToBigNumber(fakeTxBuilder.get_input_total());
    addOutput(fakeTxBuilder, receiver, inputAmount.toString());
    fee = coinToBigNumber(fakeTxBuilder.estimate_fee(feeAlgorithm));
  }

  // create a new transaction subtracting the fee from your total UTXO
  if (totalBalance.isLessThan(fee)) {
    throw new NotEnoughMoneyToSendError();
  }
  const newAmount = totalBalance.minus(fee).toString();
  const unsignedTxResponse = newAdaUnsignedTxFromUtxo(receiver, newAmount, [], allUtxos);

  // sanity check
  const balance = unsignedTxResponse.txBuilder.get_balance(feeAlgorithm);
  /**
   * The balance may be slightly positive. This is because lowering the "amount" to send
   * May reduce the amount of bytes required for the "amount", causing the fee to also drop
   *
   * Therefore we throw an error when the balance is negative, not when strictly equal to 0
   */
  if (balance.is_negative()) {
    throw new NotEnoughMoneyToSendError();
  }

  return unsignedTxResponse;
}

/**
 * we send all UTXO associated with an address.
 * This maximizes privacy.
 * The address will not be part of the input if it has no UTXO in it
 */
export function newAdaUnsignedTx(
  receiver: string,
  amount: string,
  changeAdaAddr: Array<{| ...Address, ...Addressing |}>,
  allUtxos: Array<AddressedUtxo>,
): UnsignedTxResponse {
  const addressingMap = new Map<RemoteUnspentOutput, AddressedUtxo>();
  for (const utxo of allUtxos) {
    addressingMap.set({
      amount: utxo.amount,
      receiver: utxo.receiver,
      tx_hash: utxo.tx_hash,
      tx_index: utxo.tx_index,
      utxo_id: utxo.utxo_id
    }, utxo);
  }
  const unsignedTxResponse = newAdaUnsignedTxFromUtxo(
    receiver,
    amount,
    changeAdaAddr,
    Array.from(addressingMap.keys())
  );

  const addressedUtxos = unsignedTxResponse.senderUtxos.map(
    utxo => {
      const addressedUtxo = addressingMap.get(utxo);
      if (addressedUtxo == null) {
        throw new Error('newAdaUnsignedTx utxo reference was changed. Should not happen');
      }
      return addressedUtxo;
    }
  );

  return {
    senderUtxos: addressedUtxos,
    txBuilder: unsignedTxResponse.txBuilder,
    changeAddr: unsignedTxResponse.changeAddr,
  };
}

/**
 * This function operates on UTXOs without a way to generate the private key for them
 * Private key needs to be added afterwards either through
 * A) Addressing
 * B) Having the key provided externally
 */
export function newAdaUnsignedTxFromUtxo(
  receiver: string,
  amount: string,
  changeAdaAddr: Array<{| ...Address, ...Addressing |}>,
  allUtxos: Array<RemoteUnspentOutput>,
): UnsignedTxFromUtxoResponse {
  const feeAlgorithm = RustModule.WalletV2.LinearFeeAlgorithm.default();

  const txInputs = utxoToTxInput(allUtxos);

  let outputPolicy = null;
  let senderInputs;
  if (changeAdaAddr.length === 1) {
    /**
     * The current Rust code doesn't allow to separate input selection
     * from the chnage address output policy so we combinue it
     */
    const changeAddr = RustModule.WalletV2.Address.from_base58(changeAdaAddr[0].address);
    outputPolicy = RustModule.WalletV2.OutputPolicy.change_to_one_address(changeAddr);

    let selectionResult;
    try {
      selectionResult = getInputSelection(txInputs, outputPolicy, feeAlgorithm, receiver, amount);
    } catch (err) {
      throw new NotEnoughMoneyToSendError();
    }
    senderInputs = txInputs.filter(input => (
      selectionResult.is_input(
        RustModule.WalletV2.TxoPointer.from_json(input.to_json().ptr)
      )
    ));
  } else if (changeAdaAddr.length === 0) {
    senderInputs = txInputs;
  } else {
    throw new Error('only support single change address');
  }

  const txBuilder = new RustModule.WalletV2.TransactionBuilder();
  const changeAddrTxOut = addTxIO(
    txBuilder, senderInputs, outputPolicy, feeAlgorithm, receiver, amount
  );
  const change = filterToUsedChange(changeAdaAddr, changeAddrTxOut);
  return {
    senderUtxos: filterUtxo(senderInputs, allUtxos),
    txBuilder,
    changeAddr: change,
  };
}

function filterToUsedChange(
  changeAdaAddr: Array<{| ...Address, ...Addressing |}>,
  changeAddrTxOut: Array<TxOutType<string>>
): Array<{| ...Address, ...Value, ...Addressing |}> {
  const change = [];
  for (const txOut of changeAddrTxOut) {
    for (const adaAddr of changeAdaAddr) {
      if (txOut.address === adaAddr.address) {
        change.push({
          value: new BigNumber(txOut.value),
          ...adaAddr,
        });
      }
    }
  }
  return change;
}

export function signTransaction(
  signRequest: BaseSignRequest<RustModule.WalletV2.Transaction>,
  keyLevel: number,
  signingKey: RustModule.WalletV2.PrivateKey
): RustModule.WalletV2.SignedTransaction {
  const { senderUtxos, unsignedTx } = signRequest;
  const txFinalizer = new RustModule.WalletV2.TransactionFinalized(unsignedTx);
  addWitnesses(
    txFinalizer,
    senderUtxos,
    keyLevel,
    signingKey
  );
  const signedTx = txFinalizer.finalize();
  return signedTx;
}

function utxoToTxInput(
  utxos: Array<RemoteUnspentOutput>,
): Array<RustModule.WalletV2.TxInput> {
  return utxos.map(utxo => {
    const txoPointer = RustModule.WalletV2.TxoPointer.new(
      RustModule.WalletV2.TransactionId.from_hex(utxo.tx_hash),
      utxo.tx_index
    );
    const txOut = RustModule.WalletV2.TxOut.new(
      RustModule.WalletV2.Address.from_base58(utxo.receiver),
      RustModule.WalletV2.Coin.from_str(utxo.amount),
    );
    return RustModule.WalletV2.TxInput.new(txoPointer, txOut);
  });
}

function filterUtxo(
  inputs: Array<RustModule.WalletV2.TxInput>,
  utxos: Array<RemoteUnspentOutput>,
): Array<RemoteUnspentOutput> {
  const lookupMap = utxosToLookupMap(utxos);

  return inputs.map(input => {
    const txoPointer = input.to_json().ptr;
    return lookupMap[txoPointer.id][txoPointer.index];
  });
}

function getInputSelection(
  allInputs: Array<RustModule.WalletV2.TxInput>,
  outputPolicy: RustModule.WalletV2.OutputPolicy,
  feeAlgorithm: RustModule.WalletV2.LinearFeeAlgorithm,
  receiver: string,
  amount: string,
): RustModule.WalletV2.InputSelectionResult {
  const inputSelection = RustModule.WalletV2.InputSelectionBuilder.first_match_first();
  allInputs.forEach(input => inputSelection.add_input(input));
  addOutput(inputSelection, receiver, amount);
  return inputSelection.select_inputs(feeAlgorithm, outputPolicy);
}

function addTxIO(
  txBuilder: RustModule.WalletV2.TransactionBuilder,
  senderInputs: Array<RustModule.WalletV2.TxInput>,
  outputPolicy: ?RustModule.WalletV2.OutputPolicy,
  feeAlgorithm: RustModule.WalletV2.LinearFeeAlgorithm,
  receiver: string,
  amount: string,
): Array<TxOutType<string>> {
  addTxInputs(txBuilder, senderInputs);
  addOutput(txBuilder, receiver, amount);

  if (outputPolicy) {
    try {
      return txBuilder.apply_output_policy(
        feeAlgorithm,
        outputPolicy
      );
    } catch (err) {
      throw new NotEnoughMoneyToSendError();
    }
  }

  const balance = txBuilder.get_balance(feeAlgorithm);
  if (balance.is_negative()) {
    throw new NotEnoughMoneyToSendError();
  }
  return [];
}

function addWitnesses(
  txFinalizer: RustModule.WalletV2.TransactionFinalized,
  senderUtxos: Array<AddressedUtxo>,
  keyLevel: number,
  signingKey: RustModule.WalletV2.PrivateKey
): void {
  // get private keys
  const privateKeys = senderUtxos.map(utxo => {
    const lastLevelSpecified = utxo.addressing.startLevel + utxo.addressing.path.length - 1;
    if (lastLevelSpecified !== Bip44DerivationLevels.ADDRESS.level) {
      throw new Error('addWitnesses incorrect addressing size');
    }
    if (keyLevel + 1 < utxo.addressing.startLevel) {
      throw new Error('addWitnesses keyLevel < startLevel');
    }
    let key = signingKey;
    for (let i = keyLevel - utxo.addressing.startLevel + 1; i < utxo.addressing.path.length; i++) {
      key = key.derive(
        RustModule.WalletV2.DerivationScheme.v2(),
        utxo.addressing.path[i]
      );
    }
    return key;
  });

  // sign the transactions
  const setting = RustModule.WalletV2.BlockchainSettings.from_json({
    protocol_magic: protocolMagic
  });
  for (let i = 0; i < senderUtxos.length; i++) {
    const witness = RustModule.WalletV2.Witness.new_extended_key(
      setting,
      privateKeys[i],
      txFinalizer.id()
    );
    txFinalizer.add_witness(witness);
  }
}

export function addTxInputs(
  txBuilder: RustModule.WalletV2.TransactionBuilder,
  senderInputs: Array<RustModule.WalletV2.TxInput>,
): void {
  senderInputs.forEach(input => {
    const jsonInput = input.to_json();
    txBuilder.add_input(
      RustModule.WalletV2.TxoPointer.from_json(jsonInput.ptr),
      RustModule.WalletV2.Coin.from_str(jsonInput.value.value)
    );
  });
}

export function addOutput(
  builder: RustModule.WalletV2.TransactionBuilder | RustModule.WalletV2.InputSelectionBuilder,
  address: string,
  value: string, // in lovelaces
): void {
  const txOut = RustModule.WalletV2.TxOut.new(
    RustModule.WalletV2.Address.from_base58(address),
    RustModule.WalletV2.Coin.from_str(value),
  );
  builder.add_output(txOut);
}

export function asAddressedUtxo(
  utxos: IGetAllUtxosResponse,
): Array<AddressedUtxo> {
  return utxos.map(utxo => {
    return {
      amount: utxo.output.UtxoTransactionOutput.Amount,
      receiver: utxo.address,
      tx_hash: utxo.output.Transaction.Hash,
      tx_index: utxo.output.UtxoTransactionOutput.OutputIndex,
      utxo_id: utxo.output.Transaction.Hash + utxo.output.UtxoTransactionOutput.OutputIndex,
      addressing: utxo.addressing,
    };
  });
}
