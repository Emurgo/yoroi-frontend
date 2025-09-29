import { SwapOrders } from '../../features/swap-new/useCases/SwapOrders.tsx/SwapOrders';
import SwapLayout from './layout';

type Props = {
  stores: any;
};

const SwapOrdersPage = (props: Props) => {
  return (
    <SwapLayout {...props}>
      <SwapOrders />
    </SwapLayout>
  );
};

export default SwapOrdersPage;
