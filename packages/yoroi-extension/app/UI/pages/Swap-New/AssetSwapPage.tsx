import { AssetSwap } from '../../features/swap-new/useCases/AssetSwap/AssetSwap';
import SwapLayout from './layout';

type Props = {
  stores: any;
};

const AssetSwapPage = (props: Props) => {
  return (
    <SwapLayout {...props}>
      <AssetSwap />
    </SwapLayout>
  );
};

export default AssetSwapPage;
