import { StakingRoot } from '../../features/staking/StakingRoot';
import Layout from './layout';

const StakingPage = ({ stores }) => {
  return (
    <Layout stores={stores}>
      <StakingRoot />
    </Layout>
  );
};

export default StakingPage;
