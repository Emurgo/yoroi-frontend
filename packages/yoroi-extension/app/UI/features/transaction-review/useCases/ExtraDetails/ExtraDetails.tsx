import { useTxReviewModal } from '../../module/ReviewTxProvider';

export const ExtraDetails = () => {
  const { extraOverviewDetails } = useTxReviewModal();
  return <div>{extraOverviewDetails.component}</div>;
};
