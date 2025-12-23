// $FlowIgnore: suppressing this error
import CardanoStakingPage from '../../../../../containers/wallet/staking/CardanoStakingPage';
import { useStaking } from '../../module/StakingContextProvider';
import type { ConfigType } from '../../../../../../config/config-types';

// populated by ConfigWebpackPlugin
declare var CONFIG: ConfigType;

export const PoolList = () => {
  const { stores, delegationStore, selectedWallet } = useStaking();
  return (
    <div>
      <CardanoStakingPage
        stores={stores}
        urlTemplate={CONFIG.poolExplorer.simpleTemplate}
        poolTransition={delegationStore.getPoolTransitionInfo(selectedWallet)}
      />
    </div>
  );
};
