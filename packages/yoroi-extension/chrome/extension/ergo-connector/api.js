// @flow

import type {
  Address,
  Box,
  BoxCandidate,
  Paginate,
  PaginateError,
  PendingTransaction,
  Tx,
  TxId,
  SignedTx,
  Value
} from './types';
import { RustModule } from '../../../app/api/ada/lib/cardanoCrypto/rustLoader';
import type {
  IPublicDeriver
} from '../../../app/api/ada/lib/storage/models/PublicDeriver/interfaces';
import {
  PublicDeriver,
} from '../../../app/api/ada/lib/storage/models/PublicDeriver/index';
import {
  asGetAllUtxos,
  asGetBalance,
  asHasLevels,
  asGetSigningKey,
} from '../../../app/api/ada/lib/storage/models/PublicDeriver/traits';
import { ConceptualWallet } from '../../../app/api/ada/lib/storage/models/ConceptualWallet/index';
import BigNumber from 'bignumber.js';
import { BIP32PrivateKey, } from '../../../app/api/common/lib/crypto/keys/keyRepository';
import { generateKeys } from '../../../app/api/ergo/lib/transactions/utxoTransaction';

import {
  InvalidWitnessError,
  SendTransactionApiError
} from '../../../app/api/common/errors';

import axios from 'axios';

import type { UtxoTxOutput } from '../../../app/api/ada/lib/storage/database/transactionModels/utxo/api/read';

import { CoreAddressTypes } from '../../../app/api/ada/lib/storage/database/primitives/enums';
import { getAllAddressesForDisplay } from '../../../app/api/ada/lib/storage/bridge/traitUtils';

function paginateResults<T>(results: T[], paginate: ?Paginate): T[] | PaginateError {
  if (paginate != null) {
    const startIndex = paginate.page * paginate.limit;
    if (startIndex >= results.length) {
      return {
        maxSize: results.length
      };
    }
    return results.slice(startIndex, Math.min(startIndex + paginate.limit, results.length));
  }
  return results;
}

function bigNumberToValue(x: BigNumber): Value {
  // we could test and return as numbers potentially
  // but we'll keep it as this to make sure the rest of the code is compliant
  return x.toString();
}

function valueToBigNumber(x: Value): BigNumber {
  // constructor takes either string/number this is just here for consisitency
  return new BigNumber(x);
}

export async function connectorGetBalance(
  wallet: PublicDeriver<>,
  pendingTxs: PendingTransaction[],
  tokenId: string
): Promise<Value> {
  if (tokenId === 'ERG') {
    if (pendingTxs.length === 0) {
      // can directly query for balance
      const canGetBalance = asGetBalance(wallet);
      if (canGetBalance != null) {
        const balance = await canGetBalance.getBalance();
        return Promise.resolve(bigNumberToValue(balance.getDefault()));
      }
      throw Error('asGetBalance failed in connectorGetBalance');
    } else {
      // need to filter based on pending txs since they could have been included (or could not)
      const allUtxos = await connectorGetUtxos(wallet, pendingTxs, undefined, tokenId);
      let total = new BigNumber(0);
      // this should never return a PaginateError since we don't supply a Paginate param
      if (allUtxos.maxSize === undefined) {
        for (const box of allUtxos) {
          total = total.plus(valueToBigNumber(box.value));
        }
      }
      return Promise.resolve(bigNumberToValue(total));
    }
  } else {
    const allUtxos = await connectorGetUtxos(wallet, pendingTxs, undefined, tokenId);
    let total = new BigNumber(0);
    // this should never return a PaginateError since we don't supply a Paginate param
    if (allUtxos.maxSize === undefined) {
      for (const box of allUtxos) {
        for (const asset of box.assets) {
          if (asset.tokenId === tokenId) {
            total = total.plus(valueToBigNumber(asset.amount));
          }
        }
      }
    }
    return Promise.resolve(bigNumberToValue(total));
  }
}

function formatUtxoToBox(utxo: { output: $ReadOnly<UtxoTxOutput>, ... }): Box {
    const tx = utxo.output.Transaction;
    const box = utxo.output.UtxoTransactionOutput;
    const tokens = utxo.output.tokens;
    // This doesn't seem right - is there a better way to access this?
    // Or a function that does this for us?
    const ergoToken = tokens.find(t => t.Token.IsDefault);
    if (
      ergoToken == null ||
      box.ErgoCreationHeight == null ||
      box.ErgoBoxId == null ||
      box.ErgoTree == null
    ) {
      throw new Error('missing Ergo fields for Ergo UTXO');
    }
    const assets = [];
    for (const token of tokens) {
      if (!token.Token.IsDefault) {
        assets.push({
          tokenId: token.Token.Identifier,
          amount: token.TokenList.Amount
        });
      }
    }
    return {
      boxId: box.ErgoBoxId,
      ergoTree: box.ErgoTree,
      assets,
      additionalRegisters: box.ErgoRegisters == null ? {} : JSON.parse(box.ErgoRegisters),
      creationHeight: box.ErgoCreationHeight,
      transactionId: tx.Hash,
      index: box.OutputIndex,
      value: parseInt(ergoToken.TokenList.Amount, 10)
    };
}

export async function connectorGetUtxos(
  wallet: PublicDeriver<>,
  pendingTxs: PendingTransaction[],
  valueExpected: ?Value,
  tokenId: ?string,
  paginate: ?Paginate
): Promise<Box[] | PaginateError> {
  const withUtxos = asGetAllUtxos(wallet);
  if (withUtxos == null) {
    throw new Error('wallet doesn\'t support IGetAllUtxos');
  }
  const utxos = await withUtxos.getAllUtxos();
  const spentBoxIds = pendingTxs.flatMap(pending => pending.tx.inputs.map(input => input.boxId));
  // TODO: should we use a different coin selection algorithm besides greedy?
  let utxosToUse = [];
  if (valueExpected != null) {
    let valueAcc = new BigNumber(0);
    const target = valueToBigNumber(valueExpected);
    for (let i = 0; i < utxos.length && valueAcc.isLessThan(target); i += 1) {
      const formatted = formatUtxoToBox(utxos[i]);
      if (!spentBoxIds.includes(formatted.boxId)) {
        if (tokenId === 'ERG') {
          valueAcc = valueAcc.plus(valueToBigNumber(formatted.value));
          utxosToUse.push(formatted);
        } else {
          for (const asset of formatted.assets) {
            if (asset.tokenId === tokenId) {
              valueAcc = valueAcc.plus(valueToBigNumber(asset.amount));
              utxosToUse.push(formatted);
              break;
            }
          }
        }
      }
    }
  } else {
    utxosToUse = utxos.map(formatUtxoToBox).filter(box => !spentBoxIds.includes(box.boxId));
  }
  return Promise.resolve(paginateResults(utxosToUse, paginate));
}

async function getAllAddresses(wallet: PublicDeriver<>, usedFilter: boolean): Promise<Address[]> {
  const p2pk = getAllAddressesForDisplay({
    publicDeriver: wallet,
    type: CoreAddressTypes.ERGO_P2PK
  });
  const p2sh = getAllAddressesForDisplay({
    publicDeriver: wallet,
    type: CoreAddressTypes.ERGO_P2SH
  });
  const p2s = getAllAddressesForDisplay({
    publicDeriver: wallet,
    type: CoreAddressTypes.ERGO_P2S
  });
  await RustModule.load();
  const addresses = (await Promise.all([p2pk, p2sh, p2s]))
    .flat()
    .filter(a => a.isUsed === usedFilter)
    .map(a => RustModule.SigmaRust.NetworkAddress
        .from_bytes(Buffer.from(a.address, 'hex'))
        .to_base58());
  return addresses;
}

export async function connectorGetUsedAddresses(
  wallet: PublicDeriver<>,
  paginate: ?Paginate
): Promise<Address[] | PaginateError> {
  return getAllAddresses(wallet, true).then(addresses => paginateResults(addresses, paginate));
}

export async function connectorGetUnusedAddresses(wallet: PublicDeriver<>): Promise<Address[]> {
  return getAllAddresses(wallet, false);
}

// TODO: look into sigma rust string value support
function processBoxesForSigmaRust(boxes: BoxCandidate[] | Box[]) {
  for (const output of boxes) {
    output.value = parseInt(output.value, 10);
    if (output.value > Number.MAX_SAFE_INTEGER) {
      throw new Error('large values not supported by sigma-rust\'s json parsing code');
    }
    for (const asset of output.assets) {
      asset.amount = parseInt(asset.amount, 10);
      if (asset.amount > Number.MAX_SAFE_INTEGER) {
        throw new Error('large values not supported by sigma-rust\'s json parsing code');
      }
    }
  }
}

export async function connectorSignTx(
  publicDeriver: IPublicDeriver<ConceptualWallet>,
  password: string,
  utxos: any/* IGetAllUtxosResponse */,
  tx: Tx,
  indices: Array<number>
): Promise</* SignedTx */any> {
  const withLevels = asHasLevels(publicDeriver);
  if (withLevels == null) {
    throw new Error('wallet doesn\'t support levels');
  }
  const wallet = asGetSigningKey(withLevels);
  if (wallet == null) {
    throw new Error('wallet doesn\'t support signing');
  }
  await RustModule.load();
  let wasmTx;
  try {
    processBoxesForSigmaRust(tx.outputs);
    wasmTx = RustModule.SigmaRust.UnsignedTransaction.from_json(JSON.stringify(tx));
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(`tx parse error: ${e}`);
    throw e;
  }
  const boxIdsToSign = [];
  for (const index of indices) {
    const input = tx.inputs[index];
    boxIdsToSign.push(input.boxId);
  }

  const utxosToSign = utxos.filter(
    utxo => boxIdsToSign.includes(utxo.output.UtxoTransactionOutput.ErgoBoxId)
  );

  const signingKey = await wallet.getSigningKey();
  const normalizedKey = await wallet.normalizeKey({
    ...signingKey,
    password,
  });
  const finalSigningKey = BIP32PrivateKey.fromBuffer(
    Buffer.from(normalizedKey.prvKeyHex, 'hex')
  );
  const wasmKeys = generateKeys({
    senderUtxos: utxosToSign,
    keyLevel: wallet.getParent().getPublicDeriverLevel(),
    signingKey: finalSigningKey,
  });
  const jsonBoxesToSign = utxosToSign.map(formatUtxoToBox);
  processBoxesForSigmaRust(jsonBoxesToSign);
  const txBoxesToSign = RustModule.SigmaRust.ErgoBoxes.from_boxes_json(jsonBoxesToSign);
  const signedTx = RustModule.SigmaRust.Wallet
    .from_secrets(wasmKeys)
    .sign_transaction(
      RustModule.SigmaRust.ErgoStateContext.dummy(), // TODO? Not implemented in sigma-rust
      wasmTx,
      txBoxesToSign,
      RustModule.SigmaRust.ErgoBoxes.from_boxes_json([]), // TODO: not supported by sigma-rust
    );
  return signedTx.to_json();
}

export async function connectorSendTx(
  wallet: IPublicDeriver</* ConceptualWallet */>,
  pendingTxs: PendingTransaction[],
  tx: SignedTx
): Promise<TxId> {
  const network = wallet.getParent().getNetworkInfo();
  const backend = network.Backend.BackendService;
  if (backend == null) {
    throw new Error('connectorSendTx: missing backend url');
  }
  return axios(
    `${backend}/api/txs/signed`,
    {
      method: 'post',
      // 2 * CONFIG.app.walletRefreshInterval,
      timeout: 2 * 20000,
      data: tx,
      // headers: {
      //   'yoroi-version': this.getLastLaunchVersion(),
      //   'yoroi-locale': this.getCurrentLocale()
      // }
    }
  ).then(response => {
    pendingTxs.push({
      tx,
      submittedTime: new Date()
    });
    return Promise.resolve(response.data.id);
  })
    .catch((error) => {
      if (error.request.response.includes('Invalid witness')) {
        throw new InvalidWitnessError();
      }
      throw new SendTransactionApiError();
    });
}

// TODO: generic data sign
