// @flow

import type { TokenInfoMap } from '../toplevel/TokenInfoStore';
import type {
  TokenLookupKey, TokenEntry,
} from '../../api/common/lib/MultiToken';
import type { TokenRow, TokenMetadata } from '../../api/ada/lib/storage/database/primitives/tables';
import AssetFingerprint from '@emurgo/cip14-js';
import { AssetNameUtils } from '@emurgo/yoroi-lib/dist/internals/utils/assets';
import type { RemoteTokenInfo } from '../../api/ada/lib/state-fetch/types';
import { isHex } from '@emurgo/yoroi-lib/dist/internals/utils/index';
import { hexToBytes } from '../../coreUtils';

export function getTokenName(
  tokenRow: $ReadOnly<{
    Identifier: string,
    IsDefault: boolean,
    IsNFT?: boolean,
    Metadata: TokenMetadata,
    ...,
  }>,
): string {
  const strictName = getTokenStrictName(tokenRow).name;
  if (strictName != null) return strictName;
  const identifier = getTokenIdentifierIfExists(tokenRow);
  if (identifier != null) return identifier;
  return '-';
}

function resolveNameProperties(name: ?string): {| name: string, cip67Tag: ?string |} {
  if (name == null || name.length === 0 || !isHex(name)) {
    return { name: '', cip67Tag: null };
  }
  const { asciiName, hexName, cip67Tag } =
    AssetNameUtils.resolveProperties(name);
  return {
    name: asciiName ?? hexName,
    cip67Tag: cip67Tag?.toString(10),
  }
}

export function assetNameFromIdentifier(identifier: string): string {
  const [, name ] = identifier.split('.');
  return resolveNameProperties(name).name;
}

export function getTokenStrictName(
  tokenRow: $ReadOnly<{
    Identifier: string,
    Metadata: TokenMetadata,
    ...,
  }>,
): {| name: ?string, cip67Tag: ?string |} {
  if (tokenRow.Metadata.ticker != null) {
    return { name: tokenRow.Metadata.ticker, cip67Tag: null };
  }
  if (tokenRow.Metadata.longName != null) {
    return { name: tokenRow.Metadata.longName, cip67Tag: null };
  }
  if (tokenRow.Metadata.type === 'Cardano') {
    const assetName = tokenRow.Metadata.assetName;
    const { name, cip67Tag } = resolveNameProperties(assetName);
    return { name, cip67Tag };
  }
  return { name: null, cip67Tag: null };
}

export function getTokenIdentifierIfExists(
  tokenRow: $ReadOnly<{
    Identifier: string,
    IsDefault: boolean,
    IsNFT?: boolean,
    Metadata: TokenMetadata,
    ...,
  }>
): void | string {
  if (tokenRow.IsDefault) return undefined;
  if (tokenRow.Metadata.type === 'Cardano') {
    const { policyId, assetName } = tokenRow.Metadata;
    const assetFingerprint = new AssetFingerprint(
      hexToBytes(policyId),
      hexToBytes(assetName),
    );
    return assetFingerprint.fingerprint();
  }

  return tokenRow.Identifier;
}

export function createTokenRowSummary(tokenRow: $ReadOnly<TokenRow>): RemoteTokenInfo {
  const { numberOfDecimals, ticker, logo } = tokenRow.Metadata;
  const { name } = getTokenStrictName(tokenRow);
  return {
    ticker: ticker ?? undefined,
    name: name ?? undefined,
    decimals: numberOfDecimals ?? undefined,
    logo: logo ?? undefined,
  };
}

export function genLookupOrFail(
  map: TokenInfoMap,
): ($ReadOnly<Inexact<TokenLookupKey>> => $ReadOnly<TokenRow>) {
  return (lookup: $ReadOnly<Inexact<TokenLookupKey>>): $ReadOnly<TokenRow> => {
    const tokenRow = map
      .get(lookup.networkId.toString())
      ?.get(lookup.identifier);
    if (tokenRow == null) throw new Error(`${nameof(genLookupOrFail)} no token info for ${JSON.stringify(lookup)}`);
    return tokenRow;
  };
}

export function genLookupOrNull(
  map: TokenInfoMap,
): ($ReadOnly<Inexact<TokenLookupKey>> => $ReadOnly<TokenRow> | null) {
  return (lookup: $ReadOnly<Inexact<TokenLookupKey>>): $ReadOnly<TokenRow> | null => {
    const tokenRow = map
      .get(lookup.networkId.toString())
      ?.get(lookup.identifier);
    if (tokenRow == null) return null
    return tokenRow;
  };
}
export function genFormatTokenAmount(
  getTokenInfo: $ReadOnly<Inexact<TokenLookupKey>> => $ReadOnly<TokenRow>
): (TokenEntry => string) {
  return (tokenEntry) => {
    const tokenInfo = getTokenInfo(tokenEntry);

    return tokenEntry.amount
      .shiftedBy(-tokenInfo.Metadata.numberOfDecimals)
      .decimalPlaces(tokenInfo.Metadata.numberOfDecimals)
      .toString();
  };
}
