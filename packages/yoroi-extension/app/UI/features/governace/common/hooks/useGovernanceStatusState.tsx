import * as React from 'react';
import { useGovernance } from '../../module/GovernanceContextProvider';
import { GOVERNANCE_STATUS, GovernanceStatusState } from '../../common/constants';

type UseGovernanceStatusStateResult = {
  governanceStatusState: GovernanceStatusState;
  governanceStatus: ReturnType<typeof useGovernance>['governanceStatus'];
  isPendingDrepDelegationTx: boolean;
};

export const useGovernanceStatusState = (): UseGovernanceStatusStateResult => {
  const { governanceStatus, submitedTransactions } = useGovernance();

  const isPendingDrepDelegationTx = submitedTransactions.length > 0 && submitedTransactions[0]?.isDrepDelegation === true;

  const governanceStatusState: GovernanceStatusState = React.useMemo(() => {
    if (governanceStatus.status === 'none' && governanceStatus.drep === null) {
      return GOVERNANCE_STATUS.IDLE;
    }
    if (governanceStatus.status === 'delegate' && governanceStatus.drep !== null) {
      return GOVERNANCE_STATUS.DELEGATED;
    }
    if (isPendingDrepDelegationTx) {
      return GOVERNANCE_STATUS.DISABLED;
    }
    return GOVERNANCE_STATUS.IDLE;
  }, [governanceStatus.status, governanceStatus.drep, isPendingDrepDelegationTx]);

  return {
    governanceStatusState,
    governanceStatus,
    isPendingDrepDelegationTx,
  };
};
