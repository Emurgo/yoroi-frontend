import { Chain } from '@yoroi/types';

import { QueryKey } from '@tanstack/react-query';

/**
 * React Query Query Factories
 * Standardized query keys and factory functions for consistent cache management
 */

// ============================================================================
// Pool Queries
// ============================================================================

export const poolQueryKeys = {
  /**
   * Query key for pool list
   * @param walletId - Wallet ID
   * @param network - Network
   * @param searchQuery - Optional search query
   */
  list: (walletId: string, network: Chain.SupportedNetworks, searchQuery?: string): QueryKey => [
    'poolList',
    walletId,
    network,
    searchQuery?.trim() ?? '',
  ],

  /**
   * Query key for a single pool info
   * @param poolId - Pool ID
   */
  info: (poolId: string): QueryKey => ['usePoolInfo', poolId],

  /**
   * Query key for pool list with pagination
   * @param walletId - Wallet ID
   * @param network - Network
   * @param searchQuery - Optional search query
   * @param pageParam - Page parameter for infinite queries
   */
  listInfinite: (walletId: string, network: Chain.SupportedNetworks, searchQuery?: string, pageParam?: number): QueryKey => [
    'poolList',
    walletId,
    network,
    searchQuery?.trim() ?? '',
    pageParam ?? 0,
  ],
};
