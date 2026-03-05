import * as React from 'react';
import { DREP_ALWAYS_ABSTAIN, DREP_ALWAYS_NO_CONFIDENCE } from '../../common/constants';
import { useGovernance } from '../../module/GovernanceContextProvider';

type UseGovernanceDelegationStatusParams = {
  governanceStatus: ReturnType<typeof useGovernance>['governanceStatus'];
  isDelegated: boolean;
};

type UseGovernanceDelegationStatusResult = {
  isAbstain: boolean;
  isNoConfidence: boolean;
  isDelegationToDrep: boolean;
  drepID: string;
};

export const useGovernanceDelegationStatus = ({
  governanceStatus,
  isDelegated,
}: UseGovernanceDelegationStatusParams): UseGovernanceDelegationStatusResult => {
  return React.useMemo(() => {
    const drepID = governanceStatus?.drep ?? null;

    const isAbstain = isDelegated && governanceStatus?.drep === null && governanceStatus?.status === DREP_ALWAYS_ABSTAIN;
    const isNoConfidence =
      isDelegated && governanceStatus?.drep === null && governanceStatus?.status === DREP_ALWAYS_NO_CONFIDENCE;
    const isDelegationToDrep = isDelegated && !(isAbstain || isNoConfidence) && drepID != null;

    return {
      isAbstain,
      isNoConfidence,
      isDelegationToDrep,
      drepID: drepID ?? '',
    };
  }, [governanceStatus?.status, governanceStatus?.drep, isDelegated]);
};
