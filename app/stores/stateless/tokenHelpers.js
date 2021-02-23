// @flow

import type { TokenInfoMap } from '../toplevel/TokenInfoStore';
import type {
  TokenLookupKey, TokenEntry,
} from '../../api/common/lib/MultiToken';
import type { TokenRow, TokenMetadata } from '../../api/ada/lib/storage/database/primitives/tables';
import { isHexadecimal } from 'validator';

export function getTokenName(
  tokenRow: $ReadOnly<{
    Identifier: string,
    IsDefault: boolean,
    Metadata: TokenMetadata,
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
    Metadata: TokenMetadata,
    ...,
  }>,
): void | string {
  if (tokenRow.Metadata.ticker != null) {
    return tokenRow.Metadata.ticker;
  }
  if (tokenRow.Metadata.longName != null) {
    return tokenRow.Metadata.longName;
  }
  if (tokenRow.Metadata.type === 'Cardano') {
    if (tokenRow.Metadata.assetName.length > 0 && isHexadecimal(tokenRow.Metadata.assetName)) {
      const bytes = [...Buffer.from(tokenRow.Metadata.assetName, 'hex')];
      // check this is a valid ASCII string
      // https://github.com/trezor/trezor-firmware/blob/d4dcd7bff9aaa87d2ba3f02b3ec4aa39dfc30eaa/core/src/apps/cardano/layout.py#L68
      if (bytes.filter(byte => byte <= 32 || byte >= 127).length === 0) {
        return String.fromCharCode(...bytes);
      }
    }
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
