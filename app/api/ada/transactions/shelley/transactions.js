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
import { derivePrivateByAddressing } from '../../lib/cardanoCrypto/utils';

import {
  Bip44DerivationLevels,
} from '../../lib/storage/database/walletTypes/bip44/api/utils';
import type {
  Address, Addressing,
  IGetAllUtxosResponse,
} from '../../lib/storage/models/PublicDeriver/interfaces';
import {
  getCardanoAddrKeyHash, normalizeToAddress,
} from '../../lib/storage/bridge/utils';

/**
 * based off what the cardano-wallet team found worked empirically
 * note: slots are 1 second in Shelley mainnet, so this is 2 minutes
 */
const defaultTtlOffset = 7200;

type TxOutput = {|
  address: string,
  amount: string,
|};

export function sendAllUnsignedTx(
  receiver: string,
  allUtxos: Array<AddressedUtxo>,
  absSlotNumber: BigNumber,
  protocolParams: {|
    linearFee: RustModule.WalletV4.LinearFee,
    minimumUtxoVal: RustModule.WalletV4.BigNum,
    poolDeposit: RustModule.WalletV4.BigNum,
    keyDeposit: RustModule.WalletV4.BigNum,
  |},
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
    protocolParams,
  );

  const addressedUtxos = unsignedTxResponse.senderUtxos.map(
    utxo => {
      const addressedUtxo = addressingMap.get(utxo);
      if (addressedUtxo == null) {
        throw new Error(`${nameof(sendAllUnsignedTx)} utxo reference was changed. Should not happen`);
      }
      return addressedUtxo;
    }
  );

  return {
    senderUtxos: addressedUtxos,
    txBuilder: unsignedTxResponse.txBuilder,
    changeAddr: unsignedTxResponse.changeAddr,
    certificates: [],
  };
}

function addUtxoInput(
  txBuilder: RustModule.WalletV4.TransactionBuilder,
  input: RemoteUnspentOutput,
): void {
  const wasmInput = normalizeToAddress(input.receiver);
  if (wasmInput == null) {
    throw new Error(`${nameof(addUtxoInput)} input not a valid Shelley address`);
  }
  const keyHash = getCardanoAddrKeyHash(wasmInput);
  if (keyHash === null) {
    const byronAddr = RustModule.WalletV4.ByronAddress.from_address(wasmInput);
    if (byronAddr == null) {
      throw new Error(`${nameof(addUtxoInput)} should never happen: non-byron address without key hash`);
    }
    txBuilder.add_bootstrap_input(
      byronAddr,
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
  protocolParams: {|
    linearFee: RustModule.WalletV4.LinearFee,
    minimumUtxoVal: RustModule.WalletV4.BigNum,
    poolDeposit: RustModule.WalletV4.BigNum,
    keyDeposit: RustModule.WalletV4.BigNum,
  |},
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
    protocolParams.linearFee,
    protocolParams.minimumUtxoVal,
    protocolParams.poolDeposit,
    protocolParams.keyDeposit,
  );
  txBuilder.set_ttl(absSlotNumber.plus(defaultTtlOffset).toNumber());
  for (const input of allUtxos) {
    addUtxoInput(txBuilder, input);
  }

  if (totalBalance.lt(txBuilder.min_fee().to_str())) {
    // not enough in inputs to even cover the cost of including themselves in a tx
    throw new NotEnoughMoneyToSendError();
  }
  {
    const wasmReceiver = normalizeToAddress(receiver);
    if (wasmReceiver == null) {
      throw new Error(`${nameof(sendAllUnsignedTxFromUtxo)} receiver not a valid Shelley address`);
    }

    // semantically, sending all ADA to somebody
    // is the same as if you're sending all the ADA as change to yourself
    // (module the fact the address doesn't belong to you)
    const couldSendAmount = txBuilder.add_change_if_needed(wasmReceiver);
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
  outputs: Array<TxOutput>,
  changeAdaAddr: void | {| ...Address, ...Addressing |},
  allUtxos: Array<AddressedUtxo>,
  absSlotNumber: BigNumber,
  protocolParams: {|
    linearFee: RustModule.WalletV4.LinearFee,
    minimumUtxoVal: RustModule.WalletV4.BigNum,
    poolDeposit: RustModule.WalletV4.BigNum,
    keyDeposit: RustModule.WalletV4.BigNum,
  |},
  certificates: $ReadOnlyArray<RustModule.WalletV4.Certificate>,
  withdrawals: $ReadOnlyArray<{|
    address: RustModule.WalletV4.RewardAddress,
    amount: RustModule.WalletV4.BigNum,
  |}>,
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
    outputs,
    changeAdaAddr,
    Array.from(addressingMap.keys()),
    absSlotNumber,
    protocolParams,
    certificates,
    withdrawals
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
    certificates,
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
  changeAdaAddr: void | {| ...Address, ...Addressing |},
  utxos: Array<RemoteUnspentOutput>,
  absSlotNumber: BigNumber,
  protocolParams: {|
    linearFee: RustModule.WalletV4.LinearFee,
    minimumUtxoVal: RustModule.WalletV4.BigNum,
    poolDeposit: RustModule.WalletV4.BigNum,
    keyDeposit: RustModule.WalletV4.BigNum,
  |},
  certificates: $ReadOnlyArray<RustModule.WalletV4.Certificate>,
  withdrawals: $ReadOnlyArray<{|
    address: RustModule.WalletV4.RewardAddress,
    amount: RustModule.WalletV4.BigNum,
  |}>,
): V4UnsignedTxUtxoResponse {
  const txBuilder = RustModule.WalletV4.TransactionBuilder.new(
    protocolParams.linearFee,
    protocolParams.minimumUtxoVal,
    protocolParams.poolDeposit,
    protocolParams.keyDeposit,
  );
  if (certificates.length > 0) {
    const certsWasm = certificates.reduce(
      (certs, cert) => { certs.add(cert); return certs; },
      RustModule.WalletV4.Certificates.new()
    );
    txBuilder.set_certs(certsWasm);
  }
  if (withdrawals.length > 0) {
    const withdrawalWasm = withdrawals.reduce(
      (withs, withdrawal) => {
        withs.insert(
          withdrawal.address,
          withdrawal.amount,
        );
        return withs;
      },
      RustModule.WalletV4.Withdrawals.new()
    );
    txBuilder.set_withdrawals(withdrawalWasm);
  }
  txBuilder.set_ttl(absSlotNumber.plus(defaultTtlOffset).toNumber());
  {
    for (const output of outputs) {
      const wasmReceiver = normalizeToAddress(output.address);
      if (wasmReceiver == null) {
        throw new Error(`${nameof(newAdaUnsignedTxFromUtxo)} receiver not a valid Shelley address`);
      }
      txBuilder.add_output(
        RustModule.WalletV4.TransactionOutput.new(
          wasmReceiver,
          RustModule.WalletV4.BigNum.from_str(output.amount),
        )
      );
    }
  }

  // pick inputs
  const usedUtxos: Array<RemoteUnspentOutput> = [];
  {
    // recall: we might have some implicit input to start with from deposit refunds
    let currentInputSum = new BigNumber(txBuilder.get_explicit_input().to_str());

    if (utxos.length === 0) {
      throw new NotEnoughMoneyToSendError();
    }
    // add utxos until we have enough to send the transaction
    for (const utxo of utxos) {
      usedUtxos.push(utxo); // note: this ensure we have at least one UTXO in the tx
      currentInputSum = currentInputSum.plus(utxo.amount);
      addUtxoInput(txBuilder, utxo);
      const output = new BigNumber(
        txBuilder
          .get_explicit_output()
          .checked_add(txBuilder.min_fee())
          .checked_add(txBuilder.get_deposit())
          .to_str()
      );

      if (currentInputSum.gte(output)) {
        break;
      }
    }
    // check to see if we have enough balance in the wallet to cover the transaction
    {
      const output = new BigNumber(
        txBuilder
          .get_explicit_output()
          .checked_add(txBuilder.min_fee())
          .checked_add(txBuilder.get_deposit())
          .to_str()
      );
      if (currentInputSum.lt(output)) {
        throw new NotEnoughMoneyToSendError();
      }
    }
  }

  const changeAddr = (() => {
    if (changeAdaAddr == null) {
      const totalInput = txBuilder.get_explicit_input().checked_add(txBuilder.get_implicit_input());
      const totalOutput = txBuilder.get_explicit_output();
      const deposit = txBuilder.get_deposit();
      const difference = new BigNumber(
        totalInput
          .checked_sub(totalOutput)
          .checked_sub(deposit)
          .to_str()
      );
      const minFee = new BigNumber(txBuilder.min_fee().to_str());
      if (difference.lt(minFee)) {
        throw new NotEnoughMoneyToSendError();
      }
      // recall: min fee assumes the largest fee possible
      // so no worries of cbor issue by including larger fee
      txBuilder.set_fee(RustModule.WalletV4.BigNum.from_str(difference.toString()));
      return [];
    }
    const oldOutput = txBuilder.get_explicit_output();

    const wasmChange = normalizeToAddress(changeAdaAddr.address);
    if (wasmChange == null) {
      throw new Error(`${nameof(newAdaUnsignedTxFromUtxo)} change not a valid Shelley address`);
    }
    const changeWasAdded = txBuilder.add_change_if_needed(wasmChange);
    const changeValue = new BigNumber(
      txBuilder.get_explicit_output().checked_sub(oldOutput).to_str()
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
  signRequest: BaseSignRequest<RustModule.WalletV4.TransactionBuilder> |
    BaseSignRequest<RustModule.WalletV4.TransactionBody>,
  keyLevel: number,
  signingKey: RustModule.WalletV4.Bip32PrivateKey,
  getStakingWitnesses: (
    RustModule.WalletV4.TransactionHash => Array<RustModule.WalletV4.Vkeywitness>
  ),
  metadata: void | RustModule.WalletV4.TransactionMetadata,
): RustModule.WalletV4.Transaction {
  const seenByronKeys: Set<string> = new Set();
  const seenKeyHashes: Set<string> = new Set();
  const deduped: Array<AddressedUtxo> = [];
  for (const senderUtxo of signRequest.senderUtxos) {
    const wasmAddr = normalizeToAddress(senderUtxo.receiver);
    if (wasmAddr == null) {
      throw new Error(`${nameof(signTransaction)} utxo not a valid Shelley address`);
    }
    const keyHash = getCardanoAddrKeyHash(wasmAddr);
    const addrHex = Buffer.from(wasmAddr.to_bytes()).toString('hex');
    if (keyHash === null) {
      if (!seenByronKeys.has(addrHex)) {
        seenByronKeys.add(addrHex);
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

  const txBody = signRequest.unsignedTx instanceof RustModule.WalletV4.TransactionBuilder
    ? signRequest.unsignedTx.build()
    : signRequest.unsignedTx;
  const txHash = RustModule.WalletV4.hash_transaction(txBody);

  const vkeyWits = RustModule.WalletV4.Vkeywitnesses.new();
  const bootstrapWits = RustModule.WalletV4.BootstrapWitnesses.new();

  addWitnesses(
    txHash,
    deduped,
    keyLevel,
    signingKey,
    vkeyWits,
    bootstrapWits,
  );

  const stakingKeySigSet = new Set<string>();
  for (const witness of getStakingWitnesses(txHash)) {
    const asString = Buffer.from(witness.to_bytes()).toString('hex');
    if (stakingKeySigSet.has(asString)) {
      continue;
    }
    stakingKeySigSet.add(asString);
    vkeyWits.add(witness);
  }

  const witnessSet = RustModule.WalletV4.TransactionWitnessSet.new();
  if (bootstrapWits.len() > 0) witnessSet.set_bootstraps(bootstrapWits);
  if (vkeyWits.len() > 0) witnessSet.set_vkeys(vkeyWits);

  return RustModule.WalletV4.Transaction.new(
    txBody,
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
  txHash: RustModule.WalletV4.TransactionHash,
  uniqueUtxos: Array<AddressedUtxo>, // pre-req: does not contain duplicate keys
  keyLevel: number,
  signingKey: RustModule.WalletV4.Bip32PrivateKey,
  vkeyWits: RustModule.WalletV4.Vkeywitnesses,
  bootstrapWits: RustModule.WalletV4.BootstrapWitnesses,
): void {
  // get private keys
  const privateKeys = uniqueUtxos.map(utxo => {
    const lastLevelSpecified = utxo.addressing.startLevel + utxo.addressing.path.length - 1;
    if (lastLevelSpecified !== Bip44DerivationLevels.ADDRESS.level) {
      throw new Error(`${nameof(addWitnesses)} incorrect addressing size`);
    }
    return derivePrivateByAddressing({
      addressing: utxo.addressing,
      startingFrom: {
        level: keyLevel,
        key: signingKey,
      }
    });
  });

  // sign the transactions
  for (let i = 0; i < uniqueUtxos.length; i++) {
    const wasmAddr = normalizeToAddress(uniqueUtxos[i].receiver);
    if (wasmAddr == null) {
      throw new Error(`${nameof(addWitnesses)} utxo not a valid Shelley address`);
    }
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
}

// TODO: should go in a utility class somewhere instead of being copy-pasted in multiple places
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
