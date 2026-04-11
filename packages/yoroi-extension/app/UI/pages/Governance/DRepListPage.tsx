import GovernanceLayout from './layout';
import { DRepList } from '../../features/governace/useCases/DRepList/DRepList';

type Props = {
  stores: any;
};

const DRepListPage = (props: Props): any => {
  return (
    <GovernanceLayout {...props}>
      <DRepList />
    </GovernanceLayout>
  );
};

export default DRepListPage;
