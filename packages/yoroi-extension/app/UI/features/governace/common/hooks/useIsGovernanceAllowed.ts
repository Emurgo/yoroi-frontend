import {networks} from '../../../../../api/ada/lib/storage/database/prepackaged/networks';
import {useGovernance} from '../../module/GovernanceContextProvider';

export const useIsGovernanceAllowed = () => {
  const {governanceStatus, walletAdaBalance, networkId} = useGovernance();

  const isParticipating =
    governanceStatus.status != null && governanceStatus.status !== 'none';

  const hasZeroAda = walletAdaBalance !== null && walletAdaBalance === 0;
  const isTestnet = networkId !== networks.CardanoMainnet.NetworkId;

  const isNotAllowed = !isParticipating && hasZeroAda;

  return {
    isNotAllowed,
    isParticipating,
    hasZeroAda,
    isTestnet,
  };
};
