import { observer } from 'mobx-react';
import React from 'react';
import { ReviewTxManager } from '../module/ReviewTxManager';

export const ReviewTxModal = observer(() => {
  return <ReviewTxManager />;
});
