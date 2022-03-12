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
  CardanoTx, AccountBalance,
} from './types';
import { ConnectorError, TxSendErrorCodes } from './types';
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
import { extractP2sKeysFromErgoBox, generateKey, } from '../../../app/api/ergo/lib/transactions/utxoTransaction';

import { SendTransactionApiError } from '../../../app/api/common/errors';

import axios from 'axios';
import keyBy from 'lodash/keyBy';
import cloneDeep from 'lodash/cloneDeep';

import { asAddressedUtxo, toErgoBoxJSON } from '../../../app/api/ergo/lib/transactions/utils';
import {
  CoreAddressTypes,
  TxStatusCodes,
} from '../../../app/api/ada/lib/storage/database/primitives/enums';
import type { FullAddressPayload } from '../../../app/api/ada/lib/storage/bridge/traitUtils';
import { getAllAddressesForDisplay } from '../../../app/api/ada/lib/storage/bridge/traitUtils';
import { getReceiveAddress } from '../../../app/stores/stateless/addressStores';

import LocalStorageApi, {
  loadSubmittedTransactions,
  persistSubmittedTransactions,
} from '../../../app/api/localStorage';

import type { BestBlockResponse } from '../../../app/api/ergo/lib/state-fetch/types';
import {
  asAddressedUtxo as asAddressedUtxoCardano,
  multiTokenFromCardanoValue,
} from '../../../app/api/ada/transactions/utils';
import type { RemoteUnspentOutput } from '../../../app/api/ada/lib/state-fetch/types'
import {
  signTransaction as shelleySignTransaction
} from '../../../app/api/ada/transactions/shelley/transactions';
import {
  getCardanoHaskellBaseConfig,
  getErgoBaseConfig,
} from '../../../app/api/ada/lib/storage/database/prepackaged/networks';
import { genTimeToSlot } from '../../../app/api/ada/lib/storage/bridge/timeUtils';
import AdaApi from '../../../app/api/ada';
import type CardanoTxRequest from '../../../app/api/ada';
import { bytesToHex, hexToBytes } from '../../../app/coreUtils';
import { MultiToken } from '../../../app/api/common/lib/MultiToken';
import type { WalletTransactionCtorData } from '../../../app/domain/WalletTransaction';
import type { CardanoShelleyTransactionCtorData } from '../../../app/domain/CardanoShelleyTransaction';

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
  tokenId: TokenId,
  protocol: 'cardano' | 'ergo',
): Promise<AccountBalance | Value> {
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
  } else if (protocol === 'ergo') {
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
  } else {
    // can directly query for balance
    const canGetBalance = asGetBalance(wallet);
    if (canGetBalance != null) {
      const balance = await canGetBalance.getBalance();
      const nonDefaultEntries = balance.nonDefaultEntries();
      if (tokenId === '*') {
        return Promise.resolve({
          default: bigNumberToValue(balance.getDefault()),
          networkId: balance.getDefaultEntry().networkId,
          assets: nonDefaultEntries.map(e => ({
            identifier: e.identifier,
            networkId: e.networkId,
            amount: bigNumberToValue(e.amount),
          }))
        });
      }
      const entry = nonDefaultEntries.find(e => e.identifier === tokenId);
      return Promise.resolve(bigNumberToValue(entry?.amount || new BigNumber(0)));
    }
    throw Error('asGetBalance failed in connectorGetBalance');
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
  const submittedTxs = loadSubmittedTransactions() || [];
  const adaApi = new AdaApi();
  const formattedUtxos = adaApi.utxosWithSubmittedTxs(
    asAddressedUtxoCardano(utxos).map(u => {
      // eslint-disable-next-line no-unused-vars
      const { addressing, ...rest } = u
      return rest
    }),
    wallet.publicDeriverId,
    submittedTxs,
  );

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
    // CoreAddressTypes.CARDANO_REWARD
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

async function getCardanoRewardAddresses(
  wallet: IPublicDeriver<>,
): Promise<FullAddressPayloadWithBase58[]> {
  const isCardano = wallet.getParent().defaultToken.Metadata.type === 'Cardano';
  if (!isCardano) {
    throw new Error('Invalid wallet for a cardano request')
  }
  const type = CoreAddressTypes.CARDANO_REWARD;
  const promise = getAllAddressesForDisplay({ publicDeriver: wallet, type });
  await RustModule.load();
  const addresses: FullAddressPayload[] = await promise;
  return addresses.map(a => {
    return {
      fullAddress: a,
      base58: a.address,
    };
  });
}

async function getAllAddresses(wallet: PublicDeriver<>, usedFilter: boolean): Promise<Address[]> {
  return getAllFullAddresses(wallet, usedFilter)
    .then(arr => arr.map(a => a.base58));
}

function getOutputAddressesInSubmittedTxs(publicDeriverId: number) {
  const submittedTxs = loadSubmittedTransactions() || [];
  return submittedTxs
    .filter(submittedTxRecord => submittedTxRecord.publicDeriverId === publicDeriverId)
    .flatMap(({ transaction }) => {
      return transaction.addresses.to.map(({ address }) => address);
    });
}

export async function connectorGetUsedAddresses(
  wallet: PublicDeriver<>,
  paginate: ?Paginate
): Promise<Address[]> {
  const usedAddresses = await getAllAddresses(wallet, true);

  const outputAddressesInSubmittedTxs = new Set(
    getOutputAddressesInSubmittedTxs(wallet.publicDeriverId)
  );
  const usedInSubmittedTxs = (await getAllAddresses(wallet, false))
        .filter(address => outputAddressesInSubmittedTxs.has(address));

  return paginateResults(
    [...usedAddresses, ...usedInSubmittedTxs],
    paginate
  );
}

export async function connectorGetUnusedAddresses(wallet: PublicDeriver<>): Promise<Address[]> {
  const result = await getAllAddresses(wallet, false);
  const outputAddressesInSubmittedTxs = new Set(
    getOutputAddressesInSubmittedTxs(wallet.publicDeriverId)
  );
  return result.filter(address => !outputAddressesInSubmittedTxs.has(address));
}

export async function connectorGetCardanoRewardAddresses(
  wallet: PublicDeriver<>,
): Promise<Address[]> {
  return getCardanoRewardAddresses(wallet)
    .then(arr => arr.map(a => a.base58));
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

// Returns the map with all extracted address-keys as keys
// and the found matching local address as value, if it's found
function createP2sAddressTreeExtractor(
  addressesGetter: () => Promise<Array<FullAddressPayloadWithBase58>>,
): (
  ErgoBoxJson => Promise<{ [string]: ?FullAddressPayloadWithBase58 }>
) {
  const keyAddressMapHolder = [];
  return async box => {
    const keys: Set<string> = extractP2sKeysFromErgoBox(box);
    if (keys.size === 0) {
      return {};
    }
    if (!keyAddressMapHolder[0]) {
      keyAddressMapHolder[0] = addressesToPkMap(await addressesGetter());
    }
    // $FlowFixMe[incompatible-return]
    return Array.from(keys).reduce(
      (res, k) => ({ ...res, [k]: keyAddressMapHolder[0][k] }),
      {},
    );
  };
}

function createMockHeader(bestBlock) {
  // We could modify the best block backend to return this information for the previous block
  // but I'm guessing that votes of the previous block isn't useful for the current one
  // and I'm also unsure if any of these 3 would impact signing or not.
  // Maybe version would later be used in the ergoscript context?
  return JSON.stringify({
    id: '68ce7d31be888051a981333e712d8dde14f8f318ca9ed0796ae22d22e1b3debd',
    adProofsRoot: '987a12bb83f9f1284f3e83598f2a401cd208e3c16cd58629c71022dc67face43',
    stateRoot: 'da5805a87f029b24fc3938f9f633d74b6843a72c7ce1612e8a96158e61cb67b715',
    transactionsRoot: 'e75411a5451979fa4002eb3b8c7b5366f30f07c611954d683d0d04cacd3cb200',
    extensionHash: 'a0c7169b677e1f555d3c64d513a1ccedef82de45bd9d3f9d99c035a2cc3e2bd9',
    version: 2, // TODO: where to get version? (does this impact signing?)
    parentId: bestBlock.hash,
    timestamp: Date.now(),
    nBits: 682315684511744, // TODO: where to get difficulty? (does this impact signing?)
    height: bestBlock.height + 1,
    votes: '040000', // TODO: where to get votes? (does this impact signing?)
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

  const p2sExtractor = createP2sAddressTreeExtractor(
    () => getAllFullAddresses(publicDeriver, true),
  );

  const signingKey = await wallet.getSigningKey()
    .then(key => wallet.normalizeKey({ ...key, password }))
    .then(key => BIP32PrivateKey.fromBuffer(Buffer.from(key.prvKeyHex, 'hex')));

  const keyLevel = wallet.getParent().getPublicDeriverLevel();

  const S = RustModule.SigmaRust;

  const inputSigningKeys = new S.SecretKeys();
  for (const input of selectedInputs) {
    const inputId = input.boxId;
    debug('signing', 'Signing input ID', inputId);
    const utxo = utxoMap[inputId];
    if (utxo) {
      debug('signing', 'UTxO found, regular signature');
      inputSigningKeys.add(generateKey({ addressing: utxo, keyLevel, signingKey }));
    } else {
      debug('signing', 'No UTxO found! Checking if input needs some P2S signatures');
      const matchingAddressMap = await p2sExtractor(input);
      for (const key of Object.keys(matchingAddressMap)) {
        const matchingAddress = matchingAddressMap[key];
        if (matchingAddress == null) {
          throw new Error(
            `Input ${inputId} is a P2S, but no matching address is found for the key: ${key}`
          );
        }
        debug('signing', 'Input is a P2S, adding signature from matching address:', matchingAddress);
        inputSigningKeys.add(generateKey({
          addressing: matchingAddress.fullAddress,
          keyLevel,
          signingKey,
        }));
      }
    }
  }

  debug('signing', 'Produced input keys', inputSigningKeys.len(), inputSigningKeys);

  const blockHeader = S.BlockHeader.from_json(createMockHeader(bestBlock));
  const preHeader = S.PreHeader.from_block_header(blockHeader);
  const ergoStateContext = new S.ErgoStateContext(preHeader);
  const txBoxesToSpend = S.ErgoBoxes.from_boxes_json(selectedInputs);
  const dataBoxesToSpend = S.ErgoBoxes.from_boxes_json(dataInputs);

  const signedTx = S.Wallet
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

function getScriptRequiredSigningKeys(
  witnessSet: ?RustModule.WalletV4.TransactionWitnessSet,
): Set<string> {
  const set = new Set<string>();
  const nativeScripts: ?RustModule.WalletV4.NativeScripts = witnessSet?.native_scripts();
  if (nativeScripts != null && nativeScripts.len() > 0) {
    for (let i = 0; i < nativeScripts.len(); i++) {
      const ns = nativeScripts.get(i);
      const scriptRequiredSigners = ns.get_required_signers();
      for (let j = 0; j < scriptRequiredSigners.len(); j++) {
        const requiredKeyHash = scriptRequiredSigners.get(j);
        set.add(bytesToHex(requiredKeyHash.to_bytes()));
      }
    }
  }
  return set;
}

export async function connectorSignCardanoTx(
  publicDeriver: IPublicDeriver<ConceptualWallet>,
  password: string,
  tx: CardanoTx,
): Promise<string> {
  // eslint-disable-next-line no-unused-vars
  const { tx: txHex, partialSign } = tx;

  let txBody: RustModule.WalletV4.TransactionBody;
  let witnessSet: RustModule.WalletV4.TransactionWitnessSet;
  let auxiliaryData: ?RustModule.WalletV4.AuxiliaryData;
  const bytes = Buffer.from(txHex, 'hex');
  try {
    const fullTx = RustModule.WalletV4.Transaction.from_bytes(bytes);
    txBody = fullTx.body();
    witnessSet = fullTx.witness_set();
    auxiliaryData = fullTx.auxiliary_data();
  } catch (originalErr) {
    try {
      // Try parsing as body for backward compatibility
      txBody = RustModule.WalletV4.TransactionBody.from_bytes(bytes);
    } catch (_e) {
      throw originalErr;
    }
  }

  const withUtxos = asGetAllUtxos(publicDeriver);
  if (withUtxos == null) {
    throw new Error(`missing utxo functionality`);
  }

  const withHasUtxoChains = asHasUtxoChains(withUtxos);
  if (withHasUtxoChains == null) {
    throw new Error(`missing chains functionality`);
  }

  const requiredScriptSignAddresses = new Set<string>();
  const requiredScriptSignKeys = getScriptRequiredSigningKeys(witnessSet);
  const scriptSignaturesRequired = requiredScriptSignKeys.size > 0;
  const queryAllBaseAddresses = (): Promise<Array<FullAddressPayload>> => {
    if (scriptSignaturesRequired) {
      return getAllAddressesForDisplay({
        publicDeriver,
        type: CoreAddressTypes.CARDANO_BASE,
      });
    }
    return Promise.resolve([]);
  }

  const [utxos, allBaseAddresses] = await Promise.all([
    withHasUtxoChains.getAllUtxos(),
    queryAllBaseAddresses(),
  ]);

  const otherRequiredSigners = [];

  if (scriptSignaturesRequired) {
    if (allBaseAddresses.length === 0) {
      throw new Error('Cannot sign transaction script - no base addresses are available in the wallet!');
    }
    const parsedBaseAddr = RustModule.WalletV4.Address
      .from_bytes(hexToBytes(allBaseAddresses[0].address));
    const parsedNetworkId = parsedBaseAddr.network_id();
    const parsedStakingCred = RustModule.WalletV4.BaseAddress
      .from_address(parsedBaseAddr)?.stake_cred();
    if (parsedStakingCred == null) {
      throw new Error('Cannot sign transaction script - failed to parse the base address staking cred!');
    }
    for (const scriptKeyHash of requiredScriptSignKeys) {
      const requiredKeyHash = RustModule.WalletV4.Ed25519KeyHash
        .from_bytes(hexToBytes(scriptKeyHash));
      const requiredPaymentCred = RustModule.WalletV4.StakeCredential
        .from_keyhash(requiredKeyHash);
      const requiredAddressBytes = RustModule.WalletV4.BaseAddress.new(
        parsedNetworkId,
        requiredPaymentCred,
        parsedStakingCred,
      ).to_address().to_bytes();
      requiredScriptSignAddresses.add(bytesToHex(requiredAddressBytes))
    }
    for (const baseAddress of allBaseAddresses) {
      const { address, addressing } = baseAddress;
      if (requiredScriptSignAddresses.delete(address)) {
        otherRequiredSigners.push({ address, addressing });
      }
      if (requiredScriptSignAddresses.size === 0) {
        break;
      }
    }
  }

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
    const txHash = Buffer.from(input.transaction_id().to_bytes()).toString('hex');
    utxoIdSet.add(`${txHash}${String(input.index())}`);
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
    auxiliaryData, // metadata
    witnessSet,
    otherRequiredSigners,
  );

  return Buffer.from(signedTx.to_bytes()).toString('hex');
}

export async function connectorCreateCardanoTx(
  publicDeriver: IPublicDeriver<ConceptualWallet>,
  password: ?string,
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

  if (password == null) {
    return Buffer.from(
      signRequest.unsignedTx.build_tx().to_bytes()
    ).toString('hex');
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
  }).catch((error) => {
    const code = error.response?.status === 400
      ? TxSendErrorCodes.REFUSED : TxSendErrorCodes.FAILURE;
    const info = error.response?.data
      ?? `Failed to submit transaction: ${String(error)}`;
    throw new ConnectorError({ code, info });
  });
}

export async function connectorRecordSubmittedErgoTransaction(
  publicDeriver: PublicDeriver<>,
  tx: SignedTx,
  txId: string,
) {
  const withUtxos = asGetAllUtxos(publicDeriver);
  if (!withUtxos) {
    throw new Error('expect to be able to get all UTXOs');
  }
  const allAddresses = new Set(
    (await withUtxos.getAllUtxoAddresses())
      .flatMap(utxoAddr => utxoAddr.addrs.map(addr => addr.Hash))
  );
  const utxos = (await withUtxos.getAllUtxos()).map(asAddressedUtxo);

  const defaultToken = publicDeriver.getParent().defaultToken;
  const defaults = {
    defaultNetworkId: defaultToken.NetworkId,
    defaultIdentifier: defaultToken.Identifier
  };

  const config = getErgoBaseConfig(
    publicDeriver.getParent().getNetworkInfo()
  ).reduce((acc, next) => Object.assign(acc, next), {});

  const chainNetworkId = Number.parseInt(config.ChainNetworkId, 10);

  const amount = new MultiToken([], defaults);
  const fee = new MultiToken([], defaults);
  const addresses = { from: [], to: [] };
  let isIntraWallet = true;
  for (const { boxId } of tx.inputs) {
    const utxo = utxos.find(u => u.boxId === boxId);
    if (!utxo) {
      throw new Error('missing utxo for ' + boxId);
    }
    const value = new MultiToken([], defaults);

    value.add({
      amount: new BigNumber(utxo.amount),
      identifier: defaultToken.Identifier,
      networkId: defaultToken.NetworkId,
    });
    for (const asset of utxo.assets || []) {
      value.add({
        amount: new BigNumber(asset.amount),
        identifier: asset.tokenId,
        networkId: defaultToken.NetworkId,
      });
    }
    addresses.from.push({
      address: utxo.receiver,
      value,
    });
    if (allAddresses.has(utxo.receiver)) {
      amount.joinSubtractMutable(value);
    }
    fee.joinAddMutable(value);
  }

  for (const output of tx.outputs) {
    const value = new MultiToken([], defaults);

    value.add({
      amount: new BigNumber(output.value),
      identifier: defaultToken.Identifier,
      networkId: defaultToken.NetworkId,
    });
    for (const asset of output.assets) {
      value.add({
        amount: new BigNumber(asset.amount),
        identifier: asset.tokenId,
        networkId: defaultToken.NetworkId,
      });
    }
    const address = Buffer.from(
      RustModule.SigmaRust.NetworkAddress.new(
        (chainNetworkId: any),
        RustModule.SigmaRust.Address.recreate_from_ergo_tree(
          RustModule.SigmaRust.ErgoTree.from_bytes(
            Buffer.from(output.ergoTree, 'hex')
          )
        )
      ).to_bytes()
    ).toString('hex');
    addresses.to.push({
      address,
      value,
    });
    if (allAddresses.has(address)) {
      amount.joinAddMutable(value);
    } else {
      isIntraWallet = false;
    }
    fee.joinSubtractMutable(value);
  }

  const submittedTx: WalletTransactionCtorData = {
    txid: txId,
    type: isIntraWallet ? 'self' : 'expend',
    amount,
    fee,
    date: new Date,
    addresses,
    state: TxStatusCodes.SUBMITTED,
    errorMsg: null,
    block: null,
  };

  const submittedTxs = loadSubmittedTransactions() || [];
  submittedTxs.push({
    publicDeriverId: publicDeriver.publicDeriverId,
    transaction: submittedTx,
    networkId: publicDeriver.getParent().getNetworkInfo().NetworkId,
  });
  persistSubmittedTransactions(submittedTxs);
}

export async function connectorRecordSubmittedCardanoTransaction(
  publicDeriver: PublicDeriver<>,
  tx: RustModule.WalletV4.Transaction,
) {
  const withUtxos = asGetAllUtxos(publicDeriver);
  if (!withUtxos) {
    throw new Error('expect to be able to get all UTXOs');
  }
  const allAddresses = new Set(
    (await withUtxos.getAllUtxoAddresses())
      .flatMap(utxoAddr => utxoAddr.addrs.map(addr => addr.Hash))
  );
  const utxos = asAddressedUtxoCardano(
    await withUtxos.getAllUtxos()
  );
  const txId = Buffer.from(
    RustModule.WalletV4.hash_transaction(tx.body()).to_bytes()
  ).toString('hex');
  const defaultToken = publicDeriver.getParent().defaultToken;
  const defaults = {
    defaultNetworkId: defaultToken.NetworkId,
    defaultIdentifier: defaultToken.Identifier
  };

  const amount = new MultiToken([], defaults);
  const fee = new MultiToken([], defaults);
  const addresses = { from: [], to: [] };
  let isIntraWallet = true;
  const txBody = tx.body();
  const txInputs = txBody.inputs();
  const usedUtxos = [];
  for (let i = 0; i < txInputs.len(); i++) {
    const input = txInputs.get(i);
    const txHash = Buffer.from(input.transaction_id().to_bytes()).toString('hex');
    const index = input.index();
    const utxo = utxos.find(u => u.tx_hash === txHash && u.tx_index === index);

    if (!utxo) {
      throw new Error('missing UTXO');
    }
    usedUtxos.push({ txHash, index });

    const value = new MultiToken([], defaults);

    value.add({
      amount: new BigNumber(utxo.amount),
      identifier: defaultToken.Identifier,
      networkId: defaultToken.NetworkId,
    });
    for (const asset of utxo.assets) {
      value.add({
        amount: new BigNumber(asset.amount),
        identifier: asset.assetId,
        networkId: defaultToken.NetworkId,
      });
    }
    addresses.from.push({
      address: utxo.receiver,
      value,
    });
    if (allAddresses.has(utxo.receiver)) {
      amount.joinSubtractMutable(value);
    }
    fee.joinAddMutable(value);
  }
  const txOutputs = txBody.outputs();
  for (let i = 0; i < txOutputs.len(); i++) {
    const output = txOutputs.get(i);
    const value = multiTokenFromCardanoValue(output.amount(), defaults);
    const address = Buffer.from(output.address().to_bytes()).toString('hex');
    addresses.to.push({
      address,
      value,
    });
    if (allAddresses.has(address)) {
      amount.joinAddMutable(value);
    } else {
      isIntraWallet = false;
    }
    fee.joinSubtractMutable(value);
  }

  const withdrawals = txBody.withdrawals();
  const withdrawalsData = [];
  if (withdrawals) {
    const withdrawalKeys = withdrawals.keys();
    for (let i = 0; i < withdrawalKeys.len(); i++) {
      const key = withdrawalKeys.get(i);
      const withdrawalAmount = withdrawals.get(key);
      if (!withdrawalAmount) {
        throw new Error('unexpected missing withdrawal amount');
      }
      withdrawalsData.push({
        address: Buffer.from(key.to_address().to_bytes()).toString('hex'),
        value: new MultiToken(
          [
            {
              amount: new BigNumber(withdrawalAmount.to_str()),
              identifier: defaultToken.Identifier,
              networkId: defaultToken.NetworkId,
            }
          ],
          defaults
        )
      });
    }
  }

  const auxData = tx.auxiliary_data();

  const submittedTx: CardanoShelleyTransactionCtorData = {
    txid: txId,
    type: isIntraWallet ? 'self' : 'expend',
    amount,
    fee,
    date: new Date,
    addresses,
    state: TxStatusCodes.SUBMITTED,
    errorMsg: null,
    block: null,
    certificates: [],
    ttl: new BigNumber(String(txBody.ttl())),
    metadata: auxData ? Buffer.from(auxData.to_bytes()).toString('hex') : null,
    withdrawals: withdrawalsData,
    isValid: true,
  };

  const submittedTxs = loadSubmittedTransactions() || [];
  submittedTxs.push({
    publicDeriverId: publicDeriver.publicDeriverId,
    transaction: submittedTx,
    networkId: publicDeriver.getParent().getNetworkInfo().NetworkId,
    usedUtxos,
  });
  persistSubmittedTransactions(submittedTxs);
}

// TODO: generic data sign
