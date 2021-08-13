// @flow

import type {
  Address,
  Paginate,
  PendingTransaction,
  TokenId,
  Tx,
  TxId,
  SignedTx,
  Value
} from './types';
import { ConnectorError } from './types';
import { RustModule } from '../../../app/api/ada/lib/cardanoCrypto/rustLoader';
import type {
  IPublicDeriver,
  IGetAllUtxosResponse
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
  SendTransactionApiError
} from '../../../app/api/common/errors';

import axios from 'axios';

import { asAddressedUtxo, toErgoBoxJSON } from '../../../app/api/ergo/lib/transactions/utils';
import { CoreAddressTypes } from '../../../app/api/ada/lib/storage/database/primitives/enums';
import { getAllAddressesForDisplay } from '../../../app/api/ada/lib/storage/bridge/traitUtils';
import { getReceiveAddress } from '../../../app/stores/stateless/addressStores';

import LocalStorageApi from '../../../app/api/localStorage/index';

import type { BestBlockResponse } from '../../../app/api/ergo/lib/state-fetch/types';
import { asAddressedUtxo as  asAddressedUtxoCardano } from '../../../app/api/ada/transactions/utils';
import type { RemoteUnspentOutput } from '../../../app/api/ada/lib/state-fetch/types'

function paginateResults<T>(results: T[], paginate: ?Paginate): T[] {
  if (paginate != null) {
    const startIndex = paginate.page * paginate.limit;
    if (startIndex >= results.length) {
      throw new ConnectorError({
        maxSize: results.length
      });
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
  return new BigNumber(x);
}

export async function connectorGetBalance(
  wallet: PublicDeriver<>,
  pendingTxs: PendingTransaction[],
  tokenId: TokenId
): Promise<Value> {
  if (tokenId === 'ERG' || tokenId === 'ADA') {
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
      const allUtxos = await connectorGetUtxosErgo(wallet, pendingTxs, null, tokenId);
      let total = new BigNumber(0);
      for (const box of allUtxos) {
        total = total.plus(valueToBigNumber(box.value));
      }
      return Promise.resolve(bigNumberToValue(total));
    }
  } else {
    const allUtxos = await connectorGetUtxosErgo(wallet, pendingTxs, null, tokenId);
    let total = new BigNumber(0);
    for (const box of allUtxos) {
      for (const asset of box.assets) {
        if (asset.tokenId === tokenId) {
          total = total.plus(valueToBigNumber(asset.amount));
        }
      }
    }
    return Promise.resolve(bigNumberToValue(total));
  }
}

function formatUtxoToBoxErgo(utxo: ElementOf<IGetAllUtxosResponse>): ErgoBoxJson {
  // eslint-disable-next-line no-unused-vars
  const { addressing, ...rest } = asAddressedUtxo(utxo);
  return toErgoBoxJSON(rest);
}

export async function connectorGetUtxosErgo(
  wallet: PublicDeriver<>,
  pendingTxs: PendingTransaction[],
  valueExpected: ?Value,
  tokenId: TokenId,
  paginate: ?Paginate
): Promise<ErgoBoxJson[]> {
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
      const formatted = formatUtxoToBoxErgo(utxos[i]) 
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
    utxosToUse = utxos.map(formatUtxoToBoxErgo).filter(box => !spentBoxIds.includes(box.boxId));
  }
  return Promise.resolve(paginateResults(utxosToUse, paginate));
}

export async function connectorGetUtxosCardano(
  wallet: PublicDeriver<>,
  pendingTxs: PendingTransaction[],
  valueExpected: ?Value,
  tokenId: TokenId,
  paginate: ?Paginate
): Promise<Array<RemoteUnspentOutput>> {
  const withUtxos = asGetAllUtxos(wallet);
  if (withUtxos == null) {
    throw new Error('wallet doesn\'t support IGetAllUtxos');
  }
  const utxos = await withUtxos.getAllUtxos();
  const utxosToUse = []
  const formattedUtxos = asAddressedUtxoCardano(utxos).map(u => {
    // eslint-disable-next-line no-unused-vars
    const { addressing, ...rest } = u
    return rest
  })
  let valueAcc = new BigNumber(0);
  for(const formatted of formattedUtxos){
    if (tokenId === 'ADA') {
      valueAcc = valueAcc.plus(valueToBigNumber(formatted.amount));
      utxosToUse.push(formatted);
    } else {
      for (const asset of formatted.assets) {
        if (asset.assetId === tokenId) {
          valueAcc = valueAcc.plus(valueToBigNumber(asset.amount));
          utxosToUse.push(formatted);
          break;
        }
      }
    }
  }

  return Promise.resolve(paginateResults(formattedUtxos, paginate))
}

async function getAllAddresses(wallet: PublicDeriver<>, usedFilter: boolean): Promise<Address[]> { 
  const ergoAddressTypes = [
    CoreAddressTypes.ERGO_P2PK, 
    CoreAddressTypes.ERGO_P2SH, 
    CoreAddressTypes.ERGO_P2S
  ]
  const cardanoAddressTypes = [
    CoreAddressTypes.CARDANO_BASE, 
    CoreAddressTypes.CARDANO_ENTERPRISE, 
    CoreAddressTypes.CARDANO_LEGACY,
    CoreAddressTypes.CARDANO_PTR,
    CoreAddressTypes.CARDANO_REWARD
  ]
  const walletType = wallet.parent.defaultToken.Metadata.type
  const selectedAddressesTypes = walletType === 'Cardano' ? cardanoAddressTypes : ergoAddressTypes
  const allAddressesResult = []
  for(const type of selectedAddressesTypes){
    const result = getAllAddressesForDisplay({
      publicDeriver: wallet,
      type,
    });
    allAddressesResult.push(result)
  }
  await RustModule.load();
  let addresses = (await Promise.all([...allAddressesResult]))
    .flat()
    .filter(a => a.isUsed === usedFilter)
    // @note: from_bytes returns Ergo tree
    // will throw an error when used on cardano addresses 
    // .map(a => RustModule.SigmaRust.NetworkAddress
    //     .from_bytes(Buffer.from(a.address, 'hex'))
    //     .to_base58());
    // .map(a => a.address)

    if(walletType === 'Cardano') {
      // Cardano does not have a function to convert from bytes to_base58
      // @note the code blow throw an error 
      // addresses = addresses.map(
      //   a => RustModule.WalletV4.ScriptHash.from_bytes(Buffer.from(a.address, 'hex')).to_base58()
      // )
      addresses = addresses.map(a => a.address)
    } else {
      addresses =  addresses.map(a => RustModule.SigmaRust.NetworkAddress
        .from_bytes(Buffer.from(a.address, 'hex'))
        .to_base58());
    }

  return addresses;
}

export async function connectorGetUsedAddresses(
  wallet: PublicDeriver<>,
  paginate: ?Paginate
): Promise<Address[]> {
  return getAllAddresses(wallet, true).then(addresses => paginateResults(addresses, paginate));
}

export async function connectorGetUnusedAddresses(wallet: PublicDeriver<>): Promise<Address[]> {
  return getAllAddresses(wallet, false);
}

export async function connectorGetChangeAddress(wallet: PublicDeriver<>): Promise<Address> {
  const change = await getReceiveAddress(wallet);
  if (change !== undefined) {
    const hash = change.addr.Hash;
    await RustModule.load();
    // Note: SimgaRust only works for ergo
    // RustModule.walletV2 works for cardano but doesn't not have from_bytes and to_base58 methods
    const walletType = wallet.parent.defaultToken.Metadata.type

    if(walletType === 'Cardano') {
      return hash
    }
    return RustModule.SigmaRust.NetworkAddress
        .from_bytes(Buffer.from(hash, 'hex'))
        .to_base58();
  }
  throw new Error('could not get change address - this should never happen');
}

export type BoxLike = {
  value: number | string,
  assets: Array<{|
    tokenId: string, // hex
    amount: number | string,
  |}>,
  ...
}

export async function connectorSignTx(
  publicDeriver: IPublicDeriver<ConceptualWallet>,
  password: string,
  utxos: any/* IGetAllUtxosResponse */,
  bestBlock: BestBlockResponse,
  tx: Tx,
  indices: Array<number>
): Promise<ErgoTxJson> {
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
    wasmTx = RustModule.SigmaRust.UnsignedTransaction.from_json(JSON.stringify(tx));
  } catch (e) {
    throw ConnectorError.invalidRequest(`Invalid tx - could not parse JSON: ${e}`);
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
  const jsonBoxesToSign: Array<ErgoBoxJson> =
    // $FlowFixMe[prop-missing]: our inputs are nearly like `ErgoBoxJson` just with one extra field
    tx.inputs.filter((box, index) => indices.includes(index));
  const txBoxesToSign = RustModule.SigmaRust.ErgoBoxes.from_boxes_json(jsonBoxesToSign);
  const dataBoxIds = tx.dataInputs.map(box => box.boxId);
  const dataInputs = utxos.filter(
    utxo => dataBoxIds.includes(utxo.output.UtxoTransactionOutput.ErgoBoxId)
  ).map(formatUtxoToBoxErgo);
  // We could modify the best block backend to return this information for the previous block
  // but I'm guessing that votes of the previous block isn't useful for the current one
  // and I'm also unsure if any of these 3 would impact signing or not.
  // Maybe version would later be used in the ergoscript context?
  const headerJson = JSON.stringify({
    version: 2, // TODO: where to get version? (does this impact signing?)
    parentId: bestBlock.hash,
    timestamp: Date.now(),
    nBits: 682315684511744, // TODO: where to get difficulty? (does this impact signing?)
    height: bestBlock.height + 1,
    votes: '040000', // TODO: where to get votes? (does this impact signing?)
  });
  const blockHeader = RustModule.SigmaRust.BlockHeader.from_json(headerJson);
  const preHeader = RustModule.SigmaRust.PreHeader.from_block_header(blockHeader);
  const signedTx = RustModule.SigmaRust.Wallet
    .from_secrets(wasmKeys)
    .sign_transaction(
      new RustModule.SigmaRust.ErgoStateContext(preHeader),
      wasmTx,
      txBoxesToSign,
      RustModule.SigmaRust.ErgoBoxes.from_boxes_json(dataInputs),
    );
  return signedTx.to_json();
}

export async function connectorSendTx(
  wallet: IPublicDeriver</* ConceptualWallet */>,
  pendingTxs: PendingTransaction[],
  tx: SignedTx,
  localStorage: LocalStorageApi,
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
      headers: {
        'yoroi-version': await localStorage.getLastLaunchVersion(),
        'yoroi-locale': await localStorage.getUserLocale()
      }
    }
  ).then(response => {
    pendingTxs.push({
      tx,
      submittedTime: new Date()
    });
    return Promise.resolve(response.data.id);
  })
    .catch((_error) => {
      throw new SendTransactionApiError();
    });
}

// TODO: generic data sign
