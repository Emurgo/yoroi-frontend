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
} from '../../lib/storage/database/walletTypes/bip44/api/utils';
import type {
  Address, Value, Addressing,
  IGetAllUtxosResponse
} from '../../lib/storage/models/PublicDeriver/interfaces';

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
    IOs: unsignedTxResponse.IOs,
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
    const fakeIOBuilder = RustModule.WalletV3.InputOutputBuilder.empty();
    for (const utxo of allUtxos) {
      const input = utxoToTxInput(utxo);
      fakeIOBuilder.add_input(input);
    }
    fakeIOBuilder.add_output(
      RustModule.WalletV3.Address.from_string(receiver),
      RustModule.WalletV3.Value.from_str(totalBalance.toString())
    );
    const feeValue = fakeIOBuilder.estimate_fee(
      feeAlgorithm,
      // can't add a certificate to a UTXO transaction
      RustModule.WalletV3.Payload.no_payload()
    ).to_str();
    fee = new BigNumber(feeValue);
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
    IOs: unsignedTxResponse.IOs,
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

  const ioBuilder = RustModule.WalletV3.InputOutputBuilder.empty();
  ioBuilder.add_output(
    RustModule.WalletV3.Address.from_string(receiver),
    RustModule.WalletV3.Value.from_str(amount)
  );
  // can't add a certificate to a UTXO transaction
  const payload = RustModule.WalletV3.Payload.no_payload();

  const selectedUtxos = firstMatchFirstInputSelection(
    ioBuilder,
    allUtxos,
    feeAlgorithm,
    payload,
  );
  let IOs;
  const change = [];
  if (changeAddresses.length === 1) {
    const changeAddr = changeAddresses[0];

    /**
     * Note: The balance of the transaction may be slightly positive.
     * This is because the fee of adding a change address
     * may be more expensive than the amount leftover
     * In this case we don't add a change address
     */
    IOs = ioBuilder.seal_with_output_policy(
      payload,
      feeAlgorithm,
      RustModule.WalletV3.OutputPolicy.one(
        RustModule.WalletV3.Address.from_string(changeAddr.address)
      )
    );
    change.push(...filterToUsedChange(
      changeAddr,
      IOs.outputs(),
      selectedUtxos
    ));
  } else if (changeAddresses.length === 0) {
    IOs = ioBuilder.seal_with_output_policy(
      payload,
      feeAlgorithm,
      RustModule.WalletV3.OutputPolicy.forget()
    );
  } else {
    throw new Error('only support single change address');
  }

  return {
    senderUtxos: selectedUtxos,
    IOs,
    changeAddr: change,
  };
}

function firstMatchFirstInputSelection(
  txBuilder: RustModule.WalletV3.InputOutputBuilder,
  allUtxos: Array<RemoteUnspentOutput>,
  feeAlgorithm: RustModule.WalletV3.Fee,
  payload: RustModule.WalletV3.Payload,
): Array<RemoteUnspentOutput> {
  const selectedOutputs = [];
  if (allUtxos.length === 0) {
    throw new NotEnoughMoneyToSendError();
  }
  // add UTXOs in whatever order they're sorted until we have enough for amount+fee
  for (let i = 0; i < allUtxos.length; i++) {
    selectedOutputs.push(allUtxos[i]);
    txBuilder.add_input(utxoToTxInput(allUtxos[i]));
    const txBalance = txBuilder.get_balance(payload, feeAlgorithm);
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
  signingKey: RustModule.WalletV3.Bip32PrivateKey,
  useLegacy: boolean,
): RustModule.WalletV3.Fragment {
  const { senderUtxos, IOs } = signRequest;

  const txbuilder = new RustModule.WalletV3.TransactionBuilder();
  const builderSetIOs = txbuilder.no_payload();
  const builderSetWitnesses = builderSetIOs.set_ios(
    IOs.inputs(),
    IOs.outputs()
  );

  const builderSetAuthData = addWitnesses(
    builderSetWitnesses,
    senderUtxos,
    keyLevel,
    signingKey,
    useLegacy,
  );

  const signedTx = builderSetAuthData.set_payload_auth(
    // can't add a certificate to a UTXO transaction
    RustModule.WalletV3.PayloadAuthData.for_no_payload()
  );

  const fragment = RustModule.WalletV3.Fragment.from_transaction(signedTx);
  return fragment;
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
  builderSetWitnesses: RustModule.WalletV3.TransactionBuilderSetWitness,
  senderUtxos: Array<AddressedUtxo>,
  keyLevel: number,
  signingKey: RustModule.WalletV3.Bip32PrivateKey,
  useLegacy: boolean,
): RustModule.WalletV3.TransactionBuilderSetAuthData {
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
        utxo.addressing.path[i]
      );
    }
    return key;
  });

  const witnesses = RustModule.WalletV3.Witnesses.new();
  for (let i = 0; i < senderUtxos.length; i++) {
    const witness = useLegacy
      ? RustModule.WalletV3.Witness.for_legacy_icarus_utxo(
        RustModule.WalletV3.Hash.from_hex(CONFIG.app.genesisHash),
        builderSetWitnesses.get_auth_data_for_witness(),
        privateKeys[i],
      )
      : RustModule.WalletV3.Witness.for_utxo(
        RustModule.WalletV3.Hash.from_hex(CONFIG.app.genesisHash),
        builderSetWitnesses.get_auth_data_for_witness(),
        privateKeys[i].to_raw_key(),
      );
    witnesses.add(witness);
  }
  return builderSetWitnesses.set_witnesses(witnesses);
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
