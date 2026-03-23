import { networks } from '../../../../../api/ada/lib/storage/database/prepackaged/networks';
import { useGovernance } from '../../module/GovernanceContextProvider';

export const useIsGovernanceAllowed = () => {
  const { governanceStatus, walletAdaBalance, networkId } = useGovernance();

  const isLoading = governanceStatus.status === null;
  const isParticipating = !isLoading && governanceStatus.status !== 'none';

  const hasZeroAda = walletAdaBalance !== null && walletAdaBalance === 0;
  const isTestnet = networkId !== networks.CardanoMainnet.NetworkId;

  const isNotAllowed = !isLoading && !isParticipating && hasZeroAda;

  return {
    isNotAllowed,
    isParticipating,
    hasZeroAda,
    isTestnet,
  };
};
