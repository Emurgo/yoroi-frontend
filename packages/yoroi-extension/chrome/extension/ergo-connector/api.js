// @flow

import type {
  Address,
  Paginate,
  PendingTransaction,
  TokenId,
  Tx,
  TxId,
  SignedTx,
  Value,
  CardanoTx,
} from './types';
import { ConnectorError } from './types';
import { RustModule } from '../../../app/api/ada/lib/cardanoCrypto/rustLoader';
import type {
  IGetAllUtxosResponse,
  IPublicDeriver
} from '../../../app/api/ada/lib/storage/models/PublicDeriver/interfaces';
import { PublicDeriver, } from '../../../app/api/ada/lib/storage/models/PublicDeriver/index';
import {
  asGetAllUtxos,
  asGetBalance,
  asGetSigningKey,
  asHasLevels,
  asHasUtxoChains,
} from '../../../app/api/ada/lib/storage/models/PublicDeriver/traits';
import { ConceptualWallet } from '../../../app/api/ada/lib/storage/models/ConceptualWallet/index';
import BigNumber from 'bignumber.js';
import JSONBigInt from 'json-bigint';
import { BIP32PrivateKey, } from '../../../app/api/common/lib/crypto/keys/keyRepository';
import { extractP2sKeyFromErgoTree, generateKey, } from '../../../app/api/ergo/lib/transactions/utxoTransaction';

import { SendTransactionApiError } from '../../../app/api/common/errors';

import axios from 'axios';
import keyBy from 'lodash/keyBy';
import cloneDeep from 'lodash/cloneDeep';

import { asAddressedUtxo, toErgoBoxJSON } from '../../../app/api/ergo/lib/transactions/utils';
import { CoreAddressTypes } from '../../../app/api/ada/lib/storage/database/primitives/enums';
import type { FullAddressPayload } from '../../../app/api/ada/lib/storage/bridge/traitUtils';
import { getAllAddressesForDisplay } from '../../../app/api/ada/lib/storage/bridge/traitUtils';
import { getReceiveAddress } from '../../../app/stores/stateless/addressStores';

import LocalStorageApi from '../../../app/api/localStorage/index';

import type { BestBlockResponse } from '../../../app/api/ergo/lib/state-fetch/types';
import { asAddressedUtxo as asAddressedUtxoCardano } from '../../../app/api/ada/transactions/utils';
import type { RemoteUnspentOutput } from '../../../app/api/ada/lib/state-fetch/types'
import {
  signTransaction as shelleySignTransaction
} from '../../../app/api/ada/transactions/shelley/transactions';
import {
  getCardanoHaskellBaseConfig,
} from '../../../app/api/ada/lib/storage/database/prepackaged/networks';
import { genTimeToSlot } from '../../../app/api/ada/lib/storage/bridge/timeUtils';
import AdaApi from '../../../app/api/ada';
import type CardanoTxRequest from '../../../app/api/ada';

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
  if (tokenId === 'ERG' || tokenId === 'ADA' || tokenId === 'TADA') {
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
  const utxosToUse = [];
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
    const filtered = utxos.map(formatUtxoToBoxErgo).filter(box => !spentBoxIds.includes(box.boxId));
    utxosToUse.push(...filtered);
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
    if (tokenId === 'ADA' || tokenId === 'TADA') {
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

export type FullAddressPayloadWithBase58 = {|
  fullAddress: FullAddressPayload,
  base58: Address,
|};

function ergoAddressToBase58(a: FullAddressPayload): string {
  return RustModule.SigmaRust.NetworkAddress
    .from_bytes(Buffer.from(a.address, 'hex'))
    .to_base58()
}

async function getAllFullAddresses(
  wallet: IPublicDeriver<>,
  usedFilter: boolean,
): Promise<FullAddressPayloadWithBase58[]> {
  const isCardano = wallet.getParent().defaultToken.Metadata.type === 'Cardano';
  const addressTypes = isCardano ? [
    CoreAddressTypes.CARDANO_BASE,
    CoreAddressTypes.CARDANO_ENTERPRISE,
    CoreAddressTypes.CARDANO_LEGACY,
    CoreAddressTypes.CARDANO_PTR,
    CoreAddressTypes.CARDANO_REWARD
  ] : [
    CoreAddressTypes.ERGO_P2PK,
    CoreAddressTypes.ERGO_P2SH,
    CoreAddressTypes.ERGO_P2S
  ]
  const promises = addressTypes
    .map(type => getAllAddressesForDisplay({ publicDeriver: wallet, type }));
  await RustModule.load();
  const addresses: FullAddressPayload[] =
    (await Promise.all(promises)).flat();
  return addresses
    .filter(a => a.isUsed === usedFilter)
    .map(a => {
      const base58 = isCardano ? a.address : ergoAddressToBase58(a);
      return {
        fullAddress: a,
        base58,
      };
    });
}

async function getAllAddresses(wallet: PublicDeriver<>, usedFilter: boolean): Promise<Address[]> {
  return getAllFullAddresses(wallet, usedFilter)
    .then(arr => arr.map(a => a.base58));
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

function extractAddressPK(addressBase58: string) {
  return RustModule.SigmaRust.Address
    .from_base58(addressBase58)
    .to_ergo_tree()
    .to_base16_bytes()
    .replace(/^0008cd/, '');
}

function addressesToPkMap(addresses: Array<FullAddressPayloadWithBase58>) {
  return addresses.reduce((res, a) => {
    const addressPk = extractAddressPK(a.base58);
    return ({ ...res, [addressPk]: a });
  }, {});
}

function createP2sAddressTreeMatcher(
  addressesGetter: () => Promise<Array<FullAddressPayloadWithBase58>>,
): (
  string => Promise<{| isP2S: boolean, matchingAddress: ?FullAddressPayloadWithBase58 |}>
) {
  const keyAddressMapHolder = [];
  return async ergoTree => {
    const key: ?string = extractP2sKeyFromErgoTree(ergoTree);
    if (key == null) {
      return { isP2S: false, matchingAddress: null };
    }
    if (!keyAddressMapHolder[0]) {
      keyAddressMapHolder[0] = addressesToPkMap(await addressesGetter());
    }
    return { isP2S: true, matchingAddress: keyAddressMapHolder[0][key] };
  };
}

function createMockHeader(bestBlock) {
  // We could modify the best block backend to return this information for the previous block
  // but I'm guessing that votes of the previous block isn't useful for the current one
  // and I'm also unsure if any of these 3 would impact signing or not.
  // Maybe version would later be used in the ergoscript context?
  return JSON.stringify({
    version: 2, // TODO: where to get version? (does this impact signing?)
    parentId: bestBlock.hash,
    timestamp: Date.now(),
    nBits: 682315684511744, // TODO: where to get difficulty? (does this impact signing?)
    height: bestBlock.height + 1,
    votes: '040000', // TODO: where to get votes? (does this impact signing?)
    id: '4caa17e62fe66ba7bd69597afdc996ae35b1ff12e0ba90c22ff288a4de10e91b',
    stateRoot: '8ad868627ea4f7de6e2a2fe3f98fafe57f914e0f2ef3331c006def36c697f92713',
    adProofsRoot: 'd882aaf42e0a95eb95fcce5c3705adf758e591532f733efe790ac3c404730c39',
    transactionsRoot: '63eaa9aff76a1de3d71c81e4b2d92e8d97ae572a8e9ab9e66599ed0912dd2f8b',
    extensionHash: '3f91f3c680beb26615fdec251aee3f81aaf5a02740806c167c0f3c929471df44',
  });
}

function validateWalletForSigning(publicDeriver) {
  const withLevels = asHasLevels(publicDeriver);
  if (withLevels == null) {
    throw new Error('wallet doesn\'t support levels');
  }
  const wallet = asGetSigningKey(withLevels);
  if (wallet == null) {
    throw new Error('wallet doesn\'t support signing');
  }
  return wallet;
}

function parseWasmTx(tx) {
  try {
    return RustModule.SigmaRust.UnsignedTransaction.from_json(JSON.stringify(tx));
  } catch (e) {
    throw ConnectorError.invalidRequest(`Invalid tx - could not parse JSON: ${e}`);
  }
}

export async function connectorSignTx(
  publicDeriver: IPublicDeriver<ConceptualWallet>,
  password: string,
  utxos: any/* IGetAllUtxosResponse */,
  bestBlock: BestBlockResponse,
  tx: Tx,
  indices: Array<number>
): Promise<ErgoTxJson> {

  const debug = (t: string, s: string, ...ps: *) => {
    // eslint-disable-next-line no-console
    console.debug(`[connectorSignTx][${t}] ${s} > `, ...((ps||[]).map(cloneDeep)));
  };

  debug('args', 'tx', tx);
  debug('args', 'utxos', utxos);

  const wallet = validateWalletForSigning(publicDeriver);

  await RustModule.load();
  const wasmTx = parseWasmTx(tx);

  const utxoMap = keyBy(utxos,
    u => u.output.UtxoTransactionOutput.ErgoBoxId);

  const selectedInputs: Array<ErgoBoxJson> = []
  for (const index of indices) {
    const input = tx.inputs[index];
    // $FlowFixMe[prop-missing]
    selectedInputs.push(input);
  }

  const dataInputs = tx.dataInputs.map(box => {
    const utxo = utxoMap[box.boxId];
    if (!utxo) {
      throw new Error(`Data-input ${box.boxId}, no matching UTxO found!`);
    }
    return formatUtxoToBoxErgo(utxo);
  });

  // SIGNING INPUTS //

  const p2sMatcher = createP2sAddressTreeMatcher(
    () => getAllFullAddresses(publicDeriver, true),
  );

  const signingKey = await wallet.getSigningKey()
    .then(key => wallet.normalizeKey({ ...key, password }))
    .then(key => BIP32PrivateKey.fromBuffer(Buffer.from(key.prvKeyHex, 'hex')));

  const keyLevel = wallet.getParent().getPublicDeriverLevel();
  const inputSigningKeys = new RustModule.SigmaRust.SecretKeys();
  for (const input of selectedInputs) {
    const inputId = input.boxId;
    debug('signing', 'Signing input ID', inputId);
    const utxo = utxoMap[inputId];
    if (utxo) {
      debug('signing', 'UTxO found, regular signature');
      inputSigningKeys.add(generateKey({ addressing: utxo, keyLevel, signingKey }));
    } else {
      debug('signing', 'No UTxO found! Checking if input is P2S');
      const { isP2S, matchingAddress } = await p2sMatcher(input.ergoTree);
      if (isP2S) {
        if (!matchingAddress) {
          throw new Error(`Input ${inputId} is a P2S, but no matching address is found in wallet!`);
        }
        debug('signing', 'Input is a P2S with valid matching address', matchingAddress);
        const { fullAddress } = matchingAddress;
        inputSigningKeys.add(generateKey({ addressing: fullAddress, keyLevel, signingKey }));
      } else {
        throw new Error(`Input ${inputId} is not recognised! No matching UTxO found and is not P2S!`)
      }
    }
  }

  debug('signing', 'Produced input keys', inputSigningKeys.len(), inputSigningKeys);

  const blockHeader = RustModule.SigmaRust.BlockHeader.from_json(createMockHeader(bestBlock));
  const preHeader = RustModule.SigmaRust.PreHeader.from_block_header(blockHeader);
  const ergoStateContext = new RustModule.SigmaRust.ErgoStateContext(preHeader);
  const txBoxesToSpend = RustModule.SigmaRust.ErgoBoxes.from_boxes_json(selectedInputs);
  const dataBoxesToSpend = RustModule.SigmaRust.ErgoBoxes.from_boxes_json(dataInputs);

  const signedTx = RustModule.SigmaRust.Wallet
    .from_secrets(inputSigningKeys)
    .sign_transaction(
      ergoStateContext,
      wasmTx,
      txBoxesToSpend,
      dataBoxesToSpend,
    );
  debug('signedTx', '', signedTx);

  const json = JSONBigInt.parse(signedTx.to_json());
  return {
    id: json.id,
    inputs: json.inputs,
    dataInputs: json.dataInputs,
    outputs: json.outputs.map(output => ({
      boxId: output.boxId,
      value: output.value.toString(),
      ergoTree: output.ergoTree,
      assets: output.assets.map(asset => ({
        tokenId: asset.tokenId,
        amount: asset.amount.toString(),
      })),
      additionalRegisters: output.additionalRegisters,
      creationHeight: output.creationHeight,
      transactionId: output.transactionId,
      index: output.index
    })),
  };
}

export async function connectorSignCardanoTx(
  publicDeriver: IPublicDeriver<ConceptualWallet>,
  password: string,
  tx: CardanoTx,
): Promise<string> {
  // eslint-disable-next-line no-unused-vars
  const { tx: txHex, partialSign } = tx;

  const txBody = RustModule.WalletV4.TransactionBody.from_bytes(
    Buffer.from(txHex, 'hex')
  );

  const withUtxos = asGetAllUtxos(publicDeriver);
  if (withUtxos == null) {
    throw new Error(`missing utxo functionality`);
  }

  const withHasUtxoChains = asHasUtxoChains(withUtxos);
  if (withHasUtxoChains == null) {
    throw new Error(`missing chains functionality`);
  }
  const utxos = await withHasUtxoChains.getAllUtxos();
  const addressedUtxos = asAddressedUtxoCardano(utxos);

  const withLevels = asHasLevels<ConceptualWallet>(publicDeriver);
  if (!withLevels) {
    throw new Error(`can't get level`);
  }

  const withSigningKey = asGetSigningKey(publicDeriver);
  if (!withSigningKey) {
    throw new Error('expect to be able to get signing key');
  }
  const signingKey = await withSigningKey.getSigningKey();
  const normalizedKey = await withSigningKey.normalizeKey({
    ...signingKey,
    password,
  });
  const utxoIdSet: Set<string> = new Set();
  for (let i = 0; i < txBody.inputs().len(); i++) {
    const input = txBody.inputs().get(i);
    utxoIdSet.add(
      Buffer.from(input.transaction_id().to_bytes()).toString('hex') +
      String(input.index())
    );
  }
  const usedUtxos = addressedUtxos.filter(utxo =>
    utxoIdSet.has(utxo.utxo_id)
  );
  const signedTx = shelleySignTransaction(
    usedUtxos,
    txBody,
    withLevels.getParent().getPublicDeriverLevel(),
    RustModule.WalletV4.Bip32PrivateKey.from_bytes(
      Buffer.from(normalizedKey.prvKeyHex, 'hex')
    ),
    new Set(), // stakingKeyWits
    undefined, // metadata
  );

  return Buffer.from(signedTx.witness_set().to_bytes()).toString('hex');
}

export async function connectorCreateCardanoTx(
  publicDeriver: IPublicDeriver<ConceptualWallet>,
  password: string,
  cardanoTxRequest: CardanoTxRequest,
): Promise<string> {
  const withUtxos = asGetAllUtxos(publicDeriver);
  if (withUtxos == null) {
    throw new Error(`missing utxo functionality`);
  }

  const withHasUtxoChains = asHasUtxoChains(withUtxos);
  if (withHasUtxoChains == null) {
    throw new Error(`missing chains functionality`);
  }

  const network = publicDeriver.getParent().getNetworkInfo();
  const fullConfig = getCardanoHaskellBaseConfig(network);
  const timeToSlot = await genTimeToSlot(fullConfig);
  const absSlotNumber = new BigNumber(timeToSlot({
    time: new Date(),
  }).slot);

  const adaApi = new AdaApi();
  const signRequest = await adaApi.createUnsignedTxForConnector(({
    publicDeriver: withHasUtxoChains,
    absSlotNumber,
    cardanoTxRequest,
  }: any));

  const withSigningKey = asGetSigningKey(publicDeriver);
  if (!withSigningKey) {
    throw new Error('expect to be able to get signing key');
  }
  const signingKey = await withSigningKey.getSigningKey();
  const normalizedKey = await withSigningKey.normalizeKey({
    ...signingKey,
    password,
  });

  const withLevels = asHasLevels<ConceptualWallet>(publicDeriver);
  if (!withLevels) {
    throw new Error(`can't get level`);
  }

  const signedTx = shelleySignTransaction(
    signRequest.senderUtxos,
    signRequest.unsignedTx,
    withLevels.getParent().getPublicDeriverLevel(),
    RustModule.WalletV4.Bip32PrivateKey.from_bytes(
      Buffer.from(normalizedKey.prvKeyHex, 'hex')
    ),
    signRequest.neededStakingKeyHashes.wits,
    signRequest.metadata,
  );
  return Buffer.from(signedTx.to_bytes()).toString('hex');
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

export async function connectorSendTxCardano(
  wallet: IPublicDeriver</* ConceptualWallet */>,
  signedTx: Uint8Array,
  localStorage: LocalStorageApi,
): Promise<void> {
  const signedTx64 = Buffer.from(signedTx).toString('base64');
  const network = wallet.getParent().getNetworkInfo();
  const backend = network.Backend.BackendService;
  if (backend == null) {
    throw new Error('connectorSendTxCardano: missing backend url');
  }
  return axios(
    `${backend}/api/txs/signed`,
    {
      method: 'post',
      // 2 * CONFIG.app.walletRefreshInterval,
      timeout: 2 * 20000,
      data: { signedTx: signedTx64 },
      headers: {
        'yoroi-version': await localStorage.getLastLaunchVersion(),
        'yoroi-locale': await localStorage.getUserLocale()
      }
    }
  ).then(_response => {
    return Promise.resolve();
  }).catch((_error) => {
    throw new SendTransactionApiError();
  });
}

// TODO: generic data sign
