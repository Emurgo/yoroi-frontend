// @flow

import BigNumber from 'bignumber.js';
import { InputTypes } from './types';
import type {
  HistoryRequest, HistoryResponse, HistoryFunc,
  BestBlockRequest, BestBlockResponse, BestBlockFunc,
  AddressUtxoRequest, AddressUtxoResponse, AddressUtxoFunc,
  UtxoSumRequest, UtxoSumResponse, UtxoSumFunc,
  RemoteTransaction, RemoteUnspentOutput,
  AccountStateRequest, AccountStateResponse, AccountStateFunc,
  PoolInfoRequest, PoolInfoResponse, PoolInfoFunc,
  ReputationRequest, ReputationResponse, ReputationFunc,
  RewardHistoryRequest, RewardHistoryResponse, RewardHistoryFunc,
  AccountStateSuccess, AccountStateFailure, AccountStateDelegation,
  SignedRequestInternal, RemoteCertificate,
  RemoteTransactionInput, RemoteTransactionOutput,
} from './types';
import type {
  FilterUsedRequest, FilterUsedResponse, FilterFunc,
} from '../../../common/lib/state-fetch/currencySpecificTypes';
import { RollbackApiError, } from '../../../common/errors';
import { groupToSingle, delegationTypeToResponse, } from '../storage/bridge/utils';
import { addressToKind, } from '../../../ada/lib/storage/bridge/utils';
import { CoreAddressTypes } from '../../../ada/lib/storage/database/primitives/enums';
import type { CoreAddressT } from '../../../ada/lib/storage/database/primitives/enums';
import {
  mnemonicToEntropy
} from 'bip39';
import {
  WalletTypePurpose,
} from '../../../../config/numbersConfig';
import type { NetworkRow } from '../../../ada/lib/storage/database/primitives/tables';

import { RustModule } from '../../../ada/lib/cardanoCrypto/rustLoader';

import { generateLedgerWalletRootKey } from '../../../ada/lib/cardanoCrypto/cryptoWallet';
import { v4Bip32PrivateToV3 } from '../crypto/utils';
import { networks, getJormungandrBaseConfig } from '../../../ada/lib/storage/database/prepackaged/networks';

export function genCheckAddressesInUse(
  blockchain: Array<RemoteTransaction>,
  network: $ReadOnly<NetworkRow>,
): FilterFunc {
  return async (
    body: FilterUsedRequest,
  ): Promise<FilterUsedResponse> => {
    const addressSet = new Set(body.addresses);
    const usedSet = new Set();
    for (const tx of blockchain) {
      if (tx.tx_state !== 'Successful') {
        continue;
      }
      const oursInTx = ourAddressesInTx(tx, addressSet, network);
      for (const found of oursInTx) {
        usedSet.add(found);
      }
    }
    return Array.from(usedSet);
  };
}

function ourAddressesInTx(
  tx: RemoteTransaction,
  ownAddresses: Set<string>,
  network: $ReadOnly<NetworkRow>,
): Set<string> {
  const addresses = [
    ...tx.inputs.map(input => input.address),
    ...tx.outputs.map(output => output.address)
  ];
  const addressesUsed = new Set();
  for (const addr of addresses) {
    const kind = addressToKind(addr, 'bytes', network);
    const payload = kind === CoreAddressTypes.JORMUNGANDR_GROUP
      ? groupToSingle(addr)
      : addr;
    if (ownAddresses.has(payload)) {
      addressesUsed.add(payload);
    }
  }
  return addressesUsed;
}

function filterForOwn(
  txs: Array<RemoteTransaction>,
  ownAddresses: Set<string>,
  network: $ReadOnly<NetworkRow>,
): Array<RemoteTransaction> {
  const ownTxs = [];
  for (const tx of txs) {
    const oursInTx = ourAddressesInTx(tx, ownAddresses, network);
    if (oursInTx.size > 0) {
      ownTxs.push(tx);
    }
  }
  return ownTxs;
}

export function genGetTransactionsHistoryForAddresses(
  blockchain: Array<RemoteTransaction>,
  network: $ReadOnly<NetworkRow>,
): HistoryFunc {
  return async (
    body: HistoryRequest,
  ): Promise<HistoryResponse> => {
    const untilBlockIndex = blockchain.map(tx => tx.block_hash).lastIndexOf(body.untilBlock);
    if (untilBlockIndex === -1) {
      throw new RollbackApiError();
    }
    const subChain = blockchain.slice(0, untilBlockIndex + 1);
    // need to add back all pending/failed txs
    for (let i = untilBlockIndex + 1; i < blockchain.length; i++) {
      if (blockchain[i].block_hash == null) {
        subChain.push(blockchain[i]);
      }
    }
    const ownAddresses = new Set(body.addresses);
    if (body.after == null)  {
      const filtered = filterForOwn(subChain, ownAddresses, network);
      return filtered;
    }
    const after = body.after;

    let cutoffTx = undefined;
    for (let i = 0; i < subChain.length; i++) {
      if (
        subChain[i].hash === after.tx &&
        subChain[i].block_hash === after.block
      ) {
        cutoffTx = subChain[i];
        break;
      }
    }
    if (cutoffTx == null) {
      throw new RollbackApiError();
    }
    if (cutoffTx.height == null || cutoffTx.tx_ordinal == null) {
      throw new Error(`${nameof(genGetTransactionsHistoryForAddresses)} cutoffTx not in block - should never happen`);
    }
    const cutoffBlockNum = cutoffTx.height;
    const cutoffOrdinal = cutoffTx.tx_ordinal;

    const txsToInclude: Array<RemoteTransaction> = [];
    for (const tx of subChain) {
      if (tx === cutoffTx) continue;
      if (tx.height == null || tx.tx_ordinal == null) {
        txsToInclude.push(tx);
        continue;
      } else {
        const blockNum = tx.height;
        const ordinal = tx.tx_ordinal;
        if (blockNum > cutoffBlockNum) {
          txsToInclude.push(tx);
        } else if (blockNum === cutoffBlockNum) {
          if (ordinal > cutoffOrdinal) {
            txsToInclude.push(tx);
          }
        }
      }
    }
    const filtered = filterForOwn(txsToInclude, ownAddresses, network);
    return filtered;
  };
}

export function genGetBestBlock(
  blockchain: Array<RemoteTransaction>,
): BestBlockFunc {
  return async (
    _body: BestBlockRequest,
  ): Promise<BestBlockResponse> => {
    let bestInNetwork: void | BestBlockResponse = undefined;
    for (let i = blockchain.length - 1; i >= 0; i--) {
      const block = blockchain[i];
      if (
        block.height != null &&
        block.epoch != null &&
        block.slot != null &&
        block.block_hash != null
      ) {
        bestInNetwork = {
          epoch: block.epoch,
          slot: block.slot,
          hash: block.block_hash,
          height: block.height,
        };
        break;
      }
    }
    if (bestInNetwork == null) {
      return {
        height: 0,
        epoch: null,
        slot: null,
        hash: null,
      };
    }
    return bestInNetwork;
  };
}

export function genUtxoForAddresses(
  getHistory: HistoryFunc,
  getBestBlock: BestBlockFunc,
): AddressUtxoFunc {
  return async (
    body: AddressUtxoRequest,
  ): Promise<AddressUtxoResponse> => {
    const bestBlock = await getBestBlock();
    if (bestBlock.hash == null) {
      return [];
    }
    const until = bestBlock.hash;
    const history = await getHistory({
      addresses: body.addresses,
      untilBlock: until,
    });
    const inBlockHistory = history.filter(tx => tx.block_hash != null);
    const ourAddressSet = new Set(body.addresses);

    const utxoMap = new Map<string, RemoteUnspentOutput>();
    for (const tx of inBlockHistory) {
      for (let j = 0; j < tx.outputs.length; j++) {
        const address = tx.outputs[j].address;
        if (ourAddressSet.has(address)) {
          const kind = addressToKind(address, 'bytes', networks.ByronMainnet);
          if (
            kind !== CoreAddressTypes.CARDANO_LEGACY &&
            kind !== CoreAddressTypes.JORMUNGANDR_SINGLE &&
            kind !== CoreAddressTypes.JORMUNGANDR_GROUP
          ) {
            throw new Error(`${nameof(genUtxoForAddresses)} non-utxo address in utxo endpoint`);
          }
          const key = JSON.stringify({
            id: tx.hash,
            index: j
          });
          utxoMap.set(key, {
            utxo_id: tx.hash + j,
            tx_hash: tx.hash,
            tx_index: j,
            receiver: tx.outputs[j].address,
            amount: tx.outputs[j].amount.toString(),
          });
        }
      }
    }
    for (const tx of inBlockHistory) {
      for (let j = 0; j < tx.inputs.length; j++) {
        const input = tx.inputs[j];
        if (
          input.type === InputTypes.utxo ||
          input.type === InputTypes.legacyUtxo
        ) {
          const key = JSON.stringify({
            id: input.txHash,
            index: input.index,
          });
          utxoMap.delete(key);
        }
      }
    }
    const result = Array.from(utxoMap.values());
    return result;
  };
}

export function genUtxoSumForAddresses(
  getAddressUtxo: AddressUtxoFunc,
): UtxoSumFunc {
  return async (
    body: UtxoSumRequest,
  ): Promise<UtxoSumResponse> => {
    const utxos = await getAddressUtxo(body);
    if (utxos.length === 0) {
      return { sum: null };
    }
    const result = utxos.reduce(
      (sum, utxo) => sum.plus(new BigNumber(utxo.amount)),
      new BigNumber(0),
    );
    return {
      sum: result.toString()
    };
  };
}

export function getSingleAddressString(
  mnemonic: string,
  path: Array<number>,
  isLedger?: boolean = false,
): string {
  const bip39entropy = mnemonicToEntropy(mnemonic);
  const EMPTY_PASSWORD = Buffer.from('');
  const rootKey = isLedger
    ? v4Bip32PrivateToV3(generateLedgerWalletRootKey(mnemonic))
    : RustModule.WalletV3.Bip32PrivateKey.from_bip39_entropy(
      Buffer.from(bip39entropy, 'hex'),
      EMPTY_PASSWORD
    );
  const derivedKey = derivePath(
    rootKey,
    path
  );

  if (path[0] === WalletTypePurpose.BIP44) {
    const v2Key = RustModule.WalletV2.PublicKey.from_hex(
      Buffer.from(derivedKey.to_public().as_bytes()).toString('hex')
    );
    const baseConfig = getJormungandrBaseConfig(networks.JormungandrMainnet)
      .reduce((acc, next) => Object.assign(acc, next), {});
    const settings = RustModule.WalletV2.BlockchainSettings.from_json({
      protocol_magic: baseConfig.ByronNetworkId,
    });
    const addr = v2Key.bootstrap_era_address(settings);
    const hex = addr.to_base58();
    return hex;
  }
  if (path[0] === WalletTypePurpose.CIP1852) {
    const addr = RustModule.WalletV3.Address.single_from_public_key(
      derivedKey.to_public().to_raw_key(),
      RustModule.WalletV3.AddressDiscrimination.Production,
    );
    return Buffer.from(addr.as_bytes()).toString('hex');
  }
  throw new Error('Unexpected purpose');
}

export function getAddressForType(
  mnemonic: string,
  path: Array<number>,
  type: CoreAddressT,
): string {
  const bip39entropy = mnemonicToEntropy(mnemonic);
  const EMPTY_PASSWORD = Buffer.from('');
  const rootKey = RustModule.WalletV3.Bip32PrivateKey.from_bip39_entropy(
    Buffer.from(bip39entropy, 'hex'),
    EMPTY_PASSWORD
  );
  const derivedKey = derivePath(rootKey, path);

  switch (type) {
    case CoreAddressTypes.JORMUNGANDR_SINGLE: {
      const addr = RustModule.WalletV3.Address.single_from_public_key(
        derivedKey.to_public().to_raw_key(),
        RustModule.WalletV3.AddressDiscrimination.Production,
      );
      return Buffer.from(addr.as_bytes()).toString('hex');
    }
    case CoreAddressTypes.JORMUNGANDR_ACCOUNT: {
      const addr = RustModule.WalletV3.Address.account_from_public_key(
        derivedKey.to_public().to_raw_key(),
        RustModule.WalletV3.AddressDiscrimination.Production,
      );
      return Buffer.from(addr.as_bytes()).toString('hex');
    }
    case CoreAddressTypes.JORMUNGANDR_GROUP: {
      const newPath = [...path];
      // -1 because newPath here starts at PURPOSE and not at ROOT
      const chainLevel = 4 - 1;
      const addressLevel = 5 - 1;
      newPath[chainLevel] = 2;
      newPath[addressLevel] = 0;
      const stakingKey = derivePath(rootKey, newPath);
      const addr = RustModule.WalletV3.Address.delegation_from_public_key(
        derivedKey.to_public().to_raw_key(),
        stakingKey.to_public().to_raw_key(),
        RustModule.WalletV3.AddressDiscrimination.Production,
      );
      return Buffer.from(addr.as_bytes()).toString('hex');
    }
    default: throw new Error(`${nameof(getAddressForType)} unknown type ` + type);
  }
}

function derivePath(
  startKey: RustModule.WalletV3.Bip32PrivateKey,
  path: Array<number>
): RustModule.WalletV3.Bip32PrivateKey {
  let currKey = startKey;
  for (let i = 0; i < path.length; i++) {
    currKey = currKey.derive(path[i]);
  }
  return currKey;
}

function getCertificate(
  certificate: RustModule.WalletV3.Certificate | void
): void | RemoteCertificate {
  if (certificate == null) return certificate;

  const toStruct = (kindEnum: $PropertyType<RemoteCertificate, 'payloadKind'>) => ({
    payloadKind: kindEnum,
    payloadKindId: RustModule.WalletV3.CertificateKind.StakeDelegation,
    payloadHex: Buffer.from(certificate.as_bytes()).toString('hex')
  });
  switch (certificate.get_type()) {
    case RustModule.WalletV3.CertificateKind.PoolRegistration:
      return toStruct('PoolRegistration');
    case RustModule.WalletV3.CertificateKind.PoolUpdate:
      return toStruct('PoolUpdate');
    case RustModule.WalletV3.CertificateKind.PoolRetirement:
      return toStruct('PoolRetirement');
    case RustModule.WalletV3.CertificateKind.StakeDelegation:
      return toStruct('StakeDelegation');
    case RustModule.WalletV3.CertificateKind.OwnerStakeDelegation:
      return toStruct('OwnerStakeDelegation');
    default: throw new Error(`${nameof(getCertificate)} unexpected kind ${certificate.get_type()}`);
  }
}

function getSpendingCounter(
  blockchain: Array<RemoteTransaction>,
  address: string,
): number {
  for (let i = blockchain.length - 1; i >= 0; i--) {
    if (blockchain[i].tx_state !== 'Successful') {
      continue;
    }
    // careful: there can be multiple inputs for the same account in a transaction
    // with different spending counters
    let nextSpendingCounter = undefined;
    for (const input of blockchain[i].inputs) {
      if (input.type === 'account' && input.address === address) {
        const counter = input.spendingCounter;
        if (nextSpendingCounter == null || counter > nextSpendingCounter) {
          nextSpendingCounter = counter + 1;
        }
      }
    }
    if (nextSpendingCounter != null) {
      return nextSpendingCounter;
    }
  }
  return 0;
}
function getAccountBalance(
  blockchain: Array<RemoteTransaction>,
  address: string,
): BigNumber {
  let value = new BigNumber(0);
  for (const tx of blockchain) {
    if (tx.tx_state !== 'Successful') {
      continue;
    }
    for (const output of tx.outputs) {
      if (output.address === address) {
        value = value.plus(output.amount);
      }
    }
    for (const input of tx.inputs) {
      if (input.type === 'account' && input.address === address) {
        value = value.minus(input.amount);
      }
    }
  }
  return value;
}
function getJormungandrInputs(
  blockchain: Array<RemoteTransaction>,
  inputs: RustModule.WalletV3.Inputs
): Array<RemoteTransactionInput> {
  const result: Array<RemoteTransactionInput> = [];
  for (let i = 0; i < inputs.size(); i++) {
    const input = inputs.get(i);
    if (input.is_utxo()) {
      const pointer = input.get_utxo_pointer();

      const hash = Buffer.from(pointer.fragment_id().as_bytes()).toString('hex');
      const index = pointer.output_index();

      const pointedTx = blockchain.find(tx => tx.hash === hash);
      if (pointedTx == null) {
        throw new Error(`${nameof(getJormungandrInputs)} no tx found ${hash}`);
      }
      const pointedOutput = pointedTx.outputs[index];
      const addressKind = addressToKind(pointedOutput.address, 'bytes', networks.JormungandrMainnet);
      if (addressKind === CoreAddressTypes.CARDANO_LEGACY) {
        result.push({
          address: pointedOutput.address,
          amount: pointedOutput.amount,
          id: hash + index,
          index,
          txHash: hash,
        });
      } else {
        result.push({
          type: 'utxo',
          address: pointedOutput.address,
          amount: pointedOutput.amount,
          id: hash + index,
          index,
          txHash: hash,
        });
      }
      continue;
    }
    if (input.is_account()) {
      const account = input.get_account_identifier();
      // TODO: multisig
      const accountAddr = account
        .to_account_single()
        .to_address(RustModule.WalletV3.AddressDiscrimination.Production);
      const addressHex = Buffer.from(accountAddr.as_bytes()).toString('hex');

      const nextSpendingCounter = getSpendingCounter(
        blockchain,
        addressHex,
      );
      result.push({
        type: 'account',
        address: addressHex,
        amount: input.value().to_str(),
        id: addressHex + nextSpendingCounter.toString(),
        spendingCounter: nextSpendingCounter,
      });
      continue;
    }
    throw new Error(`${nameof(getJormungandrInputs)} unexpected input type ${input.get_type()}`);
  }
  return result;
}
function getOutputs(
  blockchain: Array<RemoteTransaction>,
  outputs: RustModule.WalletV3.Outputs
): Array<RemoteTransactionOutput> {
  const result = [];
  for (let i = 0; i < outputs.size(); i++) {
    const output = outputs.get(i);
    result.push({
      address: Buffer.from(output.address().as_bytes()).toString('hex'),
      amount: output.value().to_str(),
    });
  }
  return result;
}

function getByronInputs(
  blockchain: Array<RemoteTransaction>,
  inputs: Array<TxoPointerType>
): Array<RemoteTransactionInput> {
  const result: Array<RemoteTransactionInput> = [];
  for (const input of inputs) {
    const pointedTx = blockchain.find(tx => tx.hash === input.id);
    if (pointedTx == null) {
      throw new Error(`${nameof(getByronInputs)} no tx found ${input.id}`);
    }
    const pointedOutput = pointedTx.outputs[input.index];
    const addressKind = addressToKind(pointedOutput.address, 'bytes', networks.ByronMainnet);
    if (addressKind === CoreAddressTypes.CARDANO_LEGACY) {
      result.push({
        address: pointedOutput.address,
        amount: pointedOutput.amount,
        id: input.id + input.index,
        index: input.index,
        txHash: input.id,
      });
    } else {
      throw new Error(`${nameof(getByronInputs)} unexpected type ${addressKind}`);
    }
  }
  return result;
}

export function toRemoteByronTx(
  blockchain: Array<RemoteTransaction>,
  request: SignedRequestInternal,
): RemoteTransaction {
  // TODO: this is wrong. Should be V3 transaction parsing
  const signedTx = RustModule.WalletV2.SignedTransaction
    .from_bytes(Buffer.from(request.signedTx, 'base64'));
  const hash = signedTx.id();
  const transaction = signedTx.to_json().tx;

  const base = {
    hash,
    last_update: new Date().toString(),
    tx_state: 'Pending',
    inputs: getByronInputs(blockchain, transaction.inputs),
    outputs: transaction.outputs.map(output => ({
      address: output.address,
      amount: output.value.toString(),
    })),
  };

  return {
    ...base,
    height: null,
    block_hash: null,
    tx_ordinal: null,
    time: null,
    epoch: null,
    slot: null,
  };
}

export function toRemoteJormungandrTx(
  blockchain: Array<RemoteTransaction>,
  request: SignedRequestInternal,
): RemoteTransaction {
  const fragment = RustModule.WalletV3.Fragment
    .from_bytes(Buffer.from(request.signedTx, 'base64'));
  const hash = Buffer.from(fragment.id().as_bytes()).toString('hex');
  const transaction = fragment.get_transaction();

  const base = {
    hash,
    last_update: new Date().toString(),
    tx_state: 'Pending',
    inputs: getJormungandrInputs(blockchain, transaction.inputs()),
    outputs: getOutputs(blockchain, transaction.outputs()),
    certificate: getCertificate(transaction.certificate()),
  };

  return {
    ...base,
    height: null,
    block_hash: null,
    tx_ordinal: null,
    time: null,
    epoch: null,
    slot: null,
  };
}

function getPoolInfoIfMatch(
  tx: RemoteTransaction,
  certificate: RemoteCertificate,
  account: string,
): void | AccountStateDelegation {
  if (certificate.payloadKindId === RustModule.WalletV3.CertificateKind.StakeDelegation) {
    const stakeDelegation = RustModule.WalletV3.StakeDelegation.from_bytes(
      Buffer.from(certificate.payloadHex, 'hex')
    );
    const delegatorAddress = stakeDelegation
      .account()
      .to_account_single() // TODO multisig
      .to_address(RustModule.WalletV3.AddressDiscrimination.Production);

    const certPayloadAddr = Buffer.from(delegatorAddress.as_bytes()).toString('hex');
    if (certPayloadAddr !== account) {
      return undefined;
    }

    const type = stakeDelegation.delegation_type();
    return delegationTypeToResponse(type);
  }
  if (certificate.payloadKindId === RustModule.WalletV3.CertificateKind.OwnerStakeDelegation) {
    if (tx.inputs[0].address !== account) {
      return undefined;
    }
    const ownerStakeDelegation = RustModule.WalletV3.StakeDelegation.from_bytes(
      Buffer.from(certificate.payloadHex, 'hex')
    );
    const type = ownerStakeDelegation.delegation_type();
    return delegationTypeToResponse(type);
  }
  return undefined;
}

function stateForAccount(
  blockchain: Array<RemoteTransaction>,
  account: string,
): AccountStateSuccess | AccountStateFailure {
  {
    try {
      RustModule.WalletV3.Address.from_bytes(
        Buffer.from(account, 'hex')
      );
    } catch (_e) {
      return {
        error: 'Invalid address',
        comment: account,
      };
    }
  }

  let latestCertificate = undefined;
  // iterate backwards through the blockchain backwards to find the latest certificate
  for (let i = blockchain.length - 1; i >= 0; i--) {
    const tx = blockchain[i];
    if (tx.tx_state !== 'Successful') {
      continue;
    }
    const certificate = tx.certificate;
    if (certificate == null) {
      continue;
    }
    latestCertificate = getPoolInfoIfMatch(
      tx,
      certificate,
      account
    );
    if (latestCertificate != null) {
      break;
    }
  }
  const nextSpendingCounter = getSpendingCounter(blockchain, account);
  const value = getAccountBalance(blockchain, account);

  return {
    delegation: latestCertificate == null
      ? { pools: [], }
      : latestCertificate,
    value: value.toNumber(),
    counter: nextSpendingCounter,
  };
}
export function genGetAccountState(
  blockchain: Array<RemoteTransaction>,
): AccountStateFunc {
  return async (
    body: AccountStateRequest,
  ): Promise<AccountStateResponse> => {
    const result: AccountStateResponse = {};
    for (const address of body.addresses) {
      const state = stateForAccount(blockchain, address);
      result[address] = state;
    }
    return result;
  };
}

export function genGetPoolInfo(
  _blockchain: Array<RemoteTransaction>,
): PoolInfoFunc {
  return async (
    body: PoolInfoRequest,
  ): Promise<PoolInfoResponse> => {
    // TODO: scan the chain properly for this information
    const mockPoolId = '312e3d449038372ba2fc3300cfedf1b152ae739201b3e5da47ab3f933a421b62';
    const result: PoolInfoResponse = {};
    for (const poolId of body.ids) {
      if (poolId === mockPoolId) {
        result[mockPoolId] = {
          info: {
            name: 'Foo pool',
            description: 'mock data for testing',
            ticker: 'FOO',
            homepage: 'https://google.com',
          },
          history: [],
          owners: {},
        };
      }
    }
    return result;
  };
}

export function genGetReputation(
): ReputationFunc {
  return async (
    _body: ReputationRequest,
  ): Promise<ReputationResponse> => {
    return {};
  };
}

export function genGetRewardHistory(
): RewardHistoryFunc {
  return async (
    _body: RewardHistoryRequest,
  ): Promise<RewardHistoryResponse> => {
    return {};
  };
}
