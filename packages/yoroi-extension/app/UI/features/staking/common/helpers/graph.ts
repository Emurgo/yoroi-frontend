
import {
  getCardanoHaskellBaseConfig,
  isCardanoHaskell,
  getNetworkById,
} from '../../../../../api/ada/lib/storage/database/prepackaged/networks'
import { MultiToken } from '../../../../../api/common/lib/MultiToken'
import type {
  PoolMeta,
  DelegationRequests,
} from '../../../../../stores/toplevel/DelegationStore'
import type { TokenInfoMap } from '../../../../../stores/toplevel/TokenInfoStore'
import type { TokenEntry } from '../../../../../api/common/lib/MultiToken'
import { GraphData, GraphItems } from '../types'

/**
 * Reward history entry:
 * [ epochNumber, rewardMultiToken, poolHash ]
 */
type RewardHistoryEntry = [number, MultiToken, string]

type GenerateRewardGraphDataArgs = {
  delegationRequests: DelegationRequests
  currentEpoch: number
  networkId: number
  defaultTokenId: string
  getLocalPoolInfo: (networkId: number, poolHash: string) => PoolMeta | void
  tokenInfo: TokenInfoMap
}

type RewardGraphItemsResult = {
  totalRewards: GraphItems[]
  perEpochRewards: GraphItems[]
}

const generateRewardGraphData = (
  request: GenerateRewardGraphDataArgs,
): RewardGraphItemsResult | null => {
  const defaultToken = {
    defaultNetworkId: request.networkId,
    defaultIdentifier: request.defaultTokenId,
  }

  const network = getNetworkById(request.networkId)

  const history =
    request.delegationRequests.rewardHistory
      .result as RewardHistoryEntry[] | null | undefined
  if (history == null) {
    return null
  }

  let historyIterator = 0

  // the reward history endpoint doesn't contain entries when the reward was 0
  // so we need to insert these manually
  const totalRewards: GraphItems[] = []
  const perEpochRewards: GraphItems[] = []
  let amountSum = new MultiToken([], defaultToken)

  const startEpoch = (() => {
    if (isCardanoHaskell(network)) {
      const shelleyConfig = getCardanoHaskellBaseConfig(network)[1]
      return shelleyConfig.StartAt
    }
    return 0
  })()

  const endEpoch = (() => {
    if (isCardanoHaskell(network)) {
      // TODO: -1 since cardano-db-sync doesn't expose this information for some reason
      return request.currentEpoch - 1
    }
    throw new Error(
      `${String(generateRewardGraphData)} can't compute endEpoch for rewards`,
    )
  })()

  const getMiniPoolInfo = (poolHash: string): string => {
    const meta = request.getLocalPoolInfo(request.networkId, poolHash)
    if (
      meta == null ||
      meta.info == null ||
      meta.info.ticker == null ||
      meta.info.name == null
    ) {
      return poolHash
    }
    return `[${meta.info.ticker}] ${meta.info.name}`
  }

  const getNormalized = (tokenEntry: TokenEntry) => {
    const tokenRow = request.tokenInfo
      .get(tokenEntry.networkId.toString())
      ?.get(tokenEntry.identifier)

    if (tokenRow == null) {
      throw new Error(
        `${String(generateRewardGraphData)} no token info for ${JSON.stringify(
          tokenEntry,
        )}`,
      )
    }

    return tokenEntry.amount.shiftedBy(-tokenRow.Metadata.numberOfDecimals)
  }

  for (let i = startEpoch; i < endEpoch; i++) {
    const currentHistoryEntry = history[historyIterator]
    if (historyIterator < history.length && currentHistoryEntry != null && i === currentHistoryEntry[0]) {
      // exists a reward for this epoch
      const poolHash = currentHistoryEntry[2]
      const nextReward = currentHistoryEntry[1]
      amountSum = amountSum.joinAddMutable(nextReward)

      totalRewards.push({
        name: i,
        primary: getNormalized(amountSum.getDefaultEntry()).toNumber(),
        poolName: getMiniPoolInfo(poolHash),
      })

      perEpochRewards.push({
        name: i,
        primary: getNormalized(nextReward.getDefaultEntry()).toNumber(),
        poolName: getMiniPoolInfo(poolHash),
      })

      historyIterator++
    } else {
      // no reward for this epoch
      totalRewards.push({
        name: i,
        primary: getNormalized(amountSum.getDefaultEntry()).toNumber(),
        poolName: '',
      })

      perEpochRewards.push({
        name: i,
        primary: 0,
        poolName: '',
      })
    }
  }

  return {
    totalRewards,
    perEpochRewards,
  }
}

type GenerateGraphDataArgs = {
  delegationRequests: DelegationRequests
  networkId: number
  defaultTokenId: string
  currentEpoch: number
  shouldHideBalance: boolean
  getLocalPoolInfo: (networkId: number, poolHash: string) => PoolMeta | void
  tokenInfo: TokenInfoMap
}

export const generateGraphData = (request: GenerateGraphDataArgs): GraphData => {
  return {
    rewardsGraphData: {
      error: request.delegationRequests.rewardHistory.error,
      items: generateRewardGraphData({
        delegationRequests: request.delegationRequests,
        currentEpoch: request.currentEpoch,
        networkId: request.networkId,
        defaultTokenId: request.defaultTokenId,
        getLocalPoolInfo: request.getLocalPoolInfo,
        tokenInfo: request.tokenInfo,
      }) ?? undefined,
      hideYAxis: request.shouldHideBalance,
    },
  }
}
