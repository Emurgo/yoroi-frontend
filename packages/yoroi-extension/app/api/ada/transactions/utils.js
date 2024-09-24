// @flow
import { groupBy, keyBy, mapValues } from 'lodash';
import BigNumber from 'bignumber.js';
import type { CardanoAddressedUtxo, UserAnnotation, } from './types';
import { transactionTypes, } from './types';
import type { RemoteAsset, RemoteUnspentOutput, } from '../lib/state-fetch/types';
import type {
  UtxoTransactionInputRow,
  UtxoTransactionOutputRow,
} from '../lib/storage/database/transactionModels/utxo/tables';
import type { DbBlock, DbTokenInfo, DbTransaction, TokenRow, } from '../lib/storage/database/primitives/tables';
import type {
  AccountingTransactionInputRow,
  AccountingTransactionOutputRow,
} from '../lib/storage/database/transactionModels/account/tables';
import type { TransactionExportRow } from '../../export';
import type { IGetAllUtxosResponse, } from '../lib/storage/models/PublicDeriver/interfaces';
import { formatBigNumberToFloatString } from '../../../utils/formatters';
import type { DefaultTokenEntry, } from '../../common/lib/MultiToken';
import { MultiToken, } from '../../common/lib/MultiToken';
import type { WasmMonad } from '../lib/cardanoCrypto/rustLoader';
import { RustModule } from '../lib/cardanoCrypto/rustLoader';
import { PRIMARY_ASSET_CONSTANTS } from '../lib/storage/database/primitives/enums';
import { iterateLenGet } from '../../../coreUtils';

const RANDOM_BASE_ADDRESS = 'addr_test1qzz6hulv54gzf2suy2u5gkvmt6ysasfdlvvegy3fmf969y7r3y3kdut55a40jff00qmg74686vz44v6k363md06qkq0qy0adz0';

export function cardanoAssetToIdentifier(
  policyId: RustModule.WalletV4.ScriptHash,
  name: RustModule.WalletV4.AssetName,
): string {
  // note: possible for name to be empty causing a trailing hyphen
  return `${Buffer.from(policyId.to_bytes()).toString('hex')}.${Buffer.from(name.name()).toString('hex')}`;
}
export function identifierToCardanoAsset(
  identifier: string,
): {|
  policyId: RustModule.WalletV4.ScriptHash,
  name: RustModule.WalletV4.AssetName,
|} {
  // recall: 'a.'.split() gives ['a', ''] as desired
  const parts = identifier.split('.');
  return {
    policyId: RustModule.WalletV4.ScriptHash.from_bytes(Buffer.from(parts[0], 'hex')),
    name: RustModule.WalletV4.AssetName.new(Buffer.from(parts[1], 'hex')),
  };
}
export function identifierSplit(
  identifier: string,
): {| policyId: string, name: string |} {
  // recall: 'a.'.split() gives ['a', ''] as desired
  const parts = identifier.split('.');
  return {
    policyId: parts[0],
    name: parts[1],
  };
}

export function parseTokenList(
  assets: void | RustModule.WalletV4.MultiAsset,
): Array<{|
  assetId: string,
  policyId: string,
  name: string,
  amount: string,
|}> {
  if (assets == null) return [];

  const result = [];
  for (const policyId of iterateLenGet(assets.keys())) {
    const assetsForPolicy = assets.get(policyId);
    if (assetsForPolicy == null) continue;

    for (const assetName of iterateLenGet(assetsForPolicy.keys())) {
      const amount = assetsForPolicy.get(assetName);
      if (amount == null) continue;

      result.push({
        amount: amount.to_str(),
        assetId: cardanoAssetToIdentifier(policyId, assetName),
        policyId: Buffer.from(policyId.to_bytes()).toString('hex'),
        name: Buffer.from(assetName.name()).toString('hex'),
      });
    }
  }
  return result;
}

export function cardanoValueFromMultiToken(
  tokens: MultiToken,
  Module: typeof RustModule = RustModule,
): RustModule.WalletV4.Value {
  const value = Module.WalletV4.Value.new(
    Module.WalletV4.BigNum.from_str(tokens.getDefaultEntry().amount.toString())
  );
  // recall: primary asset counts towards size
  if (tokens.size() === 1) return value;

  const assets = Module.WalletV4.MultiAsset.new();
  for (const entry of tokens.nonDefaultEntries()) {
    const { policyId, name } = identifierToCardanoAsset(entry.identifier);

    const policyContent = assets.get(policyId) ?? Module.WalletV4.Assets.new();

    policyContent.insert(
      name,
      Module.WalletV4.BigNum.from_str(entry.amount.toString())
    );
    // recall: we always have to insert since WASM returns copies of objects
    assets.insert(policyId, policyContent);
  }
  if (assets.len() > 0) {
    value.set_multiasset(assets);
  }
  return value;
}
export function multiTokenFromCardanoValue(
  value: RustModule.WalletV4.Value,
  defaults: DefaultTokenEntry,
): MultiToken {
  const multiToken = new MultiToken([], defaults);
  multiToken.add({
    amount: new BigNumber(value.coin().to_str()),
    identifier: defaults.defaultIdentifier,
    networkId: defaults.defaultNetworkId,
  });

  for (const token of parseTokenList(value.multiasset())) {
    multiToken.add({
      amount: new BigNumber(token.amount),
      identifier: token.assetId,
      networkId: defaults.defaultNetworkId,
    });
  }
  return multiToken;
}
export function cardanoValueFromRemoteFormat(
  utxo: RemoteUnspentOutput,
): RustModule.WalletV4.Value {
  const value = RustModule.WalletV4.Value.new(
    RustModule.WalletV4.BigNum.from_str(utxo.amount)
  );
  if (utxo.assets.length === 0) return value;

  const assets = RustModule.WalletV4.MultiAsset.new();
  for (const entry of utxo.assets) {
    const { policyId, name } = identifierToCardanoAsset(entry.assetId);

    const policyContent = assets.get(policyId) ?? RustModule.WalletV4.Assets.new();

    policyContent.insert(
      name,
      RustModule.WalletV4.BigNum.from_str(entry.amount.toString())
    );
    // recall: we always have to insert since WASM returns copies of objects
    assets.insert(policyId, policyContent);
  }
  if (assets.len() > 0) {
    value.set_multiasset(assets);
  }
  return value;
}
export function createMultiToken(
  amount: number | string | BigNumber,
  assets: Array<{
    assetId: string,
    amount: number | string | BigNumber,
    ...,
  }>,
  networkId: number,
): MultiToken {
  const result = new MultiToken(
    [],
    {
      defaultNetworkId: networkId,
      defaultIdentifier: PRIMARY_ASSET_CONSTANTS.Cardano,
    }
  );
  result.add({
    identifier: PRIMARY_ASSET_CONSTANTS.Cardano,
    amount: new BigNumber(amount),
    networkId,
  });
  for (const token of assets) {
    result.add({
      identifier: token.assetId,
      amount: new BigNumber(token.amount),
      networkId,
    });
  }
  return result;
}
export function multiTokenFromRemote(
  utxo: $ReadOnly<{
    +amount: string,
    +assets: $ReadOnlyArray<$ReadOnly<{
      +assetId: string,
      +policyId: string,
      +name: string,
      +amount: string,
      ...
    }>>,
    ...,
  }>,
  networkId: number,
): MultiToken {
  // $FlowFixMe[incompatible-call]
  return createMultiToken(utxo.amount, utxo.assets, networkId);
}

export function getFromUserPerspective(data: {|
  utxoInputs: $ReadOnlyArray<$ReadOnly<UtxoTransactionInputRow>>,
  utxoOutputs: $ReadOnlyArray<$ReadOnly<UtxoTransactionOutputRow>>,
  accountingInputs?: $ReadOnlyArray<$ReadOnly<AccountingTransactionInputRow>>,
  accountingOutputs?: $ReadOnlyArray<$ReadOnly<AccountingTransactionOutputRow>>,
  ownImplicitInput?: MultiToken,
  ownImplicitOutput?: MultiToken,
  allOwnedAddressIds: Set<number>,
  defaultToken: DefaultTokenEntry,
  ...DbTokenInfo,
|}): UserAnnotation {
  const unifiedInputs = [
    ...data.utxoInputs,
    ...(data.accountingInputs ?? []),
  ];
  const unifiedOutputs = [
    ...data.utxoOutputs,
    ...(data.accountingOutputs ?? []),
  ];
  const ownInputs = unifiedInputs.filter(input => (
    data.allOwnedAddressIds.has(input.AddressId)
  ));

  const ownOutputs = unifiedOutputs.filter(output => (
    data.allOwnedAddressIds.has(output.AddressId)
  ));

  const totalIn = sumInputsOutputs(unifiedInputs, data.tokens, data.defaultToken);
  const totalOut = sumInputsOutputs(unifiedOutputs, data.tokens, data.defaultToken);
  const ownIn = sumInputsOutputs(ownInputs, data.tokens, data.defaultToken)
    .joinAddCopy(data.ownImplicitInput ?? new MultiToken([], data.defaultToken));
  const ownOut = sumInputsOutputs(ownOutputs, data.tokens, data.defaultToken)
    .joinAddCopy(data.ownImplicitOutput ?? new MultiToken([], data.defaultToken));

  const hasOnlyOwnInputs = ownInputs.length === unifiedInputs.length;
  const hasOnlyOwnOutputs = ownOutputs.length === unifiedOutputs.length;

  const isIntraWallet = hasOnlyOwnInputs && hasOnlyOwnOutputs;
  const isMultiParty =
    ownInputs.length > 0 && ownInputs.length !== unifiedInputs.length;

  const brutto = ownOut.joinSubtractCopy(ownIn);
  const totalFee = totalOut.joinSubtractCopy(totalIn); // should be negative

  if (isIntraWallet) {
    return {
      type: transactionTypes.SELF,
      amount: new MultiToken([], data.defaultToken),
      fee: totalFee,
    };
  }
  if (isMultiParty) {
    return {
      type: transactionTypes.MULTI,
      amount: brutto,
      // note: fees not accurate but no logical way of finding which UTXO paid the fees
      fee: new MultiToken([], data.defaultToken),
    };
  }
  if (hasOnlyOwnInputs) {
    return {
      type: transactionTypes.EXPEND,
      amount: brutto.joinSubtractCopy(totalFee),
      fee: totalFee,
    };
  }

  return {
    type: transactionTypes.INCOME,
    amount: brutto,
    fee: new MultiToken([], data.defaultToken),
  };
}

export function convertAdaTransactionsToExportRows(
  transactions: $ReadOnlyArray<$ReadOnly<{
    ...DbTransaction,
    ...WithNullableFields<DbBlock>,
    ...UserAnnotation,
    ...,
  }>>,
  defaultAssetRow: $ReadOnly<TokenRow>,
): Array<TransactionExportRow> {
  const result = [];
  for (const tx of transactions) {
    if (tx.block != null) {
      result.push({
        date: tx.block.BlockTime,
        type: tx.type === transactionTypes.INCOME ? 'in' : 'out',
        amount: formatBigNumberToFloatString(
          tx.amount.get(defaultAssetRow.Identifier)
            ?.abs()
            .shiftedBy(-defaultAssetRow.Metadata.numberOfDecimals)
            ?? new BigNumber(0)
        ),
        fee: formatBigNumberToFloatString(
          tx.fee.get(defaultAssetRow.Identifier)
            ?.abs()
            .shiftedBy(-defaultAssetRow.Metadata.numberOfDecimals)
            ?? new BigNumber(0)
        ),
        id: tx.transaction.Hash,
      });
    }
  }
  return result;
}

export function sumInputsOutputs(
  ios: $ReadOnlyArray<$ReadOnly<
    UtxoTransactionInputRow | UtxoTransactionOutputRow |
    AccountingTransactionInputRow | AccountingTransactionOutputRow
  >>,
  tokens: $PropertyType<DbTokenInfo, 'tokens'>,
  defaultToken: DefaultTokenEntry,
): MultiToken {
  const usedTokens = ios
    .reduce(
      (acc, next) => {
        for (const entry of tokens.filter(token => token.TokenList.ListId === next.TokenListId)) {
          acc.push(entry);
        }
        return acc;
      },
      []
    );
  return new MultiToken(
    usedTokens.map(token => ({
      identifier: token.Token.Identifier,
      amount: new BigNumber(token.TokenList.Amount),
      networkId: token.Token.NetworkId,
    })),
    defaultToken
  );
}

export type UtxoLookupMap = { [string]: { [number]: RemoteUnspentOutput, ... }, ... };
export function utxosToLookupMap(
  utxos: Array<RemoteUnspentOutput>
): UtxoLookupMap {
  // first create 1-level map of (tx_hash -> [UTXO])
  const txHashMap = groupBy(utxos, utxo => utxo.tx_hash);

  // now create 2-level map of (tx_hash -> index -> UTXO)
  const lookupMap = mapValues(
    txHashMap,
    utxoList => keyBy(
      utxoList,
      utxo => utxo.tx_index
    )
  );
  return lookupMap;
}

export function asAddressedUtxo(
  utxos: IGetAllUtxosResponse,
): Array<CardanoAddressedUtxo> {
  return utxos.map(utxo => {
    const tokenTypes = utxo.output.tokens.reduce(
      (acc, next) => {
        if (next.Token.Identifier === PRIMARY_ASSET_CONSTANTS.Cardano) {
          acc.amount = acc.amount.plus(next.TokenList.Amount);
        } else {
          acc.tokens.push({
            amount: next.TokenList.Amount,
            tokenId: next.Token.Identifier,
          });
        }
        return acc;
      },
      {
        amount: new BigNumber(0),
        tokens: [],
      }
    );


    const assets = tokenTypes.tokens.map(token => {
      const pieces = identifierToCardanoAsset(token.tokenId);
      return {
        amount: token.amount,
        assetId: token.tokenId,
        policyId: Buffer.from(pieces.policyId.to_bytes()).toString('hex'),
        name: Buffer.from(pieces.name.name()).toString('hex'),
      };
    });
    return {
      amount: tokenTypes.amount.toString(),
      receiver: utxo.address,
      tx_hash: utxo.output.Transaction.Hash,
      tx_index: utxo.output.UtxoTransactionOutput.OutputIndex,
      utxo_id: utxo.output.Transaction.Hash + utxo.output.UtxoTransactionOutput.OutputIndex,
      addressing: utxo.addressing,
      assets,
    };
  });
}

function cardanoUtxoMonadFromRemoteFormat(
  u: RemoteUnspentOutput,
): WasmMonad<RustModule.WalletV4.TransactionUnspentOutput> {
  return RustModule.ScopeMonad(Module => {
    const W4 = Module.WalletV4;
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
    return W4.TransactionUnspentOutput.new(input, output);
  });
}

export function cardanoUtxoHexFromRemoteFormat(u: RemoteUnspentOutput): string {
  return cardanoUtxoMonadFromRemoteFormat(u)
    .unwrap(output => output.to_hex());
}

function cardanoMinAdaRequiredFromOutput(
  output: RustModule.WalletV4.TransactionOutput,
  coinsPerByte: BigNumber,
  Module: typeof RustModule,
): BigNumber {
  const wasmCoinsPerByte = Module.WalletV4.BigNum.from_str(coinsPerByte.toString());
  const dataCost = Module.WalletV4.DataCost.new_coins_per_byte(wasmCoinsPerByte);
  const minAdaRequired = Module.WalletV4.min_ada_for_output(output, dataCost).to_str();
  return new BigNumber(minAdaRequired);
}

/**
 * <TODO:PENDING_REMOVAL> LEGACY
 * @deprecated
 */
export function coinsPerWord_to_coinsPerByte(coinsPerWord: BigNumber): BigNumber {
  return coinsPerWord.div(8).integerValue(BigNumber.ROUND_FLOOR);
}

/**
 * @deprecated
 */
export function cardanoMinAdaRequiredFromRemoteFormat_coinsPerWord(u: RemoteUnspentOutput, coinsPerWord: BigNumber): BigNumber {
  return cardanoMinAdaRequiredFromRemoteFormat(u, coinsPerWord_to_coinsPerByte(coinsPerWord));
}

export function cardanoMinAdaRequiredFromRemoteFormat(u: RemoteUnspentOutput, coinsPerByte: BigNumber): BigNumber {
  return cardanoUtxoMonadFromRemoteFormat(u)
    .unwrap<BigNumber>((wasmUtxo, Module) => {
      const wasmCoinsPerByte = Module.WalletV4.BigNum.from_str(coinsPerByte.toString());
      const dataCost = Module.WalletV4.DataCost.new_coins_per_byte(wasmCoinsPerByte);
      const minAdaRequired = Module.WalletV4.min_ada_for_output(wasmUtxo.output(), dataCost).to_str();
      return new BigNumber(minAdaRequired);
    });
}

/**
 * @deprecated
 */
export function cardanoMinAdaRequiredFromAssets_coinsPerWord(tokens: MultiToken, coinsPerWord: BigNumber): BigNumber {
  return cardanoMinAdaRequiredFromAssets(tokens, coinsPerWord_to_coinsPerByte(coinsPerWord));
}

export function cardanoMinAdaRequiredFromAssets(tokens: MultiToken, coinsPerByte: BigNumber): BigNumber {
  return RustModule.WasmScope(Module => {
    const output = Module.WalletV4.TransactionOutput.new(
      Module.WalletV4.Address.from_bech32(RANDOM_BASE_ADDRESS),
      cardanoValueFromMultiToken(tokens, Module),
    );
    return cardanoMinAdaRequiredFromOutput(output, coinsPerByte, Module);
  });
}

export function assetToRustMultiasset(
  remoteAssets: $ReadOnlyArray<$ReadOnly<RemoteAsset>>
): RustModule.WalletV4.MultiAsset {
  const groupedAssets = remoteAssets.reduce((res, a) => {
    (res[a.policyId] = (res[a.policyId] || [])).push(a);
    return res;
  }, {})
  const W4 = RustModule.WalletV4;
  const multiasset = W4.MultiAsset.new();
  for (const policyHex of Object.keys(groupedAssets)) {
    const assetGroup = groupedAssets[policyHex];
    const policyId = W4.ScriptHash.from_bytes(Buffer.from(policyHex, 'hex'));
    const assets = RustModule.WalletV4.Assets.new();
    for (const asset of assetGroup) {
      assets.insert(
        W4.AssetName.new(Buffer.from(asset.name, 'hex')),
        W4.BigNum.from_str(asset.amount),
      );
    }
    multiasset.insert(policyId, assets);
  }
  return multiasset;
}

/**
 * Shallow-parses the passed transaction CBOR HEX and returns the BigNumber of the fee lovelaces
 */
export function getTransactionFeeFromCbor(txHex: string): BigNumber {
  try {
    return RustModule.WasmScope(Module => {
      const feeStr = Module.WalletV4.FixedTransaction.from_hex(txHex).body().fee().to_str();
      return new BigNumber(feeStr);
    });
  } catch (e) {
    console.error('Failed to decode transaction fee from cbor', e);
    throw e;
  }
}

/**
 * Shallow-parses the passed transaction CBOR HEX, adds together all outputs, and returns as multi-token
 */
export function getTransactionTotalOutputFromCbor(txHex: string, defaults: DefaultTokenEntry): MultiToken {
  try {
    return RustModule.WasmScope(Module => {
      const outputs = Module.WalletV4.FixedTransaction.from_hex(txHex).body().outputs();
      const sum = new MultiToken([], defaults);
      for (const output of iterateLenGet(outputs)) {
        sum.joinAddMutable(multiTokenFromCardanoValue(output.amount(), defaults));
      }
      return sum;
    });
  } catch (e) {
    console.error('Failed to decode transaction total output from cbor', e);
    throw e;
  }
}

/**
 * @param witnessSetHex1 - a serialised witness set as a HEX string
 * @param witnessSetHex2 - a serialised witness set as a HEX string
 * @return the resulting new witness set as a HEX string
 */
export function mergeWitnessSets(
  witnessSetHex1: string,
  witnessSetHex2: string,
): string {
  return RustModule.WasmScope(Scope => {
    const wset1 = Scope.WalletV4.TransactionWitnessSet.from_hex(witnessSetHex1);
    const wset2 = Scope.WalletV4.TransactionWitnessSet.from_hex(witnessSetHex2);
    const wsetResult = Scope.WalletV4.TransactionWitnessSet.new();
    let vkeys = wset1.vkeys();
    const newVkeys = wset2.vkeys();
    if (vkeys && newVkeys) {
      for (const newVkey of iterateLenGet(newVkeys)) {
        vkeys.add(newVkey);
      }
    } else if (newVkeys) {
      vkeys = newVkeys;
    }
    if (vkeys) {
      wsetResult.set_vkeys(vkeys);
    }

    let nativeScripts = wset1.native_scripts();
    const newNativeScripts = wset2.native_scripts();
    if (nativeScripts && newNativeScripts) {
      for (const newNativeScript of iterateLenGet(newNativeScripts)) {
        nativeScripts.add(newNativeScript);
      }
    } else if (newNativeScripts) {
      nativeScripts = newNativeScripts;
    }
    if (nativeScripts) {
      wsetResult.set_native_scripts(nativeScripts);
    }

    let bootstraps = wset1.bootstraps();
    const newBootstraps = wset2.bootstraps();
    if (bootstraps && newBootstraps) {
      for (const newBootstrap of iterateLenGet(newBootstraps)) {
        bootstraps.add(newBootstrap);
      }
    } else if (newBootstraps) {
      bootstraps = newBootstraps;
    }
    if (bootstraps) {
      wsetResult.set_bootstraps(bootstraps);
    }

    let plutusScripts = wset1.plutus_scripts();
    const newPlutusScripts = wset2.plutus_scripts();
    if (plutusScripts && newPlutusScripts) {
      for (const newPlutusScript of iterateLenGet(newPlutusScripts)) {
        plutusScripts.add(newPlutusScript);
      }
    } else if (newPlutusScripts) {
      plutusScripts = newPlutusScripts;
    }
    if (plutusScripts) {
      wsetResult.set_plutus_scripts(plutusScripts);
    }

    let plutusData = wset1.plutus_data();
    const newPlutusData = wset2.plutus_data();
    if (plutusData && newPlutusData) {
      for (const newPlutusDatum of iterateLenGet(newPlutusData)) {
        plutusData.add(newPlutusDatum);
      }
    } else if (newPlutusData) {
      plutusData = newPlutusData;
    }
    if (plutusData) {
      wsetResult.set_plutus_data(plutusData);
    }

    let redeemers = wset1.redeemers();
    const newRedeemers = wset2.redeemers();
    if (redeemers && newRedeemers) {
      for (const newRedeemer of iterateLenGet(newRedeemers)) {
        redeemers.add(newRedeemer);
      }
    } else if (newRedeemers) {
      redeemers = newRedeemers;
    }
    if (redeemers) {
      wsetResult.set_redeemers(redeemers);
    }
    return wsetResult.to_hex();
  });
}
