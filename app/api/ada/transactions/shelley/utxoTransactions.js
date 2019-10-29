// @flow

// Handles interfacing w/ rust-cardano to create transaction

import BigNumber from 'bignumber.js';
import type {
  V3UnsignedTxAddressedUtxoResponse,
  V3UnsignedTxUtxoResponse,
  AddressedUtxo,
} from '../types';
import type { RemoteUnspentOutput, } from '../../lib/state-fetch/types';
import {
  NotEnoughMoneyToSendError,
} from '../../errors';
import type { ConfigType } from '../../../../../config/config-types';

import { RustModule } from '../../lib/cardanoCrypto/rustLoader';

import {
  Bip44DerivationLevels,
} from '../../lib/storage/database/bip44/api/utils';
import type {
  Address, Value, Addressing,
} from '../../lib/storage/models/common/interfaces';
import type { IGetAllUtxosResponse } from '../../lib/storage/models/PublicDeriver/interfaces';
import { v2SkKeyToV3Key } from '../utils';

declare var CONFIG: ConfigType;

export function sendAllUnsignedTx(
  receiver: string,
  allUtxos: Array<AddressedUtxo>,
): V3UnsignedTxAddressedUtxoResponse {
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
        throw new Error('sendAllUnsignedTx utxo refernece was changed. Should not happen');
      }
      return addressedUtxo;
    }
  );

  return {
    senderUtxos: addressedUtxos,
    unsignedTx: unsignedTxResponse.unsignedTx,
    changeAddr: unsignedTxResponse.changeAddr,
  };
}

export function sendAllUnsignedTxFromUtxo(
  receiver: string,
  allUtxos: Array<RemoteUnspentOutput>,
): V3UnsignedTxUtxoResponse {
  const totalBalance = allUtxos
    .map(utxo => new BigNumber(utxo.amount))
    .reduce(
      (acc, amount) => acc.plus(amount),
      new BigNumber(0)
    );
  if (totalBalance.isZero()) {
    throw new NotEnoughMoneyToSendError();
  }

  const feeAlgorithm = RustModule.WalletV3.Fee.linear_fee(
    RustModule.WalletV3.Value.from_str(CONFIG.app.linearFee.constant),
    RustModule.WalletV3.Value.from_str(CONFIG.app.linearFee.coefficient),
    RustModule.WalletV3.Value.from_str(CONFIG.app.linearFee.certificate),
  );
  let fee;
  {
    // firts build a transaction to see what the cost would be
    const fakeTxBuilder = RustModule.WalletV3.TransactionBuilder.new_no_payload();
    for (const utxo of allUtxos) {
      const input = utxoToTxInput(utxo);
      fakeTxBuilder.add_input(input);
    }
    fakeTxBuilder.add_output(
      RustModule.WalletV3.Address.from_string(receiver),
      RustModule.WalletV3.Value.from_str(totalBalance.toString())
    );
    const feeValue = fakeTxBuilder.estimate_fee(feeAlgorithm);
    fee = new BigNumber(feeValue.to_str());
  }

  // create a new transaction subtracing the fee from your total UTXO
  if (totalBalance.isLessThan(fee)) {
    throw new NotEnoughMoneyToSendError();
  }
  const newAmount = totalBalance.minus(fee).toString();
  const unsignedTxResponse = newAdaUnsignedTxFromUtxo(receiver, newAmount, [], allUtxos);
  return unsignedTxResponse;
}

export function newAdaUnsignedTx(
  receiver: string,
  amount: string,
  changeAdaAddr: Array<{| ...Address, ...Addressing |}>,
  allUtxos: Array<AddressedUtxo>,
): V3UnsignedTxAddressedUtxoResponse {
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
        throw new Error('newAdaUnsignedTx utxo refernece was changed. Should not happen');
      }
      return addressedUtxo;
    }
  );

  return {
    senderUtxos: addressedUtxos,
    unsignedTx: unsignedTxResponse.unsignedTx,
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
  changeAddresses: Array<{| ...Address, ...Addressing |}>,
  allUtxos: Array<RemoteUnspentOutput>,
): V3UnsignedTxUtxoResponse {
  const feeAlgorithm = RustModule.WalletV3.Fee.linear_fee(
    RustModule.WalletV3.Value.from_str(CONFIG.app.linearFee.constant),
    RustModule.WalletV3.Value.from_str(CONFIG.app.linearFee.coefficient),
    RustModule.WalletV3.Value.from_str(CONFIG.app.linearFee.certificate),
  );

  const txBuilder = RustModule.WalletV3.TransactionBuilder.new_no_payload();
  txBuilder.add_output(
    RustModule.WalletV3.Address.from_string(receiver),
    RustModule.WalletV3.Value.from_str(amount)
  );
  const selectedUtxos = firstMatchFirstInputSelection(
    txBuilder,
    allUtxos,
    feeAlgorithm
  );
  let transaction;
  const change = [];
  if (changeAddresses.length === 1) {
    const changeAddr = changeAddresses[0];

    /**
     * Note: The balance of the transaction may be slightly positive.
     * This is because the fee of adding a change address
     * may be more expensive than the amount leftover
     * In this case we don't add a change address
     */
    transaction = txBuilder.seal_with_output_policy(
      feeAlgorithm,
      RustModule.WalletV3.OutputPolicy.one(
        RustModule.WalletV3.Address.from_string(changeAddr.address)
      )
    );
    change.push(...filterToUsedChange(
      changeAddr,
      transaction.outputs(),
      selectedUtxos
    ));
  } else if (changeAddresses.length === 0) {
    transaction = txBuilder.seal_with_output_policy(
      feeAlgorithm,
      RustModule.WalletV3.OutputPolicy.forget()
    );
  } else {
    throw new Error('only support single change address');
  }

  return {
    senderUtxos: selectedUtxos,
    unsignedTx: transaction,
    changeAddr: change,
  };
}

function firstMatchFirstInputSelection(
  txBuilder: RustModule.WalletV3.TransactionBuilder,
  allUtxos: Array<RemoteUnspentOutput>,
  feeAlgorithm: RustModule.WalletV3.Fee,
): Array<RemoteUnspentOutput> {
  const selectedOutputs = [];
  if (allUtxos.length === 0) {
    throw new NotEnoughMoneyToSendError();
  }
  // add UTXOs in whatever order they're sorted until we have enough for amount+fee
  for (let i = 0; i < allUtxos.length; i++) {
    selectedOutputs.push(allUtxos[i]);
    txBuilder.add_input(utxoToTxInput(allUtxos[i]));
    const txBalance = txBuilder.get_balance(feeAlgorithm);
    if (!txBalance.is_negative()) {
      break;
    }
    if (i === allUtxos.length - 1) {
      throw new NotEnoughMoneyToSendError();
    }
  }
  return selectedOutputs;
}

/**
 * WASM doesn't explicitly tell us how much Ada will be sent to the change address
 * so instead, we iterate over all outputs of a transaction
 * and figure out which one was not added by us (therefore must have been added as change)
 */
function filterToUsedChange(
  changeAddr: {| ...Address, ...Addressing |},
  outputs: RustModule.WalletV3.Outputs,
  selectedUtxos: Array<RemoteUnspentOutput>,
): Array<{| ...Address, ...Value, ...Addressing |}> {
  // we should never have the change address also be an input
  // but we handle this edge case just in case
  const possibleDuplicates = selectedUtxos.filter(utxo => utxo.receiver === changeAddr.address);

  const change = [];
  for (let i = 0; i < outputs.size(); i++) {
    const output = outputs.get(i);
    // we can't know which bech32 prefix was used
    // so we instead assume the suffix must match
    const suffix = output.address().to_string('dummy').slice('dummy'.length);
    const val = output.value().to_str();
    if (changeAddr.address.endsWith(suffix)) {
      const indexInInput = possibleDuplicates.findIndex(
        utxo => utxo.amount === val
      );
      if (indexInInput === -1) {
        change.push({
          ...changeAddr,
          value: new BigNumber(val),
        });
      }
      // remove the duplicate and keep searching
      possibleDuplicates.splice(indexInInput, 1);
    }
  }
  // note: if no element found, the no change was needed (tx was perfectly balanced)
  return change;
}

export function signTransaction(
  signRequest: V3UnsignedTxAddressedUtxoResponse,
  keyLevel: number,
  signingKey: RustModule.WalletV2.PrivateKey
): RustModule.WalletV3.AuthenticatedTransaction {
  const { senderUtxos, unsignedTx } = signRequest;
  const txFinalizer = new RustModule.WalletV3.TransactionFinalizer(unsignedTx);
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
  utxo: RemoteUnspentOutput,
): RustModule.WalletV3.Input {
  const txoPointer = RustModule.WalletV3.UtxoPointer.new(
    RustModule.WalletV3.FragmentId.from_bytes(
      Buffer.from(utxo.tx_hash, 'hex')
    ),
    utxo.tx_index,
    RustModule.WalletV3.Value.from_str(utxo.amount),
  );
  return RustModule.WalletV3.Input.from_utxo(txoPointer);
}

function addWitnesses(
  txFinalizer: RustModule.WalletV3.TransactionFinalizer,
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

  for (let i = 0; i < senderUtxos.length; i++) {
    const witness = RustModule.WalletV3.Witness.for_utxo(
      RustModule.WalletV3.Hash.from_hex(CONFIG.app.genesisHash),
      txFinalizer.get_txid(),
      v2SkKeyToV3Key(privateKeys[i]),
    );
    txFinalizer.set_witness(i, witness);
  }
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
