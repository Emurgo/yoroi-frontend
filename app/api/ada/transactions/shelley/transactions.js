// @flow

// Handles interfacing w/ cardano-serialization-lib to create transaction

import BigNumber from 'bignumber.js';
import type {
  BaseSignRequest,
  V4UnsignedTxUtxoResponse,
  V4UnsignedTxAddressedUtxoResponse,
  AddressedUtxo,
} from '../types';
import type { RemoteUnspentOutput, } from '../../lib/state-fetch/types';
import {
  NotEnoughMoneyToSendError,
} from '../../../common/errors';

import { RustModule } from '../../lib/cardanoCrypto/rustLoader';

import {
  Bip44DerivationLevels,
} from '../../lib/storage/database/walletTypes/bip44/api/utils';
import type {
  Address, Addressing,
} from '../../lib/storage/models/PublicDeriver/interfaces';
import {
  getCardanoAddrKeyHash,
} from '../../lib/storage/bridge/utils';

const defaultTtlOffset = 7200; // based off what the cardano-wallet team found worked empirically
const minimumUtxoValue = '0'; // TODO: make this a protocol parameter that can dynamically change

export function sendAllUnsignedTx(
  receiver: string,
  allUtxos: Array<AddressedUtxo>,
  absSlotNumber: BigNumber,
): V4UnsignedTxAddressedUtxoResponse {
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
    absSlotNumber,
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

function addUtxoInput(
  txBuilder: RustModule.WalletV4.TransactionBuilder,
  input: RemoteUnspentOutput,
): void {
  const keyHash = getCardanoAddrKeyHash(input.receiver);
  if (keyHash == null) {
    txBuilder.add_bootstrap_input(
      RustModule.WalletV4.ByronAddress.from_bytes(Buffer.from(input.receiver, 'hex')),
      utxoToTxInput(input),
      RustModule.WalletV4.BigNum.from_str(input.amount)
    );
    return;
  }
  if (keyHash === undefined) {
    throw new Error(`${nameof(addUtxoInput)} script inputs not expected`);
  }
  txBuilder.add_key_input(
    keyHash,
    utxoToTxInput(input),
    RustModule.WalletV4.BigNum.from_str(input.amount)
  );
}

export function sendAllUnsignedTxFromUtxo(
  receiver: string,
  allUtxos: Array<RemoteUnspentOutput>,
  absSlotNumber: BigNumber,
): V4UnsignedTxUtxoResponse {
  const totalBalance = allUtxos
    .map(utxo => new BigNumber(utxo.amount))
    .reduce(
      (acc, amount) => acc.plus(amount),
      new BigNumber(0)
    );
  if (totalBalance.isZero()) {
    throw new NotEnoughMoneyToSendError();
  }

  const txBuilder = RustModule.WalletV4.TransactionBuilder.new(
    RustModule.WalletV4.LinearFee.new(
      RustModule.WalletV4.BigNum.from_str('2'),
      RustModule.WalletV4.BigNum.from_str('500'),
    ),
    RustModule.WalletV4.BigNum.from_str(minimumUtxoValue),
  );
  txBuilder.set_ttl(absSlotNumber.plus(defaultTtlOffset).toNumber());
  for (const input of allUtxos) {
    addUtxoInput(txBuilder, input);
  }

  if (totalBalance.lt(txBuilder.estimate_fee().to_str())) {
    // not enough in inputs to even cover the cost of including themselves in a tx
    throw new NotEnoughMoneyToSendError();
  }
  {
    // semantically, sending all ADA to somebody
    // is the same as if you're sending all the ADA as change to yourself
    // (module the fact the address doesn't belong to you)
    const couldSendAmount = txBuilder.add_change_if_needed(
      RustModule.WalletV4.Address.from_bytes(Buffer.from(receiver, 'hex'))
    );
    if (!couldSendAmount) {
      // if you couldn't send any amount,
      // it's because you couldn't cover the fee of adding an output
      throw new NotEnoughMoneyToSendError();
    }
  }

  return {
    senderUtxos: allUtxos,
    txBuilder,
    changeAddr: [], // no change for sendAll
  };
}

/**
 * we use all UTXOs as possible inputs for selection
 */
export function newAdaUnsignedTx(
  receiver: string,
  amount: string,
  changeAdaAddr: void | {| ...Address, ...Addressing |},
  allUtxos: Array<AddressedUtxo>,
  absSlotNumber: BigNumber,
): V4UnsignedTxAddressedUtxoResponse {
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
    Array.from(addressingMap.keys()),
    absSlotNumber,
  );

  const addressedUtxos = unsignedTxResponse.senderUtxos.map(
    utxo => {
      const addressedUtxo = addressingMap.get(utxo);
      if (addressedUtxo == null) {
        throw new Error(`${nameof(newAdaUnsignedTx)} utxo reference was changed. Should not happen`);
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
  changeAdaAddr: void | {| ...Address, ...Addressing |},
  utxos: Array<RemoteUnspentOutput>,
  absSlotNumber: BigNumber,
): V4UnsignedTxUtxoResponse {
  const txBuilder = RustModule.WalletV4.TransactionBuilder.new(
    RustModule.WalletV4.LinearFee.new(
      RustModule.WalletV4.BigNum.from_str('2'),
      RustModule.WalletV4.BigNum.from_str('500'),
    ),
    RustModule.WalletV4.BigNum.from_str(minimumUtxoValue),
  );
  txBuilder.set_ttl(absSlotNumber.plus(defaultTtlOffset).toNumber());
  txBuilder.add_output(
    RustModule.WalletV4.TransactionOutput.new(
      RustModule.WalletV4.Address.from_bytes(Buffer.from(receiver, 'hex')),
      RustModule.WalletV4.BigNum.from_str(amount),
    )
  );

  let currentInputSum = new BigNumber(0);
  const usedUtxos: Array<RemoteUnspentOutput> = [];
  // add utxos until we have enough to send the transaction
  for (const utxo of utxos) {
    usedUtxos.push(utxo);
    currentInputSum = currentInputSum.plus(utxo.amount);
    addUtxoInput(txBuilder, utxo);
    const output = new BigNumber(
      txBuilder.get_feeless_output_total().checked_add(txBuilder.estimate_fee()).to_str()
    );

    if (currentInputSum.gte(output)) {
      break;
    }
  }
  // check to see if we have enough balance in the wallet to cover the transaction
  {
    const output = new BigNumber(
      txBuilder.get_feeless_output_total().checked_add(txBuilder.estimate_fee()).to_str()
    );
    if (currentInputSum.lt(output)) {
      throw new NotEnoughMoneyToSendError();
    }
  }

  const changeAddr = (() => {
    if (changeAdaAddr == null) {
      txBuilder.set_fee(txBuilder.estimate_fee());
      return [];
    }
    const oldOutput = txBuilder.get_feeless_output_total();
    const changeWasAdded = txBuilder.add_change_if_needed(
      RustModule.WalletV4.Address.from_bytes(Buffer.from(changeAdaAddr.address, 'hex'))
    );
    const changeValue = new BigNumber(
      txBuilder.get_feeless_output_total().checked_sub(oldOutput).to_str
    );
    return changeWasAdded
      ? [{
        ...changeAdaAddr,
        value: changeValue,
      }]
      : [];
  })();

  return {
    senderUtxos: usedUtxos,
    txBuilder,
    changeAddr,
  };
}

export function signTransaction(
  signRequest: BaseSignRequest<RustModule.WalletV4.TransactionBody>,
  keyLevel: number,
  signingKey: RustModule.WalletV4.Bip32PrivateKey,
  metadata: void | RustModule.WalletV4.TransactionMetadata,
): RustModule.WalletV4.Transaction {
  const seenByronKeys: Set<string> = new Set();
  const seenKeyHashes: Set<string> = new Set();
  const deduped: Array<AddressedUtxo> = [];
  for (const senderUtxo of signRequest.senderUtxos) {
    const keyHash = getCardanoAddrKeyHash(senderUtxo.receiver);
    if (keyHash === null) {
      if (!seenByronKeys.has(senderUtxo.receiver)) {
        seenByronKeys.add(senderUtxo.receiver);
        deduped.push(senderUtxo);
      }
      continue;
    }
    if (keyHash === undefined) {
      throw new Error(`${nameof(signTransaction)} cannot sign script inputs`);
    }
    {
      const keyHex = Buffer.from(keyHash.to_bytes()).toString('hex');
      if (!seenKeyHashes.has(keyHex)) {
        seenKeyHashes.add(keyHex);
        deduped.push(senderUtxo);
      }
    }
  }

  const witnessSet = addWitnesses(
    signRequest.unsignedTx,
    deduped,
    keyLevel,
    signingKey
  );
  return RustModule.WalletV4.Transaction.new(
    signRequest.unsignedTx,
    witnessSet,
    metadata,
  );
}

function utxoToTxInput(
  utxo: RemoteUnspentOutput,
): RustModule.WalletV4.TransactionInput {
  return RustModule.WalletV4.TransactionInput.new(
    RustModule.WalletV4.TransactionHash.from_bytes(
      Buffer.from(utxo.tx_hash, 'hex'),
    ),
    utxo.tx_index,
  );
}

function addWitnesses(
  txBody: RustModule.WalletV4.TransactionBody,
  uniqueUtxos: Array<AddressedUtxo>, // pre-req: does not contain duplicate keys
  keyLevel: number,
  signingKey: RustModule.WalletV4.Bip32PrivateKey
): RustModule.WalletV4.TransactionWitnessSet {
  // get private keys
  const privateKeys = uniqueUtxos.map(utxo => {
    const lastLevelSpecified = utxo.addressing.startLevel + utxo.addressing.path.length - 1;
    if (lastLevelSpecified !== Bip44DerivationLevels.ADDRESS.level) {
      throw new Error(`${nameof(addWitnesses)} incorrect addressing size`);
    }
    if (keyLevel + 1 < utxo.addressing.startLevel) {
      throw new Error(`${nameof(addWitnesses)} keyLevel < startLevel`);
    }
    let key = signingKey;
    for (let i = keyLevel - utxo.addressing.startLevel + 1; i < utxo.addressing.path.length; i++) {
      key = key.derive(
        utxo.addressing.path[i]
      );
    }
    return key;
  });

  // sign the transactions
  const txHash = RustModule.WalletV4.hash_transaction(txBody);
  const vkeyWits = RustModule.WalletV4.Vkeywitnesses.new();
  const bootstrapWits = RustModule.WalletV4.BootstrapWitnesses.new();
  for (let i = 0; i < uniqueUtxos.length; i++) {
    const wasmAddr = RustModule.WalletV4.Address.from_bytes(Buffer.from(uniqueUtxos[i].receiver, 'hex'));
    const byronAddr = RustModule.WalletV4.ByronAddress.from_address(wasmAddr);
    if (byronAddr == null) {
      const vkeyWit = RustModule.WalletV4.make_vkey_witness(
        txHash,
        privateKeys[i].to_raw_key(),
      );
      vkeyWits.add(vkeyWit);
    } else {
      const bootstrapWit = RustModule.WalletV4.make_icarus_bootstrap_witness(
        txHash,
        byronAddr,
        privateKeys[i],
      );
      bootstrapWits.add(bootstrapWit);
    }
  }

  const witSet = RustModule.WalletV4.TransactionWitnessSet.new();
  if (bootstrapWits.len() > 0) witSet.set_bootstraps(bootstrapWits);
  if (vkeyWits.len() > 0) witSet.set_vkeys(vkeyWits);
  return witSet;
}
