// @flow

import BigNumber from 'bignumber.js';
import type {
  HistoryRequest, HistoryResponse, HistoryFunc,
  BestBlockRequest, BestBlockResponse, BestBlockFunc,
  AddressUtxoRequest, AddressUtxoResponse, AddressUtxoFunc,
  AssetInfoRequest, AssetInfoResponse, AssetInfoFunc,
  UtxoSumRequest, UtxoSumResponse, UtxoSumFunc,
  RemoteErgoTransaction, RemoteUnspentOutput,
  SignedRequest,
} from './types';
import type {
  FilterUsedRequest, FilterUsedResponse, FilterFunc,
} from '../../../common/lib/state-fetch/currencySpecificTypes';
import type { NetworkRow } from '../../../ada/lib/storage/database/primitives/tables';
import {
  WalletTypePurpose,
} from '../../../../config/numbersConfig';
import {
  generateWalletRootKey,
} from '../crypto/wallet';
import { derivePath } from '../../../common/lib/crypto/keys/keyRepository';
import { RollbackApiError, } from '../../../common/errors';
import { getErgoBaseConfig } from '../../../ada/lib/storage/database/prepackaged/networks';
import { RustModule } from '../../../ada/lib/cardanoCrypto/rustLoader';

// note: this function assumes mainnet
export function getErgoAddress(
  mnemonic: string,
  path: Array<number>,
): RustModule.SigmaRust.NetworkAddress {
  const rootKey = generateWalletRootKey(mnemonic);
  const derivedKey = derivePath(rootKey, path);

  if (path[0] === WalletTypePurpose.BIP44) {
    return RustModule.SigmaRust.NetworkAddress.new(
      RustModule.SigmaRust.NetworkPrefix.Mainnet,
      RustModule.SigmaRust.Address.from_public_key(
        derivedKey.toPublic().key.publicKey
      )
    );
  }
  throw new Error('Unexpected purpose');
}

export function genCheckAddressesInUse(
  blockchain: Array<RemoteErgoTransaction>,
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
  tx: RemoteErgoTransaction,
  ownAddresses: Set<string>,
  _network: $ReadOnly<NetworkRow>,
): Set<string> {
  const addresses = [
    ...tx.inputs.map(input => input.address),
    ...tx.outputs.map(output => output.address)
  ];
  const addressesUsed = new Set();
  for (const addr of addresses) {
    if (ownAddresses.has(addr)) {
      addressesUsed.add(addr);
    }
  }
  return addressesUsed;
}

function filterForOwn(
  txs: Array<RemoteErgoTransaction>,
  ownAddresses: Set<string>,
  network: $ReadOnly<NetworkRow>,
): Array<RemoteErgoTransaction> {
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
  blockchain: Array<RemoteErgoTransaction>,
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
    if (cutoffTx.block_num == null || cutoffTx.tx_ordinal == null) {
      throw new Error(`${nameof(genGetTransactionsHistoryForAddresses)} cutoffTx not in block - should never happen`);
    }
    const cutoffBlockNum = cutoffTx.block_num;
    const cutoffOrdinal = cutoffTx.tx_ordinal;

    const txsToInclude: Array<RemoteErgoTransaction> = [];
    for (const tx of subChain) {
      if (tx === cutoffTx) continue;
      if (tx.block_num == null || tx.tx_ordinal == null) {
        txsToInclude.push(tx);
        continue;
      } else {
        const blockNum = tx.block_num;
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
  blockchain: Array<RemoteErgoTransaction>,
): BestBlockFunc {
  return async (
    _body: BestBlockRequest,
  ): Promise<BestBlockResponse> => {
    let bestInNetwork: void | BestBlockResponse = undefined;
    for (let i = blockchain.length - 1; i >= 0; i--) {
      const block = blockchain[i];
      if (
        block.block_num != null &&
        block.block_hash != null
      ) {
        bestInNetwork = {
          epoch: 0, // TODO
          slot: 0, // TODO
          hash: block.block_hash,
          height: block.block_num,
        };
        break;
      }
    }
    if (bestInNetwork == null) {
      return {
        height: 0,
        epoch: 0,
        slot: 0,
        hash: null,
      };
    }
    return bestInNetwork;
  };
}

export function genGetAssetInfo(
  _blockchain: Array<RemoteErgoTransaction>,
): AssetInfoFunc {
  return async (
    _body: AssetInfoRequest,
  ): Promise<AssetInfoResponse> => {
    return {}; // TODO
  };
}

export function genUtxoForAddresses(
  getHistory: HistoryFunc,
  getBestBlock: BestBlockFunc,
  network: $ReadOnly<NetworkRow>,
): AddressUtxoFunc {
  return async (
    body: AddressUtxoRequest,
  ): Promise<AddressUtxoResponse> => {
    const bestBlock = await getBestBlock({
      network,
    });
    if (bestBlock.hash == null) {
      return [];
    }
    const until = bestBlock.hash;
    const history = await getHistory({
      network,
      addresses: body.addresses,
      untilBlock: until,
    });
    const inBlockHistory = history.filter(tx => tx.block_hash != null);
    const ourAddressSet = new Set(body.addresses);

    const utxoMap = new Map<string, $ReadOnly<RemoteUnspentOutput>>();
    for (const tx of inBlockHistory) {
      for (let j = 0; j < tx.outputs.length; j++) {
        const address = tx.outputs[j].address;
        if (ourAddressSet.has(address)) {
          const key = JSON.stringify({
            id: tx.hash,
            index: j
          });
          utxoMap.set(key, {
            tx_hash: tx.hash,
            tx_index: j,
            receiver: tx.outputs[j].address,
            amount: tx.outputs[j].value.toString(),
            creationHeight: tx.outputs[j].creationHeight,
            boxId: tx.outputs[j].id,
            assets: tx.outputs[j].assets,
            additionalRegisters: tx.outputs[j].additionalRegisters,
            ergoTree: tx.outputs[j].ergoTree,
          });
        }
      }
    }
    for (const tx of inBlockHistory) {
      for (let j = 0; j < tx.inputs.length; j++) {
        const input = tx.inputs[j];
        const key = JSON.stringify({
          id: input.id,
          index: input.outputIndex,
        });
        utxoMap.delete(key);
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
      return { sum: '0' };
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

export function toRemoteErgoTx(
  blockchain: Array<RemoteErgoTransaction>,
  request: SignedRequest,
  network: $ReadOnly<NetworkRow>,
): RemoteErgoTransaction {
  // TODO: ergo-ts didn't support calculating the ID for a transaction, so we just leave it blank
  const txHash = request.id ?? '';

  const baseConfig = getErgoBaseConfig(network)
    .reduce((acc, next) => Object.assign(acc, next), {});

  const mappedOutputs = [];
  for (let i = 0; i < request.outputs.length; i++) {
    const output = request.outputs[i];

    mappedOutputs.push({
      additionalRegisters: output.additionalRegisters,
      address: RustModule.SigmaRust.NetworkAddress.new(
        (Number.parseInt(baseConfig.ChainNetworkId, 10): any),
        RustModule.SigmaRust.Address.recreate_from_ergo_tree(
          RustModule.SigmaRust.ErgoTree.from_base16_bytes(output.ergoTree)
        )
      ).to_base58(),
      assets: output.assets ?? [],
      creationHeight: output.creationHeight,
      ergoTree: output.ergoTree,
      id: output.boxId ?? '', // TODO: calculate if undefined
      txId: txHash,
      index: i,
      mainChain: true,
      spentTransactionId: null,
      value: output.value,
    });
  }

  const findOutput = (boxId) => {
    for (const tx of blockchain) {
      for (const output of tx.outputs) {
        if (output.id === boxId) {
          return output;
        }
      }
    }
    throw new Error(`${nameof(toRemoteErgoTx)} No output found for input ${boxId}`);
  };
  const mapInput = (boxId, index) => {
    const output = findOutput(boxId);

    return {
      address: output.address,
      id: output.id,
      outputTransactionId: output.txId,
      index,
      outputIndex: output.index,
      transactionId: txHash,
      value: output.value,
      assets: output.assets,
    };
  };
  return {
    hash: txHash,
    tx_state: 'Pending',
    inputs: request.inputs.map((input, i) => ({
      ...mapInput(input.boxId, i),
      spendingProof: input.spendingProof.proofBytes,
    })),
    dataInputs: request.dataInputs.map((input, i) => ({
      ...mapInput(input.boxId, i),
    })),
    outputs: mappedOutputs,
    block_num: null,
    block_hash: null,
    tx_ordinal: null,
    time: new Date().toISOString(),
  };
}
