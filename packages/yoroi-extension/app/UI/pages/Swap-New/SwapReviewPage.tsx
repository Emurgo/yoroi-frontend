import ReviewSwap from '../../features/swap-new/useCases/ReviewReview/ReviewSwap';
import SwapLayout from './layout';

type Props = {
  stores: any;
};

const SwapReviewPage = (props: Props) => {
  return (
    <SwapLayout {...props}>
      <ReviewSwap stores={props.stores} />
    </SwapLayout>
  );
};

export default SwapReviewPage;
