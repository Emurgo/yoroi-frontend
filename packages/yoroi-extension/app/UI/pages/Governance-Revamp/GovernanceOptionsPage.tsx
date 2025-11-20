import GovernanceLayout from './layout';
import { DRepOptions } from '../../features/governace/useCases/GovernanceStatusRevamp/DRepOptions';

type Props = {
  stores: any;
  children?: any;
};

const GovernanceOptionsPage = (props: Props): any => {
  return (
    <GovernanceLayout {...props}>
        <DRepOptions />
    </GovernanceLayout>
  );
};

export default GovernanceOptionsPage;
