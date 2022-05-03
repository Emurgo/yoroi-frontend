// @flow
import { groupBy, keyBy, mapValues } from 'lodash';
import BigNumber from 'bignumber.js';
import type {
  UserAnnotation,
  CardanoAddressedUtxo,
} from './types';
import type {
  RemoteUnspentOutput,
} from '../lib/state-fetch/types';
import {
  transactionTypes,
} from './types';
import type {
  UtxoTransactionInputRow,
  UtxoTransactionOutputRow,
} from '../lib/storage/database/transactionModels/utxo/tables';
import type {
  DbTransaction,
  DbBlock,
  DbTokenInfo,
  TokenRow,
} from '../lib/storage/database/primitives/tables';
import type {
  AccountingTransactionInputRow,
  AccountingTransactionOutputRow,
} from '../lib/storage/database/transactionModels/account/tables';
import type { TransactionExportRow } from '../../export';
import type {
  IGetAllUtxosResponse,
} from '../lib/storage/models/PublicDeriver/interfaces';
import { formatBigNumberToFloatString } from '../../../utils/formatters';
import {
  MultiToken,
} from '../../common/lib/MultiToken';
import type {
  DefaultTokenEntry,
} from '../../common/lib/MultiToken';
import { RustModule } from '../lib/cardanoCrypto/rustLoader';
import { PRIMARY_ASSET_CONSTANTS } from '../lib/storage/database/primitives/enums';

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
  const hashes = assets.keys();
  for (let i = 0; i < hashes.len(); i++) {
    const policyId = hashes.get(i);
    const assetsForPolicy = assets.get(policyId);
    if (assetsForPolicy == null) continue;

    const policies = assetsForPolicy.keys();
    for (let j = 0; j < policies.len(); j++) {
      const assetName = policies.get(j);
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
): RustModule.WalletV4.Value {
  const value = RustModule.WalletV4.Value.new(
    RustModule.WalletV4.BigNum.from_str(tokens.getDefaultEntry().amount.toString())
  );
  // recall: primary asset counts towards size
  if (tokens.size() === 1) return value;

  const assets = RustModule.WalletV4.MultiAsset.new();
  for (const entry of tokens.nonDefaultEntries()) {
    const { policyId, name } = identifierToCardanoAsset(entry.identifier);

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
