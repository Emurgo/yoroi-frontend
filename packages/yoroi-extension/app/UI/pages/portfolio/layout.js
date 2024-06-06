// @flow
import PortfolioPageLayout from '../../layout/PortfolioPageLayout';

type Props = {|
  stores: any,
  actions: any,
  children?: React$Node,
|};

const PortfolioLayout = ({ stores, actions, children }: Props) => {
  return (
    <PortfolioPageLayout stores={stores} actions={actions}>
      {children}
    </PortfolioPageLayout>
  );
};

export default PortfolioLayout;
