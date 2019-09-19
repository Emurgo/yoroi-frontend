// @flow

// Handles interfacing w/ lovefieldDB and rust-cardano to create transaction

import BigNumber from 'bignumber.js';
import {
  addressesToAddressMap,
} from '../lib/storage/adaAddress';
import type {
  AdaAddress,
  BaseSignRequest,
  UTXO,
  UnsignedTxFromUtxoResponse,
  UnsignedTxResponse,
} from '../adaTypes';
import {
  NotEnoughMoneyToSendError,
} from '../errors';
import type { ConfigType } from '../../../../config/config-types';
import type { AdaAddressMap } from '../lib/storage/adaAddress';
import { utxosToLookupMap, coinToBigNumber } from '../lib/utils';

import type { AddressUtxoFunc } from '../lib/state-fetch/types';

import { RustModule } from '../lib/cardanoCrypto/rustLoader';

declare var CONFIG: ConfigType;
const protocolMagic = CONFIG.network.protocolMagic;

export async function sendAllUnsignedTx(
  receiver: string,
  allInputAddresses: Array<AdaAddress>,
  getUTXOsForAddresses: AddressUtxoFunc
): Promise<UnsignedTxResponse> {
  const allUtxos = await getUTXOsForAddresses({
    addresses: allInputAddresses.map(addr => addr.cadId)
  });
  const unsignedTxResponse = await sendAllUnsignedTxFromUtxo(
    receiver,
    allUtxos
  );

  const addressesMap = addressesToAddressMap(allInputAddresses);

  return {
    ...unsignedTxResponse,
    addressesMap
  };
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
  if (totalBalance.isZero()) {
    throw new NotEnoughMoneyToSendError();
  }

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
  if (totalBalance.isLessThan(fee)) {
    throw new NotEnoughMoneyToSendError();
  }
  const newAmount = totalBalance.minus(fee).toString();
  const unsignedTxResponse = await newAdaUnsignedTxFromUtxo(receiver, newAmount, [], allUtxos);

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
  changeAdaAddr: Array<AdaAddress>,
  possibleInputAddresses: Array<AdaAddress>,
  getUTXOsForAddresses: AddressUtxoFunc
): Promise<UnsignedTxResponse> {
  const allUtxos = await getUTXOsForAddresses({
    addresses: possibleInputAddresses.map(addr => addr.cadId)
  });
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
  changeAdaAddr: Array<AdaAddress>,
  allUtxos: Array<UTXO>,
): Promise<UnsignedTxFromUtxoResponse> {
  const feeAlgorithm = RustModule.Wallet.LinearFeeAlgorithm.default();

  const txInputs = utxoToTxInput(allUtxos);

  let outputPolicy = null;
  let senderInputs;
  if (changeAdaAddr.length === 1) {
    /**
     * The current Rust code doesn't allow to separate input selection
     * from the chnage address output policy so we combinue it
     */
    const changeAddr = RustModule.Wallet.Address.from_base58(changeAdaAddr[0].cadId);
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
  } else if (changeAdaAddr.length === 0) {
    senderInputs = txInputs;
  } else {
    throw new Error('only support single change address');
  }

  const txBuilder = new RustModule.Wallet.TransactionBuilder();
  const changeAddrTxOut = await addTxIO(
    txBuilder, senderInputs, outputPolicy, feeAlgorithm, receiver, amount
  );
  const change = filterToUsedChange(changeAdaAddr, changeAddrTxOut);
  return {
    senderUtxos: filterUtxo(senderInputs, allUtxos),
    txBuilder,
    changeAddr: change,
  };
}

function filterToUsedChange(changeAdaAddr: Array<AdaAddress>, changeAddrTxOut: Array<TxOutType>) {
  const change = [];
  for (const txOut of changeAddrTxOut) {
    for (const adaAddr of changeAdaAddr) {
      if (txOut.address === adaAddr.cadId) {
        change.push({
          value: txOut.value,
          address: txOut.address,
          account: adaAddr.account,
          change: adaAddr.change,
          index: adaAddr.index,
        });
      }
    }
  }
  return change;
}

export function signTransaction(
  signRequest: BaseSignRequest,
  accountPrivateKey: RustModule.Wallet.Bip44AccountPrivate
): RustModule.Wallet.SignedTransaction {
  const { addressesMap, senderUtxos, unsignedTx } = signRequest;
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

function addTxIO(
  txBuilder: RustModule.Wallet.TransactionBuilder,
  senderInputs: Array<RustModule.Wallet.TxInput>,
  outputPolicy: ?RustModule.Wallet.OutputPolicy,
  feeAlgorithm: RustModule.Wallet.LinearFeeAlgorithm,
  receiver: string,
  amount: string,
): Array<TxOutType> {
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
  txFinalizer: RustModule.Wallet.TransactionFinalized,
  senderUtxos: Array<UTXO>,
  addressesMap: AdaAddressMap,
  accountPrivateKey: RustModule.Wallet.Bip44AccountPrivate,
): void {
  // get private keys
  const privateKeys = senderUtxos.map(utxo => {
    const addressInfo = addressesMap[utxo.receiver];
    const chain = accountPrivateKey.bip44_chain(
      addressInfo.change === 1
    );
    return chain.address_key(
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
