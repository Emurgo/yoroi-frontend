import DappCenterDashboard from '../../features/dapp-center/useCases/dashboard/DappCenterDashboard';
import DappCenterLayout from './layout';

type Props = {
  stores: any;
};

const DappCenterPage = (props: Props) => {
  return (
    <DappCenterLayout {...props}>
      <DappCenterDashboard />
    </DappCenterLayout>
  );
};

export default DappCenterPage;
