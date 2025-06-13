import PortfolioWallet from '../../features/portfolio/useCases/Wallet/PortfolioWallet';
import PortfolioLayout from './layout';

type Props = {
  stores: any;
};

const PortfolioPage = (props: Props) => {
  return (
    <PortfolioLayout {...props}>
      <PortfolioWallet stores={props.stores} />
    </PortfolioLayout>
  );
};

export default PortfolioPage;
