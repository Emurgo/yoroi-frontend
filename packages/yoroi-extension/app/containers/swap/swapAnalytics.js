// @flow

import { identifierToPolicy } from '../../api/assetUtils';
import { maybe } from '../../coreUtils';
import { ampli } from '../../../ampli/index';
import { useSwap } from '@yoroi/swap';
import useSwapForm from './context/swap-form/useSwapForm';

type AnalyticsAsset = {|
  asset_name?: string,
  asset_ticker?: string,
  policy_id?: string,
|};

type FromAsset = {|
  from_asset: Array<AnalyticsAsset>
|};

type ToAsset = {|
  to_asset: Array<AnalyticsAsset>
|};

type FromAndToAssets = {| ...FromAsset, ...ToAsset |};

export function tokenInfoToAnalyticsAsset(tokenInfo: any): AnalyticsAsset {
  return {
    asset_name: tokenInfo?.name ?? undefined,
    asset_ticker: tokenInfo?.ticker ?? undefined,
    policy_id: maybe(tokenInfo?.id, identifierToPolicy) ?? undefined,
  };
}

export function tokenInfoToAnalyticsFromAsset(tokenInfo: any): FromAsset {
  return { from_asset: [tokenInfoToAnalyticsAsset(tokenInfo)] };
}

export function tokenInfoToAnalyticsToAsset(tokenInfo: any): ToAsset {
  return { to_asset: [tokenInfoToAnalyticsAsset(tokenInfo)] };
}

export function tokenInfoToAnalyticsFromAndToAssets(fromTokenInfo: any, toTokenInfo: any): FromAndToAssets {
  return {
    ...tokenInfoToAnalyticsFromAsset(fromTokenInfo),
    ...tokenInfoToAnalyticsToAsset(toTokenInfo),
  };
}
