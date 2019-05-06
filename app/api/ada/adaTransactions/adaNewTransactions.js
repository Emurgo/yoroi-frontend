// @flow

// Handles interfacing w/ lovefieldDB and rust-cardano to create transaction

import BigNumber from 'bignumber.js';
import {
  addressesToAddressMap,
} from '../adaAddress';
import type {
  AdaAddress,
  AdaFeeEstimateResponse,
  UTXO,
  UnsignedTxFromUtxoResponse,
  UnsignedTxResponse,
} from '../adaTypes';
import {
  NotEnoughMoneyToSendError,
} from '../errors';
import type { ConfigType } from '../../../../config/config-types';
import type { AdaAddressMap } from '../adaAddress';
import { utxosToLookupMap, coinToBigNumber } from '../lib/utils';

import { RustModule } from '../lib/cardanoCrypto/rustLoader';

declare var CONFIG: ConfigType;
const protocolMagic = CONFIG.network.protocolMagic;

/** Calculate the transaction fee without actually sending the transaction */
export async function getAdaTransactionFee(
  receiver: string,
  amount: string,
  changeAdaAddr: ?AdaAddress,
  possibleInputAddresses: Array<AdaAddress>,
  addressesToUtxos: Array<string> => Promise<Array<UTXO>>
): Promise<AdaFeeEstimateResponse> {
  const { txBuilder } = await newAdaUnsignedTx(
    receiver,
    amount,
    changeAdaAddr,
    possibleInputAddresses,
    addressesToUtxos
  );
  /**
   * Note: get_balance_without_fees() != estimated fee
   *
   * Imagine you send a transaction with 1000 ADA input, 1 ADA output (no change)
   * Your fee is very small, but the difference between the input & output is high
   *
   * Therefore we instead display input - output as the fee in Yoroi
   * This is safer and gives a more consistent UI
   */
  const fee = txBuilder.get_balance_without_fees().value();
  return { fee };
}

export async function sendAllUnsignedTxFromUtxo(
  receiver: string,
  allUtxos: Array<UTXO>,
): Promise<UnsignedTxFromUtxoResponse> {
  const totalBalance = allUtxos
    .map(utxo => new BigNumber(utxo.amount))
    .reduce(
      (acc, amount) => acc.plus(amount),
      new BigNumber(0)
    );

  const feeAlgorithm = RustModule.Wallet.LinearFeeAlgorithm.default();
  let fee;
  {
    // firts build a transaction to see what the cost would be
    const fakeTxBuilder = new RustModule.Wallet.TransactionBuilder();
    const inputs = utxoToTxInput(allUtxos);
    addTxInputs(fakeTxBuilder, inputs);
    const inputAmount = coinToBigNumber(fakeTxBuilder.get_input_total());
    addOutput(fakeTxBuilder, receiver, inputAmount.toString());
    fee = coinToBigNumber(fakeTxBuilder.estimate_fee(feeAlgorithm));
  }

  // create a new transaction subtracing the fee from your total UTXO
  const newAmount = totalBalance.minus(fee);
  const unsignedTxResponse = await newAdaUnsignedTxFromUtxo(receiver, newAmount, null, allUtxos);

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
 * @param {*} possibleInputAddresses we send all UTXO associated with an address.
 * This maximizes privacy.
 * The address will not be part of the input if it has no UTXO in it
 */
export async function newAdaUnsignedTx(
  receiver: string,
  amount: string,
  changeAdaAddr: ?AdaAddress,
  possibleInputAddresses: Array<AdaAddress>,
  addressesToUtxos: Array<string> => Promise<Array<UTXO>>
): Promise<UnsignedTxResponse> {
  const allUtxos = await addressesToUtxos(possibleInputAddresses.map(addr => addr.cadId));
  const unsignedTxResponse = await newAdaUnsignedTxFromUtxo(
    receiver,
    amount,
    changeAdaAddr,
    allUtxos
  );

  const usedAddressSet = new Set(unsignedTxResponse.senderUtxos.map(utxo => utxo.receiver));
  const usedAdaAddresses = possibleInputAddresses.filter(
    adaAddress => usedAddressSet.has(adaAddress.cadId)
  );

  const addressesMap = addressesToAddressMap(usedAdaAddresses);

  return {
    ...unsignedTxResponse,
    addressesMap
  };
}

export async function newAdaUnsignedTxFromUtxo(
  receiver: string,
  amount: string,
  changeAdaAddr: ?AdaAddress,
  allUtxos: Array<UTXO>,
): Promise<UnsignedTxFromUtxoResponse> {
  const feeAlgorithm = RustModule.Wallet.LinearFeeAlgorithm.default();

  const txInputs = utxoToTxInput(allUtxos);

  let outputPolicy = null;
  let senderInputs;
  if (changeAdaAddr) {
    /**
     * The current Rust code doesn't allow to separate input selection
     * from the chnage address output policy so we combinue it
     */
    const changeAddr = RustModule.Wallet.Address.from_base58(changeAdaAddr.cadId);
    outputPolicy = RustModule.Wallet.OutputPolicy.change_to_one_address(changeAddr);

    let selectionResult;
    try {
      selectionResult = getInputSelection(txInputs, outputPolicy, feeAlgorithm, receiver, amount);
    } catch (err) {
      throw new NotEnoughMoneyToSendError();
    }
    senderInputs = txInputs.filter(input => (
      selectionResult.is_input(
        RustModule.Wallet.TxoPointer.from_json(input.to_json().ptr)
      )
    ));
  } else {
    senderInputs = txInputs;
  }

  const txBuilder = new RustModule.Wallet.TransactionBuilder();
  await addTxIO(txBuilder, senderInputs, outputPolicy, feeAlgorithm, receiver, amount);
  return {
    senderUtxos: filterUtxo(senderInputs, allUtxos),
    txBuilder,
  };
}

export function signTransaction(
  unsignedTxResponse: UnsignedTxResponse,
  accountPrivateKey: RustModule.Wallet.Bip44AccountPrivate
): RustModule.Wallet.SignedTransaction {
  const { addressesMap, senderUtxos, txBuilder } = unsignedTxResponse;
  const unsignedTx = txBuilder.make_transaction();
  const txFinalizer = new RustModule.Wallet.TransactionFinalized(unsignedTx);
  addWitnesses(
    txFinalizer,
    senderUtxos,
    addressesMap,
    accountPrivateKey
  );
  const signedTx = txFinalizer.finalize();
  return signedTx;
}

export function utxoToTxInput(
  utxos: Array<UTXO>,
): Array<RustModule.Wallet.TxInput> {
  return utxos.map(utxo => {
    const txoPointer = RustModule.Wallet.TxoPointer.new(
      RustModule.Wallet.TransactionId.from_hex(utxo.tx_hash),
      utxo.tx_index
    );
    const txOut = RustModule.Wallet.TxOut.new(
      RustModule.Wallet.Address.from_base58(utxo.receiver),
      RustModule.Wallet.Coin.from_str(utxo.amount),
    );
    return RustModule.Wallet.TxInput.new(txoPointer, txOut);
  });
}

function filterUtxo(
  inputs: Array<RustModule.Wallet.TxInput>,
  utxos: Array<UTXO>,
): Array<UTXO> {
  const lookupMap = utxosToLookupMap(utxos);

  return inputs.map(input => {
    const txoPointer = input.to_json().ptr;
    return lookupMap[txoPointer.id][txoPointer.index];
  });
}

function getInputSelection(
  allInputs: Array<RustModule.Wallet.TxInput>,
  outputPolicy: RustModule.Wallet.OutputPolicy,
  feeAlgorithm: RustModule.Wallet.LinearFeeAlgorithm,
  receiver: string,
  amount: string,
): RustModule.Wallet.InputSelectionResult {
  const inputSelection = RustModule.Wallet.InputSelectionBuilder.first_match_first();
  allInputs.forEach(input => inputSelection.add_input(input));
  addOutput(inputSelection, receiver, amount);
  return inputSelection.select_inputs(feeAlgorithm, outputPolicy);
}

async function addTxIO(
  txBuilder: RustModule.Wallet.TransactionBuilder,
  senderInputs: Array<RustModule.Wallet.TxInput>,
  outputPolicy: ?RustModule.Wallet.OutputPolicy,
  feeAlgorithm: RustModule.Wallet.LinearFeeAlgorithm,
  receiver: string,
  amount: string,
): Promise<void> {
  addTxInputs(txBuilder, senderInputs);
  addOutput(txBuilder, receiver, amount);

  if (outputPolicy) {
    try {
      txBuilder.apply_output_policy(
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
}

function addWitnesses(
  txFinalizer: RustModule.Wallet.TransactionFinalized,
  senderUtxos: Array<UTXO>,
  addressesMap: AdaAddressMap,
  accountPrivateKey: RustModule.Wallet.Bip44AccountPrivate,
): void {
  // get private keys
  const privateKeys = senderUtxos.map(utxo => {
    const addressInfo = addressesMap[utxo.receiver];
    return accountPrivateKey.address_key(
      addressInfo.change === 1, // is internal
      RustModule.Wallet.AddressKeyIndex.new(addressInfo.index)
    );
  });

  // sign the transactions
  const setting = RustModule.Wallet.BlockchainSettings.from_json({
    protocol_magic: protocolMagic
  });
  for (let i = 0; i < senderUtxos.length; i++) {
    const witness = RustModule.Wallet.Witness.new_extended_key(
      setting,
      privateKeys[i],
      txFinalizer.id()
    );
    txFinalizer.add_witness(witness);
  }
}

export function addTxInputs(
  txBuilder: RustModule.Wallet.TransactionBuilder,
  senderInputs: Array<RustModule.Wallet.TxInput>,
): void {
  senderInputs.forEach(input => {
    const jsonInput = input.to_json();
    txBuilder.add_input(
      RustModule.Wallet.TxoPointer.from_json(jsonInput.ptr),
      RustModule.Wallet.Coin.from_str(jsonInput.value.value)
    );
  });
}

export function addOutput(
  builder: RustModule.Wallet.TransactionBuilder | RustModule.Wallet.InputSelectionBuilder,
  address: string,
  value: string, // in lovelaces
): void {
  const txOut = RustModule.Wallet.TxOut.new(
    RustModule.Wallet.Address.from_base58(address),
    RustModule.Wallet.Coin.from_str(value),
  );
  builder.add_output(txOut);
}
