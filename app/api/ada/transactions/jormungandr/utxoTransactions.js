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

import type {
  Address, Value, Addressing,
  IGetAllUtxosResponse
} from '../../lib/storage/models/PublicDeriver/interfaces';
import { generateAuthData, normalizeKey, generateFee, } from './utils';
import {
  selectAllInputSelection,
  firstMatchFirstInputSelection,
  utxoToTxInput,
} from './inputSelection';

declare var CONFIG: ConfigType;

type TxOutput = {|
  address: string,
  amount: string,
|};

export function sendAllUnsignedTx(
  receiver: string,
  allUtxos: Array<AddressedUtxo>,
  certificate: void | RustModule.WalletV3.Certificate,
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
    Array.from(addressingMap.keys()),
    certificate,
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
    IOs: unsignedTxResponse.IOs,
    changeAddr: unsignedTxResponse.changeAddr,
    certificate,
  };
}

export function sendAllUnsignedTxFromUtxo(
  receiver: string,
  allUtxos: Array<RemoteUnspentOutput>,
  certificate: void | RustModule.WalletV3.Certificate,
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

  const feeAlgorithm = generateFee();
  let fee;
  {
    // first build a transaction to see what the cost would be
    const fakeIOBuilder = RustModule.WalletV3.InputOutputBuilder.empty();
    for (const utxo of allUtxos) {
      const input = utxoToTxInput(utxo);
      fakeIOBuilder.add_input(input);
    }
    fakeIOBuilder.add_output(
      RustModule.WalletV3.Address.from_bytes(
        Buffer.from(receiver, 'hex')
      ),
      RustModule.WalletV3.Value.from_str(totalBalance.toString())
    );
    const payload = certificate != null
      ? RustModule.WalletV3.Payload.certificate(certificate)
      : RustModule.WalletV3.Payload.no_payload();
    const feeValue = fakeIOBuilder.estimate_fee(
      feeAlgorithm,
      payload
    ).to_str();
    fee = new BigNumber(feeValue);
  }

  // create a new transaction subtracting the fee from your total UTXO
  if (totalBalance.isLessThan(fee)) {
    throw new NotEnoughMoneyToSendError();
  }
  const newAmount = totalBalance.minus(fee).toString();
  const unsignedTxResponse = newAdaUnsignedTxFromUtxo(
    [{
      address: receiver,
      amount: newAmount,
    }],
    [],
    allUtxos,
    certificate,
  );
  return unsignedTxResponse;
}

export function newAdaUnsignedTx(
  outputs: Array<TxOutput>,
  changeAdaAddr: Array<{| ...Address, ...Addressing |}>,
  allUtxos: Array<AddressedUtxo>,
  certificate: void | RustModule.WalletV3.Certificate,
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
    outputs,
    changeAdaAddr,
    Array.from(addressingMap.keys()),
    certificate,
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
    IOs: unsignedTxResponse.IOs,
    changeAddr: unsignedTxResponse.changeAddr,
    certificate,
  };
}

/**
 * This function operates on UTXOs without a way to generate the private key for them
 * Private key needs to be added afterwards either through
 * A) Addressing
 * B) Having the key provided externally
 */
export function newAdaUnsignedTxFromUtxo(
  outputs: Array<TxOutput>,
  changeAddresses: Array<{| ...Address, ...Addressing |}>,
  allUtxos: Array<RemoteUnspentOutput>,
  certificate: void | RustModule.WalletV3.Certificate,
): V3UnsignedTxUtxoResponse {
  const feeAlgorithm = generateFee();

  const ioBuilder = RustModule.WalletV3.InputOutputBuilder.empty();
  for (const output of outputs) {
    ioBuilder.add_output(
      RustModule.WalletV3.Address.from_bytes(
        Buffer.from(output.address, 'hex')
      ),
      RustModule.WalletV3.Value.from_str(output.amount)
    );
  }
  const payload = certificate != null
    ? RustModule.WalletV3.Payload.certificate(certificate)
    : RustModule.WalletV3.Payload.no_payload();

  let selectedUtxos;
  let IOs;
  const change = [];
  if (changeAddresses.length === 1) {
    selectedUtxos = firstMatchFirstInputSelection(
      ioBuilder,
      allUtxos,
      feeAlgorithm,
      payload,
    );
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
        RustModule.WalletV3.Address.from_bytes(
          Buffer.from(changeAddr.address, 'hex')
        )
      )
    );
    const addedChange = filterToUsedChange(
      changeAddr,
      IOs.outputs(),
      selectedUtxos
    );
    change.push(...addedChange);
  } else if (changeAddresses.length === 0) {
    selectedUtxos = selectAllInputSelection(
      ioBuilder,
      allUtxos,
      feeAlgorithm,
      payload
    );
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
  const changeAddrWasm = RustModule.WalletV3.Address.from_bytes(
    Buffer.from(changeAddr.address, 'hex')
  );
  const changeAddrPayload = Buffer.from(changeAddrWasm.as_bytes()).toString('hex');
  for (let i = 0; i < outputs.size(); i++) {
    const output = outputs.get(i);
    const val = output.value().to_str();
    // note: both change & outputs all cannot be legacy addresses
    const outputPayload = Buffer.from(output.address().as_bytes()).toString('hex');
    if (changeAddrPayload === outputPayload) {
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
  payload: void | {|
    stakingKey: RustModule.WalletV3.PrivateKey,
    certificate: RustModule.WalletV3.Certificate,
  |},
): RustModule.WalletV3.Fragment {
  const { senderUtxos, IOs } = signRequest;

  const txbuilder = new RustModule.WalletV3.TransactionBuilder();
  const builderSetIOs = payload != null
    ? txbuilder.payload(payload.certificate)
    : txbuilder.no_payload();
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

  const payloadAuthData = payload == null
    ? RustModule.WalletV3.PayloadAuthData.for_no_payload()
    : generateAuthData(
      RustModule.WalletV3.AccountBindingSignature.new_single(
        payload.stakingKey,
        builderSetAuthData.get_auth_data()
      ),
      payload.certificate,
    );
  const signedTx = builderSetAuthData.set_payload_auth(
    payloadAuthData
  );

  const fragment = RustModule.WalletV3.Fragment.from_transaction(signedTx);
  return fragment;
}

function addWitnesses(
  builderSetWitnesses: RustModule.WalletV3.TransactionBuilderSetWitness,
  senderUtxos: Array<AddressedUtxo>,
  keyLevel: number,
  signingKey: RustModule.WalletV3.Bip32PrivateKey,
  useLegacy: boolean,
): RustModule.WalletV3.TransactionBuilderSetAuthData {
  const privateKeys = senderUtxos.map(utxo => normalizeKey({
    addressing: utxo.addressing,
    startingFrom: {
      key: signingKey,
      level: keyLevel,
    },
  }));

  const witnesses = RustModule.WalletV3.Witnesses.new();
  for (let i = 0; i < senderUtxos.length; i++) {
    const witness = useLegacy
      ? RustModule.WalletV3.Witness.for_legacy_icarus_utxo(
        RustModule.WalletV3.Hash.from_hex(CONFIG.genesis.genesisHash),
        builderSetWitnesses.get_auth_data_for_witness(),
        privateKeys[i],
      )
      : RustModule.WalletV3.Witness.for_utxo(
        RustModule.WalletV3.Hash.from_hex(CONFIG.genesis.genesisHash),
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
