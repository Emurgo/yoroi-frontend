import React from 'react';
import { AssetSwap } from '../../features/swap-new/useCases/AssetSwap/AssetSwap';
import SwapLayout from './layout';

type Props = {
  stores: any;
  actions: any;
};

const AssetSwapPage = (props: Props) => {
  return (
    <SwapLayout {...props}>
      <AssetSwap />
    </SwapLayout>
  );
};

export default AssetSwapPage;
