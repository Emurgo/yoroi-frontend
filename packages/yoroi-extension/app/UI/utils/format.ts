import AssetFingerprint from '@emurgo/cip14-js';
import { Balance, Portfolio } from '@yoroi/types';
import { BigNumber } from 'bignumber.js';

export const formatTokenWithText = (
  quantity: Balance.Quantity | bigint,
  token: Balance.TokenInfo | Portfolio.Token.Info | any,
  maxLength = 128
) => {
  if (('kind' in token && token.kind === 'nft') || ('type' in token && token.type === 'nft')) {
    return `${formatTokenAmount(quantity, token)} ${truncateWithEllipsis(token.name || token.fingerprint, maxLength)}`;
  }

  if ('kind' in token || 'type' in token) {
    return `${formatTokenAmount(quantity, token)} ${truncateWithEllipsis(
      token.ticker || token.name || token.fingerprint,
      maxLength
    )}`;
  }

  if ('metadata' in token && 'ticker' in token.metadata) {
    return `${formatTokenAmount(quantity, token)} ${truncateWithEllipsis(token.metadata.ticker, maxLength)}`;
  }

  return `${formatTokenAmount(quantity, token)} ${truncateWithEllipsis(getName(token), maxLength)}`;
};

export const formatTokenAmount = (
  quantity: Balance.Quantity | bigint,
  token: Balance.TokenInfo | any | Portfolio.Token.Info
): string => {
  const decimals = getDecimals(token);
  const normalized = normalizeTokenAmount(quantity, token);
  return normalized.toFormat(decimals);
};

const truncateWithEllipsis = (s: string, n: number) => {
  if (s.length > n) {
    return `${s.substr(0, Math.floor(n / 2))}...${s.substr(s.length - Math.floor(n / 2))}`;
  }

  return s;
};

const getName = (token: Balance.TokenInfo | any | Portfolio.Token.Info) => {
  if ('kind' in token || 'type' in token) {
    return token.name || token.ticker || token.fingerprint || '';
  }

  if ('metadata' in token && 'ticker' in token.metadata) {
    return token.metadata.ticker;
  }

  return (
    token.metadata.longName ||
    decodeHexAscii(token.metadata.assetName) ||
    getTokenFingerprint({
      policyId: token.metadata.policyId,
      assetNameHex: token.metadata.assetName,
    }) ||
    ''
  );
};

const getDecimals = (token: Balance.TokenInfo | any | Portfolio.Token.Info) => {
  if ('kind' in token && token.kind === 'nft') return token.kind === 'nft' ? 0 : token.decimals;

  if ('type' in token && 'decimals' in token) return token.decimals;

  if ('metadata' in token && 'numberOfDecimals' in token.metadata) return token.metadata.numberOfDecimals;

  return 0;
};

const normalizeTokenAmount = (
  quantity: Balance.Quantity | bigint,
  token: Balance.TokenInfo | any | Portfolio.Token.Info
): BigNumber => {
  const decimals = getDecimals(token) ?? 0;
  const normalizationFactor = Math.pow(10, decimals);
  return new BigNumber(quantity.toString()).dividedBy(normalizationFactor).decimalPlaces(decimals);
};

const decodeHexAscii = (text: string) => {
  const bytes = [...Buffer.from(text, 'hex')];
  const isAscii = bytes.every(byte => byte > 32 && byte < 127);
  return isAscii ? String.fromCharCode(...bytes) : undefined;
};

export const getTokenFingerprint = ({ policyId, assetNameHex }: { policyId: string; assetNameHex: string }) => {
  const assetFingerprint = AssetFingerprint.fromParts(Buffer.from(policyId, 'hex'), Buffer.from(assetNameHex, 'hex'));
  return assetFingerprint.fingerprint();
};

export const asQuantity = (value: BigNumber | number | string) => {
  const bn = new BigNumber(value);
  if (bn.isNaN() || !bn.isFinite()) {
    throw new Error('Invalid quantity');
  }
  return bn.toString(10) as Balance.Quantity;
};
