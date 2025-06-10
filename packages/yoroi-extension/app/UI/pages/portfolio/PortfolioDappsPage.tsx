import mockData from '../../features/portfolio/common/mockData';
import PortfolioDapps from '../../features/portfolio/useCases/Dapps/PortfolioDapps';
import PortfolioLayout from './layout';

type Props = {
  stores: any;
};

const PortfolioDappsPage = (props: Props) => {
  return (
    <PortfolioLayout {...props}>
      <PortfolioDapps data={mockData.dapps} stores={props.stores} />
    </PortfolioLayout>
  );
};

export default PortfolioDappsPage;
