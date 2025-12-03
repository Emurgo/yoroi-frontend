import GovernanceLayout from './layout';
import { GovernanceStatusRevamp } from '../../features/governace/useCases/GovernanceStatusRevamp/GovernanceStatusRevamp';

type Props = {
  stores: any;
  children?: any;
};

const GovernanceStatusPage = (props: Props): any => {
  return (
    <GovernanceLayout {...props}>
      <GovernanceStatusRevamp />
    </GovernanceLayout>
  );
};

export default GovernanceStatusPage;
