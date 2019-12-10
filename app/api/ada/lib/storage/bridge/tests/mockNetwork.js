// @flow

import BigNumber from 'bignumber.js';
import { InputTypes } from '../../../state-fetch/types';
import type {
  FilterUsedRequest, FilterUsedResponse, FilterFunc,
  HistoryRequest, HistoryResponse, HistoryFunc,
  BestBlockRequest, BestBlockResponse, BestBlockFunc,
  AddressUtxoRequest, AddressUtxoResponse, AddressUtxoFunc,
  UtxoSumRequest, UtxoSumResponse, UtxoSumFunc,
  RemoteTransaction, RemoteUnspentOutput
} from '../../../state-fetch/types';
import { RollbackApiError, } from '../../../../errors';
import { addressToKind, groupToSingle, } from '../utils';
import { CoreAddressTypes } from '../../database/primitives/enums';
import type { CoreAddressT } from '../../database/primitives/enums';
import {
  mnemonicToEntropy
} from 'bip39';
import {
  WalletTypePurpose,
} from '../../../../../../config/numbersConfig';

import { RustModule } from '../../../cardanoCrypto/rustLoader';

const protocolMagic = 764824073; // mainnet

export function genCheckAddressesInUse(
  blockchain: Array<RemoteTransaction>,
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
      const oursInTx = ourAddressesInTx(tx, addressSet);
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
): Set<string> {
  const addresses = [
    ...tx.inputs.map(input => input.address),
    ...tx.outputs.map(output => output.address)
  ];
  const addressesUsed = new Set();
  for (const addr of addresses) {
    const kind = addressToKind(addr, 'bytes');
    const payload = kind === CoreAddressTypes.SHELLEY_GROUP
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
): Array<RemoteTransaction> {
  const ownTxs = [];
  for (const tx of txs) {
    const oursInTx = ourAddressesInTx(tx, ownAddresses);
    if (oursInTx.size > 0) {
      ownTxs.push(tx);
    }
  }
  return ownTxs;
}

export function genGetTransactionsHistoryForAddresses(
  blockchain: Array<RemoteTransaction>,
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
      const filtered = filterForOwn(subChain, ownAddresses);
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
      throw new Error('genGetTransactionsHistoryForAddresses cutoffTx not in block - should never happen');
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
    const filtered = filterForOwn(txsToInclude, ownAddresses);
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
          const kind = addressToKind(address, 'bytes');
          if (
            kind !== CoreAddressTypes.CARDANO_LEGACY &&
            kind !== CoreAddressTypes.SHELLEY_SINGLE &&
            kind !== CoreAddressTypes.SHELLEY_GROUP
          ) {
            throw new Error('genUtxoForAddresses non-utxo address in utxo endpoint');
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
): string {
  const bip39entropy = mnemonicToEntropy(mnemonic);
  const EMPTY_PASSWORD = Buffer.from('');
  const rootKey = RustModule.WalletV3.Bip32PrivateKey.from_bip39_entropy(
    Buffer.from(bip39entropy, 'hex'),
    EMPTY_PASSWORD
  );
  const derivedKey = derivePath(rootKey, path);

  if (path[0] === WalletTypePurpose.BIP44) {
    const v2Key = RustModule.WalletV2.PublicKey.from_hex(
      Buffer.from(derivedKey.to_public().as_bytes()).toString('hex')
    );
    const settings = RustModule.WalletV2.BlockchainSettings.from_json({
      protocol_magic: protocolMagic
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
    case CoreAddressTypes.SHELLEY_SINGLE: {
      const addr = RustModule.WalletV3.Address.single_from_public_key(
        derivedKey.to_public().to_raw_key(),
        RustModule.WalletV3.AddressDiscrimination.Production,
      );
      return Buffer.from(addr.as_bytes()).toString('hex');
    }
    case CoreAddressTypes.SHELLEY_ACCOUNT: {
      const addr = RustModule.WalletV3.Address.account_from_public_key(
        derivedKey.to_public().to_raw_key(),
        RustModule.WalletV3.AddressDiscrimination.Production,
      );
      return Buffer.from(addr.as_bytes()).toString('hex');
    }
    case CoreAddressTypes.SHELLEY_GROUP: {
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
    default: throw new Error('getAddressForType unknown type ' + type);
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
