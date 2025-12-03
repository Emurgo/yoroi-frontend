import GovernanceLayout from './layout';
import { GovernanceStatus } from '../../features/governace/useCases/GovernanceStatus/GovernanceStatus';

type Props = {
  stores: any;
  children?: any;
};

const GovernanceStatusPage = (props: Props): any => {
  return (
    <GovernanceLayout {...props}>
      <GovernanceStatus />
    </GovernanceLayout>
  );
};

export default GovernanceStatusPage;
