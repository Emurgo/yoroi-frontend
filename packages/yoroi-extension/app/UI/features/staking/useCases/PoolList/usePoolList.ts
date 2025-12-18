// import { API_ENDPOINTS } from '@yoroi/api';
// import { DEFAULT_SATURATION_THRESHOLD, ExplorerPoolInfo, poolInfoApiMaker } from '@yoroi/staking';
// import { Chain } from '@yoroi/types';

// import { useQuery, useQueryClient } from '@tanstack/react-query';
// import axios from 'axios';
// import * as React from 'react';
// import { poolQueryKeys } from '../../../../common/queries/factories';
// import { useStaking } from '../../module/StakingContextProvider';

// type ExplorerPoolInfoApiRes = {
//   data?: {
//     data?: Array<{
//       pool_id: string;
//       pool_id_hash_raw: string;
//       pool_name: {
//         ticker: string;
//         name: string;
//       };
//       pool_update: {
//         active: {
//           fixed_cost: number;
//           margin: number;
//         };
//       };
//       stats: {
//         lifetime: {
//           roa: number;
//         };
//       };
//       live_stake: number;
//       roa: string;
//       saturation: number;
//     }>;
//   };
// };

// const POOLS_LIMIT = 250;

// const fetchPools = async (apiUrl: string, searchQuery?: string): Promise<ExplorerPoolInfo[]> => {
//   const params = new URLSearchParams({
//     limit: String(POOLS_LIMIT),
//     order: 'ranking',
//   });

//   // Add search parameter if provided
//   if (searchQuery && searchQuery.trim().length > 0) {
//     const trimmedSearch = searchQuery.trim();
//     params.set('name', trimmedSearch);
//   }

//   const url = `${apiUrl}/cexplorer-pool-list?${params.toString()}`;
//   const response = await axios.get<ExplorerPoolInfoApiRes>(url);

//   const poolsData = response.data;
//   if (!poolsData.data?.data?.length) {
//     return [];
//   }

//   const pools: ExplorerPoolInfo[] = poolsData.data.data.map(pool => ({
//     id: pool.pool_id,
//     hash: pool.pool_id_hash_raw,
//     ticker: pool.pool_name.ticker,
//     name: pool.pool_name.name,
//     pic: `https://ix.cexplorer.io/${pool.pool_id}`,
//     stake:
//       pool.live_stake != null && typeof pool.live_stake === 'number' && isFinite(pool.live_stake) ? String(pool.live_stake) : '',
//     roa: String(pool.stats.lifetime.roa),
//     taxFix: String(pool.pool_update.active.fixed_cost),
//     taxRatio: String(pool.pool_update.active.margin),
//     saturation: String(pool.saturation),
//   }));

//   return pools;
// };

// export const usePoolList = (searchQuery?: string) => {
//   const { selectedWallet } = useStaking();

//   const apiUrl = React.useMemo(() => {
//     if (selectedWallet.isMainnet) {
//       return API_ENDPOINTS[Chain.Network.Mainnet].root;
//     }
//     if (selectedWallet.networkManager.network === Chain.Network.Preprod) {
//       return API_ENDPOINTS[Chain.Network.Preprod].root;
//     }
//     return API_ENDPOINTS[Chain.Network.Preview].root;
//   }, [selectedWallet.isMainnet, selectedWallet.networkManager.network]);
//   // Normalize search query
//   const normalizedSearch = searchQuery?.trim() || undefined;

//   // Create query key - React Query will refetch when this changes
//   const queryKey = React.useMemo(
//     () => poolQueryKeys.list(selectedWallet.id, selectedWallet.networkManager.network, normalizedSearch),
//     [selectedWallet.id, selectedWallet.networkManager.network, normalizedSearch]
//   );

//   // Memoize queryFn to ensure it uses the latest normalizedSearch
//   const queryFn = React.useCallback(() => fetchPools(apiUrl, normalizedSearch), [apiUrl, normalizedSearch]);

//   const {
//     data: poolsData,
//     error,
//     isLoading,
//   } = useQuery({
//     queryKey,
//     queryFn,
//     staleTime: normalizedSearch ? 0 : 5 * 60 * 1000, // No cache for search results, longer for regular list
//     gcTime: 10 * 60 * 1000, // 10 minutes cache
//     retry: normalizedSearch ? 1 : 2, // Fewer retries for search queries (they're fast)
//     refetchOnWindowFocus: false, // Don't refetch on window focus
//     enabled: true,
//   });

//   // Fetch pool transition info to get preferred pools
//   const poolInfoApi = React.useMemo(
//     () =>
//       poolInfoApiMaker({
//         legacyApiBaseUrl: 'https://api.yoroiwallet.com/api', //hardcoded legacy base url - add it from config later
//         zeroApiUrl: apiUrl,
//       }),
//     [apiUrl]
//   );

//   const transitionDataQuery = useQuery({
//     queryKey: ['poolTransitionInfo', selectedWallet.networkManager.network],
//     queryFn: () => poolInfoApi.getPoolTransitionInfoPublic(),
//     enabled: selectedWallet.isMainnet && !normalizedSearch, // Only fetch for mainnet and when not searching
//     staleTime: 5 * 60 * 1000, // Cache for 5 minutes
//     gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
//     retry: 2,
//   });

//   // Extract preferred pool IDs from transition data
//   const preferredPoolIds = React.useMemo(() => {
//     const transitionData = transitionDataQuery.data;
//     if (!transitionData?.new) {
//       return new Set<string>();
//     }

//     // Flatten all preferred pool IDs from all groups
//     const allPreferredIds = new Set<string>();
//     for (const groupName of Object.keys(transitionData.new)) {
//       const poolIds = transitionData.new[groupName];
//       if (Array.isArray(poolIds)) {
//         poolIds.forEach(id => allPreferredIds.add(id));
//       }
//     }

//     return allPreferredIds;
//   }, [transitionDataQuery.data]);

//   // Memoize sorted array for query key to avoid recreating it
//   const preferredPoolIdsArray = React.useMemo(() => Array.from(preferredPoolIds).sort(), [preferredPoolIds]);

//   // Get saturation threshold from transition data or use default
//   const saturationThreshold = React.useMemo(() => {
//     const transitionData = transitionDataQuery.data;
//     const threshold = transitionData?.saturationThreshold ?? DEFAULT_SATURATION_THRESHOLD;
//     // Ensure threshold is between 0 and 1
//     if (threshold < 0 || threshold > 1) {
//       return DEFAULT_SATURATION_THRESHOLD;
//     }
//     return threshold;
//   }, [transitionDataQuery.data]);

//   // Fetch preferred pools individually if they're not in the loaded pages
//   const preferredPoolsQuery = useQuery({
//     queryKey: ['preferredPools', selectedWallet.networkManager.network, preferredPoolIdsArray.join(',')],
//     queryFn: async () => {
//       if (preferredPoolIds.size === 0) return [];

//       // Fetch all preferred pools in parallel
//       const poolPromises = preferredPoolIdsArray.map(poolId =>
//         poolInfoApi.getPool(poolId).catch(error => {
//           console.warn('Failed to fetch preferred pool', {
//             origin: 'staking',
//             operation: 'usePoolList',
//             poolId,
//             error: error instanceof Error ? error.message : String(error),
//           });
//           return null;
//         })
//       );

//       const results = await Promise.all(poolPromises);
//       return results.filter((pool): pool is ExplorerPoolInfo => pool !== null);
//     },
//     enabled: selectedWallet.isMainnet && !normalizedSearch && preferredPoolIds.size > 0 && !!transitionDataQuery.data,
//     staleTime: 5 * 60 * 1000, // Cache for 5 minutes
//     retry: 2,
//   });

//   // Sort pools: preferred non-saturated pools first, then rest
//   // Skip preferred pool sorting when searching by name
//   const pools = React.useMemo(() => {
//     const allPools = poolsData ?? [];
//     const fetchedPreferredPools = preferredPoolsQuery.data ?? [];

//     if (allPools.length === 0 && fetchedPreferredPools.length === 0) {
//       return [];
//     }

//     // When searching, return pools as-is without preferred pool sorting
//     if (normalizedSearch) {
//       return allPools;
//     }

//     // If no preferred pools, return pools as-is
//     if (preferredPoolIds.size === 0) {
//       return allPools;
//     }

//     // Merge fetched preferred pools with loaded pools, avoiding duplicates
//     // Use Set for O(1) lookup performance
//     const loadedPoolIds = new Set(allPools.map(p => p.id));
//     const mergedPools = [...allPools, ...fetchedPreferredPools.filter(p => !loadedPoolIds.has(p.id))];

//     // Separate pools into preferred non-saturated, preferred saturated, and others
//     const preferredNonSaturated: ExplorerPoolInfo[] = [];
//     const preferredSaturated: ExplorerPoolInfo[] = [];
//     const others: ExplorerPoolInfo[] = [];

//     for (const pool of mergedPools) {
//       if (preferredPoolIds.has(pool.id)) {
//         const saturation = Number(pool.saturation);
//         const isSaturated = isNaN(saturation) || saturation > saturationThreshold;
//         if (!isSaturated) {
//           preferredNonSaturated.push(pool);
//         } else {
//           preferredSaturated.push(pool);
//         }
//       } else {
//         others.push(pool);
//       }
//     }

//     // Return: preferred non-saturated first, then preferred saturated, then others
//     return [...preferredNonSaturated, ...preferredSaturated, ...others];
//   }, [poolsData, preferredPoolIds, saturationThreshold, preferredPoolsQuery.data, normalizedSearch]);

//   const errorResult: Error | null = error instanceof Error ? error : error ? new Error(String(error)) : null;

//   return {
//     pools,
//     isLoading,
//     error: errorResult,
//     loadMore: () => {}, // No-op since we fetch all pools at once
//     hasMore: false, // No pagination
//     isFetchingMore: false,
//   };
// };

// // Prefetch function for use in DashboardScreen
// export const usePrefetchPoolList = () => {
//   const { selectedWallet } = useStaking();
//   const queryClient = useQueryClient();

//   return React.useCallback(() => {
//     if (!selectedWallet.isMainnet) return; // Only prefetch for mainnet
//     const apiUrl = API_ENDPOINTS[Chain.Network.Mainnet].root;
//     const queryKey = poolQueryKeys.list(selectedWallet.id, selectedWallet.networkManager.network, undefined);

//     queryClient.prefetchQuery({
//       queryKey,
//       queryFn: () => fetchPools(apiUrl),
//     });
//   }, [selectedWallet.id, selectedWallet.isMainnet, selectedWallet.networkManager.network, queryClient]);
// };
