import { convertDrepHashToCIP129Format } from '@yoroi/staking';
import BigNumber from 'bignumber.js';
import { EventDefinitions } from '../../../../../../posthog/events';

export function formatValue(value: BigNumber): string {
  if (value.isZero()) {
    return '0';
  }
  if (value.abs().lt(1)) {
    return value.toFormat(6);
  }
  return value.toFixed(2);
}

export const formatDrepHash = (hash: string, kind: 'script' | 'key'): string => {
  try {
    return convertDrepHashToCIP129Format(hash, kind);
  } catch {
    return hash;
  }
};

type TxAnalyticsPayload = EventDefinitions['Transaction Review Modal Viewed'][0];

/**
 * Builds analytics properties for a transaction using the
 * not owned - outputs (tokens leaving the wallet)
 */
export const getTransactionAnalyticsPropertiesFromRaw = (formattedTx, context?, aggregator?: string): TxAnalyticsPayload => {
  const notOwnedOutputs = formattedTx.outputs.filter(output => !output.ownAddress);

  const spentAssets = notOwnedOutputs.flatMap(output => output.assets ?? []);

  const uniqueAssets = new Map<
    string,
    {
      policy_id: string;
      asset_name: string;
      asset_ticker: string;
    }
  >();

  spentAssets.forEach(asset => {
    const ti = asset.tokenInfo;
    let rawId: string | undefined;

    if (ti.info?.id) {
      rawId = ti.info.id;
    } else if (ti.id && ti.id.includes('.')) {
      rawId = ti.id;
    }

    // Handle ADA or weird cases (no policy/asset).
    if (!rawId) {
      rawId = ti.id ?? '.';
    }

    const [policyId = '', assetNameHex = ''] = (rawId ?? '.').split('.');
    const key = `${policyId}.${assetNameHex}`;

    if (!uniqueAssets.has(key)) {
      const ticker = ti.ticker ?? ti.info?.name ?? ti.name ?? '';

      uniqueAssets.set(key, {
        policy_id: policyId,
        asset_name: assetNameHex,
        asset_ticker: ticker,
      });
    }
  });

  return {
    type: context === 'withdraw' ? 'withdraw rewards' : (context ?? ''),
    asset_count: uniqueAssets.size,
    asset_list: JSON.stringify(Array.from(uniqueAssets.values())),
    aggregator: aggregator ?? '',
  };
};
