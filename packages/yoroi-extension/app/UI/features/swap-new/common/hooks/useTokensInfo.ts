import * as React from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { isRight } from '@yoroi/common';
import { isPrimaryToken, createUnknownTokenInfo } from '@yoroi/portfolio';
import { Portfolio, Chain } from '@yoroi/types';

type TokenId = string;

type UseSyncedTokenInfosProps = {
  swapManager: any;
  tokenManager: any;
  primaryTokenInfo: Portfolio.Token.Info;
  networkId: Chain.Network;
  excludedTokens: string[];
};

type RawResult = {
  tokenIds: TokenId[];
  tokenInfosArray: Array<[TokenId, Portfolio.Token.Info]>;
};

type SelectedResult = {
  tokenIds: TokenId[];
  tokenInfos: Map<TokenId, Portfolio.Token.Info>;
  tokenInfoList: Portfolio.Token.Info[];
};

/* ---------------- helpers ---------------- */

const isHex = (s: string) => /^[0-9a-f]*$/i.test(s);

const canon = (raw?: string | { id: string } | null): string | null => {
  const s = typeof raw === 'string' ? raw : raw?.id;
  if (!s) return null;
  let t = s.trim();
  while (t.endsWith(':')) t = t.slice(0, -1);
  return t.toLowerCase();
};

const canonAssetId = (raw?: string | { id: string } | null): string | null => {
  const s = canon(raw);
  if (!s) return null;
  if (s === '.') return '.';
  if (s.endsWith('.')) return null;
  const parts = s.split('.');
  if (parts.length > 2) return null;
  const policy = parts[0];
  const asset = parts[1] ?? undefined;
  if (!policy || policy.length !== 56 || !isHex(policy)) return null;
  if (asset != null && (asset.length > 64 || !isHex(asset))) return null;
  return asset != null ? `${policy}.${asset}` : policy;
};

const scoreInfo = (info?: Portfolio.Token.Info) => {
  if (!info) return -1;
  let score = 0;
  if (info.status && info.status !== 'unknown') score += 10;
  if (info.decimals && info.decimals > 0) score += 5;
  if (info.ticker) score += 3;
  if (info.name && !/^unknown/i.test(info.name)) score += 2;
  return score;
};
const preferBetter = (prev: Portfolio.Token.Info | undefined, next: Portfolio.Token.Info) =>
  scoreInfo(next) > scoreInfo(prev) ? next : (prev ?? next);

/** Normalize sync response into [id, infoLike] pairs, supporting Map */
const normalizeSyncResponse = (response: unknown): Array<[string, { record?: Portfolio.Token.Info } | undefined]> => {
  const out: Array<[string, { record?: Portfolio.Token.Info } | undefined]> = [];

  if (response && typeof (response as any)[Symbol.iterator] === 'function') {
    try {
      for (const item of response as any) {
        if (Array.isArray(item) && item.length >= 2) {
          out.push([item[0], item[1]]);
          continue;
        }
        // Some libs yield objects even when "iterable"
        if (item && typeof item === 'object' && 'key' in item) {
          out.push([(item as any).key, (item as any).value]);
        }
      }
      if (out.length) return out;
    } catch {
      /* fallthrough */
    }
  }

  if (Array.isArray(response)) {
    for (const obj of response) {
      if (obj && typeof obj === 'object' && 'key' in (obj as any)) {
        out.push([(obj as any).key, (obj as any).value]);
      }
    }
    if (out.length) return out;
  }

  return out;
};

// One cache per networkId (so switching networks isolates data)
const stickyByNetwork = new Map<string | number, Map<string, Portfolio.Token.Info>>();
const getSticky = (networkId: string | number) => {
  if (!stickyByNetwork.has(networkId)) stickyByNetwork.set(networkId, new Map());
  return stickyByNetwork.get(networkId)!;
};

/* ---------------- hook ---------------- */

export const useSyncedTokenInfos = ({
  swapManager,
  tokenManager,
  primaryTokenInfo,
  networkId,
  excludedTokens,
}: UseSyncedTokenInfosProps) => {
  const qc = useQueryClient();
  const sticky = getSticky(networkId);

  const excluded = React.useMemo(() => {
    const unique = new Set(excludedTokens.map(t => (t ?? '').trim().toLowerCase()));
    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [excludedTokens]);

  const primaryId = React.useMemo(() => canonAssetId(primaryTokenInfo?.id), [primaryTokenInfo?.id]);

  const key = React.useMemo(
    () => ['syncedTokenInfos', networkId, primaryId ?? null, excluded] as const,
    [networkId, primaryId, excluded]
  );

  const queryResult = useQuery<RawResult, unknown, SelectedResult>({
    queryKey: key,
    enabled: Boolean(swapManager && tokenManager && primaryId) && !excluded.includes(primaryId!),

    queryFn: async (): Promise<RawResult> => {
      const res = await swapManager.api.tokens();
      if (!isRight(res)) return { tokenIds: [], tokenInfosArray: [] };

      const value = res.value as { data: Array<{ id: string | { id: string } }> };
      const tokenIds = Array.from(
        new Set(value.data.map(({ id }) => canonAssetId(id)).filter((id): id is string => !!id && !excluded.includes(id)))
      );

      const entries = new Map<string, Portfolio.Token.Info>(sticky);

      // Always include primary under its real id ('.' allowed)
      if (primaryId && !excluded.includes(primaryId)) {
        entries.set(primaryId, preferBetter(entries.get(primaryId), primaryTokenInfo));
      }

      // Only non-primary go to sync
      const secondaryTokenIds = tokenIds.filter(id => !isPrimaryToken(id) && id !== '.');
      if (secondaryTokenIds.length === 0) {
        // persist sticky and return
        sticky.clear();
        for (const [k, v] of entries) sticky.set(k, v);
        return { tokenIds, tokenInfosArray: Array.from(entries.entries()) };
      }

      try {
        const response = await tokenManager.sync({
          secondaryTokenIds,
          sourceId: 'SwapProvider',
        });

        const pairs = normalizeSyncResponse(response);

        for (const [rawId, infoLike] of pairs) {
          const id = canonAssetId(rawId);
          if (!id || excluded.includes(id)) continue;
          const next = infoLike?.record ?? createUnknownTokenInfo({ id: id as any, name: id });
          entries.set(id, preferBetter(entries.get(id), next));
        }

        // write-through to sticky so it survives page changes
        sticky.clear();
        for (const [k, v] of entries) sticky.set(k, v);

        return { tokenIds, tokenInfosArray: Array.from(entries.entries()) };
      } catch (err: any) {
        // For a 404 batch, just keep what we already had (sticky + primary)
        if (err?.response?.status === 404) {
          sticky.clear();
          for (const [k, v] of entries) sticky.set(k, v);
          return { tokenIds: [], tokenInfosArray: Array.from(entries.entries()) };
        }
        throw err;
      }
    },

    select: (data): SelectedResult => {
      const prev = qc.getQueryData<SelectedResult>(key);
      const merged = new Map<string, Portfolio.Token.Info>(sticky);

      if (prev?.tokenInfos) {
        for (const [id, info] of prev.tokenInfos) merged.set(id, preferBetter(merged.get(id), info));
      }

      for (const [id, info] of data.tokenInfosArray) merged.set(id, preferBetter(merged.get(id), info));

      const tokenInfoList = Array.from(merged.values());
      return { tokenIds: data.tokenIds, tokenInfos: merged, tokenInfoList };
    },

    keepPreviousData: true,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: false,
    staleTime: Infinity,
    cacheTime: 5 * 60 * 1000,
  });

  return {
    ...queryResult,
    isLoading: queryResult.isLoading,
    isFetching: queryResult.isFetching,
    data: queryResult.data,
    error: queryResult.error,
  };
};
