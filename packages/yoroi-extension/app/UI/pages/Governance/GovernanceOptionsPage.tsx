import GovernanceLayout from './layout';
import { DRepOptions } from '../../features/governace/useCases/GovernanceOptions/DRepOptions';
import { NotAllowedInGovernance } from '../../features/governace/useCases/GovernanceStatus/NotAllowedInGovernance';
import { useIsGovernanceAllowed } from '../../features/governace/common/hooks/useIsGovernanceAllowed';

type Props = {
  stores: any;
  children?: any;
};

const GovernanceOptionsPage = (props: Props): any => {
  const { isNotAllowed } = useIsGovernanceAllowed();

  return <GovernanceLayout {...props}>{isNotAllowed ? <NotAllowedInGovernance /> : <DRepOptions />}</GovernanceLayout>;
};

export default GovernanceOptionsPage;
