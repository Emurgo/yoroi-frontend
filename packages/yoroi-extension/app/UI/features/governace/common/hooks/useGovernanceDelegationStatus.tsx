import * as React from 'react';
import { DREP_ALWAYS_ABSTAIN, DREP_ALWAYS_NO_CONFIDENCE, YOROI_DREP_ID, YOROI_DREP_ID_TESTNET } from '../../common/constants';
import { useGovernance } from '../../module/GovernanceContextProvider';

type UseGovernanceDelegationStatusParams = {
  governanceStatus: ReturnType<typeof useGovernance>['governanceStatus'];
  isDelegated: boolean;
};

type UseGovernanceDelegationStatusResult = {
  isAbstain: boolean;
  isNoConfidence: boolean;
  isDelegationToYoroiDrep: boolean;
  isDelegationToOtherDrep: boolean;
  drepID: string;
};

export const useGovernanceDelegationStatus = ({
  governanceStatus,
  isDelegated,
}: UseGovernanceDelegationStatusParams): UseGovernanceDelegationStatusResult => {
  const { isTestnet } = useGovernance();

  return React.useMemo(() => {
    const yoroiDrepId = isTestnet ? YOROI_DREP_ID_TESTNET : YOROI_DREP_ID;
    const drepID = governanceStatus?.drep ? governanceStatus?.drep : yoroiDrepId;

    const isAbstain = isDelegated && governanceStatus?.drep === null && governanceStatus?.status === DREP_ALWAYS_ABSTAIN;
    const isNoConfidence =
      isDelegated && governanceStatus?.drep === null && governanceStatus?.status === DREP_ALWAYS_NO_CONFIDENCE;
    const isDelegationToYoroiDrep = isDelegated && !(isAbstain || isNoConfidence) && drepID === yoroiDrepId;
    const isDelegationToOtherDrep = isDelegated && !(isAbstain || isNoConfidence) && drepID !== yoroiDrepId;

    return {
      isAbstain,
      isNoConfidence,
      isDelegationToYoroiDrep,
      isDelegationToOtherDrep,
      drepID,
    };
  }, [governanceStatus?.status, governanceStatus?.drep, isDelegated, isTestnet]);
};
