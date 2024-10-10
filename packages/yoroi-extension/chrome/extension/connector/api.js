// @flow

import type { AccountBalance, Address, Asset, CardanoTx, Paginate, TokenId, Value, } from './types';
import { ConnectorError, TxSendErrorCodes } from './types';
import { RustModule } from '../../../app/api/ada/lib/cardanoCrypto/rustLoader';
import type { Addressing, IPublicDeriver, } from '../../../app/api/ada/lib/storage/models/PublicDeriver/interfaces';
import { PublicDeriver, } from '../../../app/api/ada/lib/storage/models/PublicDeriver/index';
import {
  asGetAllUtxos,
  asGetBalance,
  asGetPublicKey,
  asGetSigningKey,
  asHasLevels,
  asHasUtxoChains,
} from '../../../app/api/ada/lib/storage/models/PublicDeriver/traits';
import { ConceptualWallet } from '../../../app/api/ada/lib/storage/models/ConceptualWallet/index';
import BigNumber from 'bignumber.js';

import { CannotSendBelowMinimumValueError, NotEnoughMoneyToSendError, } from '../../../app/api/common/errors';

import { CoreAddressTypes, TxStatusCodes, } from '../../../app/api/ada/lib/storage/database/primitives/enums';
import type { FullAddressPayload } from '../../../app/api/ada/lib/storage/bridge/traitUtils';
import { getAllAddresses, getAllAddressesForDisplay, } from '../../../app/api/ada/lib/storage/bridge/traitUtils';
import { getReceiveAddress } from '../../../app/stores/stateless/addressStores';

import type { PersistedSubmittedTransaction } from '../../../app/api/localStorage';
import LocalStorageApi, {
  loadSubmittedTransactions,
  persistSubmittedTransactions,
} from '../../../app/api/localStorage';

import {
  asAddressedUtxo as asAddressedUtxoCardano,
  multiTokenFromCardanoValue,
} from '../../../app/api/ada/transactions/utils';
import type {
  AccountStateRequest,
  AccountStateResponse,
  RemoteUnspentOutput,
} from '../../../app/api/ada/lib/state-fetch/types';
import {
  signTransaction as shelleySignTransaction,
  toLibUTxO,
} from '../../../app/api/ada/transactions/shelley/transactions';
import {
  getCardanoHaskellBaseConfig,
  getNetworkById,
} from '../../../app/api/ada/lib/storage/database/prepackaged/networks';
import TimeUtils from '../../../app/api/ada/lib/storage/bridge/timeUtils';
import type { CardanoTxRequest, ForeignUtxoFetcher, } from '../../../app/api/ada';
import AdaApi, { getDRepKeyAndAddressing, pubKeyAndAddressingByChainAndIndex } from '../../../app/api/ada';
import { bytesToHex, ensureArray, hexToBytes, iterateLenGet, iterateLenGetMap, maybe } from '../../../app/coreUtils';
import { MultiToken } from '../../../app/api/common/lib/MultiToken';
import type { CardanoShelleyTransactionCtorData } from '../../../app/domain/CardanoShelleyTransaction';
import type { CardanoAddressedUtxo, } from '../../../app/api/ada/transactions/types';
import { GetToken } from '../../../app/api/ada/lib/storage/database/primitives/api/read';
import { getAllSchemaTables, raii, } from '../../../app/api/ada/lib/storage/database/utils';
import type { TokenRow } from '../../../app/api/ada/lib/storage/database/primitives/tables';
import {
  Amount as LibAmount,
  NativeAssets as LibNativeAssets,
  UTxOSet as LibUtxoSet,
  Value as LibValue,
} from '@emurgo/yoroi-eutxo-txs/dist/classes'
import { coinSelectionClassificationStrategy } from '@emurgo/yoroi-eutxo-txs/dist/tx-builder'
import { setRuntime } from '@emurgo/yoroi-eutxo-txs/dist/kernel'
import { NotEnoughMoneyToSendError as LibNotEnoughMoneyToSendError } from '@emurgo/yoroi-eutxo-txs/dist/errors'
import { ChainDerivations, DREP_KEY_INDEX, STAKING_KEY_INDEX } from '../../../app/config/numbersConfig';
import { pubKeyHashToRewardAddress, transactionHexToHash } from '../../../app/api/ada/lib/cardanoCrypto/utils';
import { sendTx } from '../../../app/api/ada/lib/state-fetch/remoteFetcher';
import type { WalletState } from '../background/types';
import type { ProtocolParameters } from '@emurgo/yoroi-lib/dist/protocol-parameters/models';
import { isCertificateKindDrepDelegation } from '../../../app/api/ada/lib/storage/bridge/utils';

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

export async function connectorGetBalance(
  wallet: PublicDeriver<>,
  tokenId: TokenId,
): Promise<AccountBalance | Value> {
  if (tokenId === 'ADA' || tokenId === 'TADA') {
    // can directly query for balance
    const canGetBalance = asGetBalance(wallet);
    if (canGetBalance != null) {
      const balance = await canGetBalance.getBalance();
      return Promise.resolve(bigNumberToValue(balance.getDefault()));
    }
      throw Error('asGetBalance failed in connectorGetBalance');
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

export async function connectorGetAssets(
  wallet: PublicDeriver<>,
): Promise<Array<Asset>> {
  const canGetBalance = asGetBalance(wallet);
  if (canGetBalance != null) {
    const balance = await canGetBalance.getBalance();
    const nonDefaultEntries = balance.nonDefaultEntries();
    return Promise.resolve(nonDefaultEntries.map(e => ({
      identifier: e.identifier,
      networkId: e.networkId,
      amount: bigNumberToValue(e.amount),
    })));
  }
  throw Error('asGetBalance failed in connectorGetAssets');
}

// $FlowFixMe
function stringToLibValue(s: string): LibValue {
  if (/^\d+$/.test(s)) {
    // The string is an int number
    return new LibValue(
      new LibAmount(s),
      LibNativeAssets.from([]),
    );
  }
  try {
    return RustModule.WasmScope(Module => {
      // $FlowFixMe
      function multiAssetToLibAssets(masset: ?RustModule.WalletV4.MultiAsset): LibNativeAssets {

        const mappedAssets = iterateLenGetMap(masset).flatMap(([policy, assets]) => {
          return iterateLenGetMap(assets).nonNullValue().map(([name, amount]) => ({
            asset: {
              policy: policy.to_bytes(),
              name: name.to_bytes(),
            },
            amount: new LibAmount(amount.to_str()),
          }));
        }).toArray();

        return LibNativeAssets.from(mappedAssets);
      }
      const value = Module.WalletV4.Value.from_bytes(hexToBytes(s));
      return new LibValue(
        new LibAmount(value.coin().to_str()),
        multiAssetToLibAssets(value.multiasset()),
      )
    });
  } catch (e) {
    throw ConnectorError.invalidRequest(
      `Invalid required value string "${s}". Expected an int number or a hex of serialized Value instance. Cause: ${String(e)}`,
    );
  }
}

export async function connectorGetUtxosCardano(
  wallet: PublicDeriver<>,
  valueExpected: ?Value,
  paginate: ?Paginate,
  coinsPerUtxoWord: RustModule.WalletV4.BigNum,
): Promise<Array<RemoteUnspentOutput>> {
  const withUtxos = asGetAllUtxos(wallet);
  if (withUtxos == null) {
    throw new Error('wallet doesn\'t support IGetAllUtxos');
  }
  const utxos = await withUtxos.getAllUtxos();
  const toRemoteUnspentOutput = (utxo: CardanoAddressedUtxo): RemoteUnspentOutput => ({
    amount: utxo.amount,
    receiver: utxo.receiver,
    tx_hash: utxo.tx_hash,
    tx_index: utxo.tx_index,
    utxo_id: utxo.utxo_id,
    assets: utxo.assets,
  });
  const submittedTxs = await loadSubmittedTransactions() || [];
  const adaApi = new AdaApi();
  const formattedUtxos: Array<RemoteUnspentOutput> =
    adaApi.utxosWithSubmittedTxs(
      asAddressedUtxoCardano(utxos).map(toRemoteUnspentOutput),
      wallet.publicDeriverId,
      submittedTxs,
    );
  const valueStr = valueExpected?.trim() ?? '';
  if (valueStr.length === 0) {
    return Promise.resolve(paginateResults(formattedUtxos, paginate));
  }

  setRuntime(RustModule.CrossCsl.init);

  const utxoSet = new LibUtxoSet(
    await Promise.all(
      formattedUtxos.map(toLibUTxO)
    )
  );
  const value = stringToLibValue(valueStr);
  let selectedUtxos;
  try {
    selectedUtxos = (await coinSelectionClassificationStrategy(
      utxoSet,
      [value],
      coinsPerUtxoWord.to_str(),
    )).selectedUtxos;
  } catch (error) {
    if (error instanceof LibNotEnoughMoneyToSendError) {
      throw new NotEnoughMoneyToSendError();
    }
    if (String(error).includes('less than the minimum UTXO value')) {
      throw new CannotSendBelowMinimumValueError();
    }
    throw error;
  }

  return selectedUtxos.asArray().map(utxo => ({
    utxo_id: `${utxo.tx}${utxo.index}`,
    tx_hash: utxo.tx,
    tx_index: utxo.index,
    receiver: utxo.address.hex,
    amount: utxo.value.amount.toString(),
    assets: utxo.value.assets.asArray().map(([nativeAsset, amount]) => ({
      amount: amount.toString(),
      assetId: nativeAsset.getHash(),
      policyId: nativeAsset.policy.asHex(),
      name: nativeAsset.name.asHex()
    }))
  }));
}

export const MAX_COLLATERAL: BigNumber = new BigNumber('5000000');
// only consider UTXO value <= (${requiredAmount} + 1 ADA)
const MAX_PER_UTXO_SURPLUS = new BigNumber('2000000');
// Max allowed collateral inputs in a tx by protocol
const MAX_COLLATERAL_COUNT: number = 3;

type GetCollateralUtxosRespose = {|
  utxosToUse: Array<RemoteUnspentOutput>,
  reorgTargetAmount: ?string,
|};

export async function connectorGetCollateralUtxos(
  wallet: PublicDeriver<>,
  requiredAmount: Value,
  utxos: Array<RemoteUnspentOutput>,
  submittedTxs: Array<PersistedSubmittedTransaction>,
): Promise<GetCollateralUtxosRespose> {
  const required = new BigNumber(requiredAmount)
  if (required.gt(MAX_COLLATERAL)) {
    throw new Error('requested collateral amount is beyond the allowed limits')
  }
  const adaApi = new AdaApi();
  const maxViableUtxoAmount = required.plus(MAX_PER_UTXO_SURPLUS);
  const utxosToConsider = adaApi.utxosWithSubmittedTxs(
    utxos,
    wallet.publicDeriverId,
    submittedTxs,
  ).filter(
    utxo => utxo.assets.length === 0 &&
      new BigNumber(utxo.amount).lt(maxViableUtxoAmount)
  )
  utxosToConsider.sort(
    (utxo1, utxo2) => (new BigNumber(utxo1.amount)).comparedTo(utxo2.amount)
  )
  const utxosToUse = []
  let sum = new BigNumber('0')
  let enough = false
  for (const utxo of utxosToConsider) {
    utxosToUse.push(utxo)
    sum = sum.plus(utxo.amount)
    while (
      utxosToUse.length > MAX_COLLATERAL_COUNT
      || sum.minus(utxosToUse[0].amount).gte(required)
    ) {
      // Removing the first (hence the smallest) utxo from the list
      const removedUtxo = utxosToUse.shift()
      sum = sum.minus(removedUtxo.amount)
    }
    if (sum.gte(required)) {
      enough = true
      break
    }
  }
  if (enough) {
    for (;;) {
      const smallestUtxo = utxosToUse[0];
      const potentialSum = sum.minus(smallestUtxo.amount);
      if (potentialSum.gte(required)) {
        // First utxo can be removed and still will be enough.
        utxosToUse.shift();
        sum = potentialSum;
      } else {
        break;
      }
    }
    return { utxosToUse, reorgTargetAmount: null };
  }

  return {
    utxosToUse,
    reorgTargetAmount: required.minus(sum).toString(),
  };
}

type FullAddressPayloadWithBase58 = {|
  fullAddress: FullAddressPayload,
  base58: Address,
|};

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

async function getOutputAddressesInSubmittedTxs(publicDeriverId: number) {
  const submittedTxs = await loadSubmittedTransactions() || [];
  const walletSubmittedTxs = submittedTxs.filter(
    submittedTxRecord => submittedTxRecord.publicDeriverId === publicDeriverId
  );
  return _getOutputAddressesInSubmittedTxs(walletSubmittedTxs);
}

export function _getOutputAddressesInSubmittedTxs(
  walletSubmittedTxs: Array<PersistedSubmittedTransaction>
): Array<string> {
  return walletSubmittedTxs
    .flatMap(({ transaction }) => {
      return transaction.addresses.to.map(({ address }) => address);
    });
}

export async function connectorGetUsedAddressesWithPaginate(
  wallet: PublicDeriver<>,
  paginate: ?Paginate
): Promise<Address[]> {
  const usedAddresses = await getAllAddresses(wallet, true);
  const unusedAddresses = await getAllAddresses(wallet, false);
  const outputAddressesInSubmittedTxs = new Set(
    await getOutputAddressesInSubmittedTxs(wallet.publicDeriverId)
  );
  return _connectorGetUsedAddressesWithPaginate(
    usedAddresses,
    unusedAddresses,
    outputAddressesInSubmittedTxs,
    paginate,
  );
}
export async function _connectorGetUsedAddressesWithPaginate(
  usedAddresses: Array<string>,
  unusedAddresses: Array<string>,
  outputAddressesInSubmittedTxs: Set<string>,
  paginate: ?Paginate
): Promise<Address[]> {
  const usedInSubmittedTxs = unusedAddresses.filter(
    address => outputAddressesInSubmittedTxs.has(address)
  );

  return paginateResults(
    [...usedAddresses, ...usedInSubmittedTxs],
    paginate
  );
}

export async function connectorGetUnusedAddresses(wallet: PublicDeriver<>): Promise<Address[]> {
  const submittedTxs = await loadSubmittedTransactions() || [];

  return _connectorGetUnusedAddresses(
    await getAllAddresses(wallet, false),
    submittedTxs.filter(
      submittedTxRecord => submittedTxRecord.publicDeriverId === wallet.publicDeriverId
    )
  );
}
export async function _connectorGetUnusedAddresses(
  unusedAddresses: Array<Address>,
  walletSubmittedTxs: Array<PersistedSubmittedTransaction>,
): Promise<Address[]> {
  const outputAddressesInSubmittedTxs = new Set(
    _getOutputAddressesInSubmittedTxs(walletSubmittedTxs)
  );
  return unusedAddresses.filter(address => !outputAddressesInSubmittedTxs.has(address));
}

export async function connectorGetDRepKey(
  wallet: PublicDeriver<>,
): Promise<string> {
  return (await getDRepKeyAndAddressing(wallet))[0].to_hex();
}

export function getDrepRewardAddressHexAndAddressing(
  wallet: WalletState,
): [string, Addressing] {
  const [pubKey, addressing] = pubKeyAndAddressingByChainAndIndex(
    wallet,
    ChainDerivations.GOVERNANCE_DREP_KEYS,
    DREP_KEY_INDEX,
  );
  // <TODO:WALLET_API>
  const config = getCardanoHaskellBaseConfig(
    getNetworkById(wallet.networkId)
  ).reduce((acc, next) => Object.assign(acc, next), {});
  const network = parseInt(config.ChainNetworkId, 10);
  return [pubKeyHashToRewardAddress(pubKey.hash().to_hex(), network), addressing];
}

export async function connectorGetStakeKey(
  wallet: PublicDeriver<>,
  getAccountState: AccountStateRequest => Promise<AccountStateResponse>,
): Promise<{| key: string, isRegistered: boolean |}> {
  const withPubKey = asGetPublicKey(wallet);
  if (withPubKey == null) {
    throw new Error('Unable to get public key from the wallet');
  }
  const withLevels = asHasLevels(wallet);
  if (withLevels == null) {
    throw new Error('Unable to get derivation levels from the wallet');
  }
  const publicKey = (await withPubKey.getPublicKey()).Hash;
  const publicDeriverLevel = withLevels.getParent().getPublicDeriverLevel();
  const stakeKey = pubKeyAndAddressingByChainAndIndex(
    { publicKey, publicDeriverLevel },
    ChainDerivations.CHIMERIC_ACCOUNT,
    STAKING_KEY_INDEX,
  )[0];
  const network = wallet.getParent().getNetworkInfo();
  const stakeAddrHex = RustModule.WasmScope(Module => {
    return Module.WalletV4.RewardAddress.new(
      Number.parseInt(network.BaseConfig[0].ChainNetworkId, 10),
      Module.WalletV4.Credential.from_keyhash(stakeKey.hash()),
    ).to_address().to_hex();
  });
  const accountState = await getAccountState(
    {
      addresses: [stakeAddrHex],
      network,
    }
  );
  return {
    // $FlowFixMe
    key: stakeKey.to_hex(),
    isRegistered: accountState[stakeAddrHex]?.stakeRegistered ?? false,
  };
}

export async function connectorGetCardanoRewardAddresses(
  wallet: PublicDeriver<>,
): Promise<Address[]> {
  return getCardanoRewardAddresses(wallet)
    .then(arr => arr.map(a => a.base58));
}

export async function connectorGetChangeAddress(wallet: PublicDeriver<>): Promise<Address> {
  const change = await getReceiveAddress(wallet);
  if (change == null) {
    throw new Error('could not get change address - this should never happen');
  }
  return change.addr.Hash
}

export function getScriptRequiredSigningKeys(
  witnessSet: ?RustModule.WalletV4.TransactionWitnessSet,
  // eslint-disable-next-line no-shadow
  RustModule: typeof RustModule,
): Set<string> {
  const nativeScripts: ?RustModule.WalletV4.NativeScripts = witnessSet?.native_scripts();
  return iterateLenGet(nativeScripts)
    .flatMap(ns => iterateLenGet(ns.get_required_signers()))
    .map(requiredKeyHash => requiredKeyHash.to_hex())
    .toSet();
}

function getTxRequiredSigningKeys(
  txBody: RustModule.WalletV4.TransactionBody,
): Set<string> {
  return iterateLenGet(txBody.required_signers())
    .map(requiredKeyHash => requiredKeyHash.to_hex())
    .toSet();
}

type CertToKeyhashFuncs<CertType> = [
  RustModule.WalletV4.Certificate => CertType | void,
  CertType => RustModule.WalletV4.Ed25519KeyHash | Array<RustModule.WalletV4.Ed25519KeyHash> | void,
];

const CERT_TO_KEYHASH_FUNCS = [
  ([
    cert => cert.as_stake_deregistration(),
    cert => cert.stake_credential().to_keyhash(),
  ]: CertToKeyhashFuncs<RustModule.WalletV4.StakeDeregistration>),
  ([
    cert => cert.as_stake_delegation(),
    cert => cert.stake_credential().to_keyhash(),
  ]: CertToKeyhashFuncs<RustModule.WalletV4.StakeDelegation>),
  ([
    cert => cert.as_vote_delegation(),
    cert => cert.stake_credential().to_keyhash(),
  ]: CertToKeyhashFuncs<RustModule.WalletV4.VoteDelegation>),
  ([
    cert => cert.as_stake_and_vote_delegation(),
    cert => cert.stake_credential().to_keyhash(),
  ]: CertToKeyhashFuncs<RustModule.WalletV4.StakeAndVoteDelegation>),
  ([
    cert => cert.as_stake_registration_and_delegation(),
    cert => cert.stake_credential().to_keyhash(),
  ]: CertToKeyhashFuncs<RustModule.WalletV4.StakeRegistrationAndDelegation>),

  ([
    cert => cert.as_stake_vote_registration_and_delegation(),
    cert => cert.stake_credential().to_keyhash(),
  ]: CertToKeyhashFuncs<RustModule.WalletV4.StakeVoteRegistrationAndDelegation>),
  ([
    cert => cert.as_drep_registration(),
    cert => cert.voting_credential().to_keyhash(),
  ]: CertToKeyhashFuncs<RustModule.WalletV4.DRepRegistration>),
  ([
    cert => cert.as_drep_deregistration(),
    cert => cert.voting_credential().to_keyhash(),
  ]: CertToKeyhashFuncs<RustModule.WalletV4.DRepDeregistration>),
  ([
    cert => cert.as_drep_update(),
    cert => cert.voting_credential().to_keyhash(),
  ]: CertToKeyhashFuncs<RustModule.WalletV4.DRepUpdate>),
  ([
    cert => cert.as_pool_registration(),
    cert => iterateLenGet(cert.pool_params().pool_owners()).toArray(),
  ]: CertToKeyhashFuncs<RustModule.WalletV4.PoolRegistration>),
];

function getCertificatesRequiredSignKeys(
  txBody: RustModule.WalletV4.TransactionBody,
): Set<string> {

  const certSigners =
    iterateLenGet(txBody.certs())
      .nonNull()
      .flatMap(cert => {
        for (const [convertFunc, getKeyhashFunc] of CERT_TO_KEYHASH_FUNCS) {
          // $FlowFixMe[incompatible-call]
          const result = maybe(convertFunc(cert), getKeyhashFunc);
          if (result != null)
            return ensureArray<RustModule.WalletV4.Ed25519KeyHash>(result);
        }
        return [];
      });

  const votingSigners =
    iterateLenGet(txBody.voting_procedures()?.get_voters()).nonNull()
      .map(voter => voter.to_drep_credential()?.to_keyhash()).nonNull();

  return certSigners
    .join(votingSigners)
    .map(hash => hash.to_hex())
    .toSet();
}

/**
 * Returns HEX of a serialised witness set
 */
export async function connectorSignCardanoTx(
  publicDeriver: PublicDeriver<>,
  password: string,
  tx: CardanoTx,
): Promise<string> {
  return RustModule.WasmScope(Module =>
    __connectorSignCardanoTx(publicDeriver, password, tx, Module));
}

export function resolveTxOrTxBody(
  tx: CardanoTx,
  // eslint-disable-next-line no-shadow
  RustModule: typeof RustModule,
): {|
  txBody: RustModule.WalletV4.TransactionBody,
  rawTxBody: Buffer,
  witnessSet: ?RustModule.WalletV4.TransactionWitnessSet,
  auxiliaryData: ?RustModule.WalletV4.AuxiliaryData,
|} {
  const { tx: txHex } = tx;
  let txBody: RustModule.WalletV4.TransactionBody;
  let witnessSet: RustModule.WalletV4.TransactionWitnessSet;
  let auxiliaryData: ?RustModule.WalletV4.AuxiliaryData;
  let rawTxBody: Buffer;
  const bytes = hexToBytes(txHex);
  try {
    const fullTx = RustModule.WalletV4.FixedTransaction.from_bytes(bytes);
    txBody = fullTx.body();
    witnessSet = fullTx.witness_set();
    auxiliaryData = fullTx.auxiliary_data();
    rawTxBody = Buffer.from(fullTx.raw_body());
  } catch (originalErr) {
    try {
      // Try parsing as body for backward compatibility
      txBody = RustModule.WalletV4.TransactionBody.from_bytes(bytes);
      rawTxBody = bytes;
    } catch (_e) {
      throw originalErr;
    }
  }
  return { txBody, witnessSet, auxiliaryData, rawTxBody }
}

async function __connectorSignCardanoTx(
  publicDeriver: PublicDeriver<>,
  password: string,
  tx: CardanoTx,
  // eslint-disable-next-line no-shadow
  RustModule: typeof RustModule,
): Promise<string> {

  const { txBody, witnessSet, auxiliaryData, rawTxBody } =
    resolveTxOrTxBody(tx, RustModule);

  const withUtxos = asGetAllUtxos(publicDeriver);
  if (withUtxos == null) {
    throw new Error(`missing utxo functionality`);
  }

  const withHasUtxoChains = asHasUtxoChains(withUtxos);
  if (withHasUtxoChains == null) {
    throw new Error(`missing chains functionality`);
  }

  const totalAdditionalRequiredSignKeys = new Set<string>([
    ...getTxRequiredSigningKeys(txBody),
    ...getScriptRequiredSigningKeys(witnessSet, RustModule),
    ...getCertificatesRequiredSignKeys(txBody),
  ]);

  const additionalSignaturesRequired = totalAdditionalRequiredSignKeys.size > 0;

  const queryAllBaseAddresses = (): Promise<Array<FullAddressPayload>> => {
    if (additionalSignaturesRequired) {
      return getAllAddressesForDisplay({
        publicDeriver,
        type: CoreAddressTypes.CARDANO_BASE,
      });
    }
    return Promise.resolve([]);
  }

  const queryAllRewardAddresses = (): Promise<Array<FullAddressPayload>> => {
    if (additionalSignaturesRequired) {
      return getAllAddressesForDisplay({
        publicDeriver,
        type: CoreAddressTypes.CARDANO_REWARD,
      });
    }
    return Promise.resolve([]);
  }

  const [utxos, allBaseAddresses, allRewardAddresses] = await Promise.all([
    withHasUtxoChains.getAllUtxos(),
    queryAllBaseAddresses(),
    queryAllRewardAddresses(),
  ]);

  const requiredTxSignAddresses = new Set<string>();
  const otherRequiredSigners = [];

  if (additionalSignaturesRequired) {
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
    for (const signingKeyHash of totalAdditionalRequiredSignKeys) {
      const requiredKeyHash = RustModule.WalletV4.Ed25519KeyHash
        .from_bytes(hexToBytes(signingKeyHash));
      const requiredPaymentCred = RustModule.WalletV4.Credential
        .from_keyhash(requiredKeyHash);
      const requiredAddress = RustModule.WalletV4.BaseAddress.new(
        parsedNetworkId,
        requiredPaymentCred,
        parsedStakingCred,
      ).to_address();
      requiredTxSignAddresses.add(bytesToHex(requiredAddress.to_bytes()));
    }
    for (const baseAddress of allBaseAddresses) {
      const { address, addressing } = baseAddress;
      if (requiredTxSignAddresses.delete(address)) {
        otherRequiredSigners.push({ address, addressing });
      }
      if (requiredTxSignAddresses.size === 0) {
        break;
      }
    }
    for (const rewardAddress of allRewardAddresses) {
      const { address, addressing } = rewardAddress;
      if (totalAdditionalRequiredSignKeys.has(address.slice(2))) {
        otherRequiredSigners.push({ address, addressing });
      }
    }
    const [ drepKey, addressing ] = await getDRepKeyAndAddressing(publicDeriver);
    const drepCred = drepKey.hash().to_hex();
    if (totalAdditionalRequiredSignKeys.has(drepCred)) {
      const address = RustModule.WalletV4.RewardAddress.new(
        0, // strictly speaking should use `ChainNetworkId` but doesn't matter
        RustModule.WalletV4.Credential.from_keyhash(drepKey.hash()),
      ).to_address().to_hex();
      otherRequiredSigners.push({ address, ...addressing });
    }
  }

  const submittedTxs = await loadSubmittedTransactions() || [];
  const adaApi = new AdaApi();
  const addressedUtxos = await adaApi.addressedUtxosWithSubmittedTxs(
    asAddressedUtxoCardano(utxos),
    publicDeriver,
    submittedTxs
  );

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

  const utxoIdSet: Set<string> =
    iterateLenGet(txBody.inputs())
      .join(iterateLenGet(txBody.collateral()))
      .map(input => `${(input.transaction_id().to_hex())}${String(input.index())}`)
      .toSet();

  const usedUtxos = addressedUtxos
    .filter(utxo => utxoIdSet.has(utxo.utxo_id));

  const signedTx = shelleySignTransaction(
    usedUtxos,
    rawTxBody,
    withLevels.getParent().getPublicDeriverLevel(),
    RustModule.WalletV4.Bip32PrivateKey.from_hex(normalizedKey.prvKeyHex),
    new Set(), // stakingKeyWits
    auxiliaryData, // metadata
    otherRequiredSigners,
  );

  return signedTx.witness_set().to_hex();
}

export async function connectorCreateCardanoTx(
  publicDeriver: PublicDeriver<>,
  password: ?string,
  cardanoTxRequest: CardanoTxRequest,
  foreignUtxoFetcher: ForeignUtxoFetcher,
  protocolParameters: ProtocolParameters,
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
  const absSlotNumber = new BigNumber(TimeUtils.timeToAbsoluteSlot(fullConfig, new Date()));

  const submittedTxs = await loadSubmittedTransactions() || [];

  const utxos = asAddressedUtxoCardano(
    await withUtxos.getAllUtxos()
  );

  const adaApi = new AdaApi();
  const signRequest = await adaApi.createUnsignedTxForConnector(
    {
      publicDeriver,
      absSlotNumber,
      // $FlowFixMe[incompatible-exact]
      cardanoTxRequest,
      submittedTxs,
      utxos,
      protocolParameters,
    },
    foreignUtxoFetcher,
  );

  if (password == null) {
    return signRequest.unsignedTx.build_tx().to_hex();
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
    RustModule.WalletV4.Bip32PrivateKey.from_hex(normalizedKey.prvKeyHex),
    signRequest.neededStakingKeyHashes.wits,
    signRequest.metadata,
  );
  return signedTx.to_hex();
}

export async function connectorSendTxCardano(
  wallet: IPublicDeriver</* ConceptualWallet */>,
  signedTx: Buffer,
  localStorage: LocalStorageApi,
): Promise<void> {
  await sendTx({
    body: {
      network: wallet.getParent().getNetworkInfo(),
      id: transactionHexToHash(bytesToHex(signedTx)),
      encodedTx: signedTx,
    },
    lastLaunchVersion: await localStorage.getLastLaunchVersion() ?? '',
    currentLocale: await localStorage.getUserLocale() ?? '',
    errorHandler: error => {
      const code = error.response?.status === 400
        ? TxSendErrorCodes.REFUSED : TxSendErrorCodes.FAILURE;
      const info = error.response?.data
        ?? `Failed to submit transaction: ${String(error)}`;
      throw new ConnectorError({ code, info });
    }
  });
}

export async function connectorRecordSubmittedCardanoTransaction(
  publicDeriver: PublicDeriver<>,
  tx: RustModule.WalletV4.Transaction,
  addressedUtxos?: ?Array<CardanoAddressedUtxo>,
) {
  const withUtxos = asGetAllUtxos(publicDeriver);
  if (!withUtxos) {
    throw new Error('expect to be able to get all UTXOs');
  }
  const allAddresses = new Set(
    (await withUtxos.getAllUtxoAddresses())
      .flatMap(utxoAddr => utxoAddr.addrs.map(addr => addr.Hash))
  );

  let utxos;
  if (addressedUtxos) {
    utxos = addressedUtxos;
  } else {
    utxos = asAddressedUtxoCardano(
      await withUtxos.getAllUtxos()
    );
  }
  const submittedTxs = await loadSubmittedTransactions() || [];
  const adaApi = new AdaApi();
  utxos = await adaApi.addressedUtxosWithSubmittedTxs(
    utxos,
    publicDeriver,
    submittedTxs,
  );

  const txId = transactionHexToHash(tx.to_hex());
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
  const usedUtxos = [];
  for (const input of iterateLenGet(txBody.inputs())) {
    const txHash = input.transaction_id().to_hex();
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
  for (const output of iterateLenGet(txBody.outputs())) {
    const value = multiTokenFromCardanoValue(output.amount(), defaults);
    const address = output.address().to_hex();
    addresses.to.push({
      address,
      value,
      isForeign: false,
    });
    if (allAddresses.has(address)) {
      amount.joinAddMutable(value);
    } else {
      isIntraWallet = false;
    }
    fee.joinSubtractMutable(value);
  }

  const withdrawalsData = iterateLenGetMap(txBody.withdrawals())
    .nonNullValue()
    .map(([key, withdrawalAmount]) => ({
      address: key.to_address().to_hex(),
      value: new MultiToken(
        [{
          amount: new BigNumber(withdrawalAmount.to_str()),
          identifier: defaultToken.Identifier,
          networkId: defaultToken.NetworkId,
        }],
        defaults,
      )
    }))
    .toArray();

  let isDrepDelegation = false;
  const certs = txBody.certs();
  for (let i = 0; i < certs.len(); i++) {
    if (isCertificateKindDrepDelegation(certs.get(i).kind())) {
      isDrepDelegation = true;
      break;
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
    metadata: auxData?.to_hex(),
    withdrawals: withdrawalsData,
    isValid: true,
    isDrepDelegation,
  };

  submittedTxs.push({
    publicDeriverId: publicDeriver.publicDeriverId,
    transaction: submittedTx,
    networkId: publicDeriver.getParent().getNetworkInfo().NetworkId,
    usedUtxos,
  });
  await persistSubmittedTransactions(submittedTxs);
}

export function getTokenMetadataFromIds(
  tokenIds: Array<string>,
  publicDeriver: PublicDeriver<>,
): Promise<$ReadOnlyArray<$ReadOnly<TokenRow>>> {
  const networkId = publicDeriver.getParent().getNetworkInfo().NetworkId;
  const db = publicDeriver.getDb();
  return raii(
    db,
    getAllSchemaTables(db, GetToken),
    async (dbTx) => {
      return (await GetToken.fromIdentifier(
        db, dbTx,
        tokenIds
      )).filter(row => row.NetworkId === networkId);
    }
  );
}

export function assetToRustMultiasset(
  jsonAssets: $PropertyType<RemoteUnspentOutput, 'assets'>
): RustModule.WalletV4.MultiAsset {
  const groupedAssets = jsonAssets.reduce((res, a) => {
    (res[a.policyId] = (res[a.policyId]||[])).push(a);
    return res;
  }, {})
  const W4 = RustModule.WalletV4;
  const multiasset = W4.MultiAsset.new();
  for (const policyHex of Object.keys(groupedAssets)) {
    const assetGroup = groupedAssets[policyHex];
    const policyId = W4.ScriptHash.from_hex(policyHex);
    const assets = RustModule.WalletV4.Assets.new();
    for (const asset of assetGroup) {
      assets.insert(
        W4.AssetName.new(hexToBytes(asset.name)),
        W4.BigNum.from_str(asset.amount),
      );
    }
    multiasset.insert(policyId, assets);
  }
  return multiasset;
}

export async function transformCardanoUtxos(
  utxos: Array<RemoteUnspentOutput>,
  isCBOR: boolean,
): any {
  const cardanoUtxos: $ReadOnlyArray<$ReadOnly<RemoteUnspentOutput>> = utxos;
  await RustModule.load();
  const W4 = RustModule.WalletV4;
  if (isCBOR) {
    return cardanoUtxos.map(u => {
      const input = W4.TransactionInput.new(
        W4.TransactionHash.from_hex(u.tx_hash),
        u.tx_index,
      );
      const value = W4.Value.new(W4.BigNum.from_str(u.amount));
      if ((u.assets || []).length > 0) {
        value.set_multiasset(assetToRustMultiasset(u.assets));
      }
      const output = W4.TransactionOutput.new(
        W4.Address.from_hex(u.receiver),
        value,
      );
      return W4.TransactionUnspentOutput.new(input, output).to_hex();
    })
  }

  return cardanoUtxos.map(u => {
    return {
        ...u,
      receiver: W4.Address.from_hex(u.receiver).to_bech32(),
    };
  });
}
