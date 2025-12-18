import { ReactNode } from 'react';
import {
  formatLovelacesHumanReadableShort,
  maybe,
  roundOneDecimal,
  roundTwoDecimal,
  useStaking,
} from '../../module/StakingContextProvider';
import DelegatedStakePoolCard from './DelegatedStakePoolCard';
import { observer } from 'mobx-react';

export const StakePoolDelegated = observer((): ReactNode => {
  const { delegationStore, selectedWallet } = useStaking();

  const currentPool = delegationStore.getDelegatedPoolId(selectedWallet.publicDeriverId);

  if (currentPool == null) return null;

  const poolMeta = delegationStore.getLocalPoolInfo(selectedWallet.networkId, currentPool);

  const localRemote = delegationStore.getLocalRemotePoolInfo(selectedWallet.networkId, currentPool) ?? {};

  const poolTransition = delegationStore.getPoolTransitionInfo(selectedWallet);

  const { stake, roa, saturation, pic } = localRemote;

  const delegatedPool = {
    id: String(currentPool),
    name: poolMeta?.info?.name ?? '',
    avatar: pic,
    roa: maybe(roa, x => roundTwoDecimal(Number(x))),
    poolSize: maybe(stake, formatLovelacesHumanReadableShort),
    share: maybe(saturation, s => roundOneDecimal(Number(s) * 100)),
    websiteUrl: poolMeta?.info?.homepage,
    ticker: poolMeta?.info?.ticker,
  };
  return (
    <DelegatedStakePoolCard
      poolTransition={poolTransition}
      delegatedPool={delegatedPool}
      delegateToSpecificPool={async (poolId): Promise<any> => {
        if (poolId != null) {
          return delegationStore.createDelegationTransaction(poolId);
        }
      }}
    />
  );
});
