// @flow

import type { TokenInfoMap } from '../toplevel/TokenInfoStore';
import type {
  TokenLookupKey, TokenEntry,
} from '../../api/common/lib/MultiToken';
import type { TokenRow } from '../../api/ada/lib/storage/database/primitives/tables';

export function getTokenName(
  tokenRow: $ReadOnly<{
    Identifier: string,
    IsDefault: boolean,
    Metadata: {
      ticker: null | string,
      longName: null | string,
      ...,
    },
    ...,
  }>,
): string {
  const strictName = getTokenStrictName(tokenRow);
  if (strictName != null) return strictName;
  const identifier = getTokenIdentifierIfExists(tokenRow);
  if (identifier != null) return identifier;
  return '-';
}

export function getTokenStrictName(
  tokenRow: $ReadOnly<{
    Identifier: string,
    Metadata: {
      ticker: null | string,
      longName: null | string,
      ...,
    },
    ...,
  }>,
): void | string {
  if (tokenRow.Metadata.ticker != null) {
    return tokenRow.Metadata.ticker;
  }
  if (tokenRow.Metadata.longName != null) {
    return tokenRow.Metadata.longName;
  }
  return undefined;
}

export function getTokenIdentifierIfExists(
  tokenRow: $ReadOnly<{
    Identifier: string,
    IsDefault: boolean,
    ...,
  }>
): void | string {
  if (tokenRow.IsDefault) return undefined;
  return tokenRow.Identifier;
}

export function genLookupOrFail(
  map: TokenInfoMap,
): (Inexact<TokenLookupKey> => $ReadOnly<TokenRow>) {
  return (lookup: Inexact<TokenLookupKey>): $ReadOnly<TokenRow> => {
    const tokenRow = map
      .get(lookup.networkId.toString())
      ?.get(lookup.identifier);
    if (tokenRow == null) throw new Error(`${nameof(genLookupOrFail)} no token info for ${JSON.stringify(lookup)}`);
    return tokenRow;
  };
}

export function genFormatTokenAmount(
  getTokenInfo: Inexact<TokenLookupKey> => $ReadOnly<TokenRow>
): (TokenEntry => string) {
  return (tokenEntry) => {
    const tokenInfo = getTokenInfo(tokenEntry);

    return tokenEntry.amount
      .shiftedBy(-tokenInfo.Metadata.numberOfDecimals)
      .toFormat(tokenInfo.Metadata.numberOfDecimals);
  };
}
