// @flow
import { defineMessages } from 'react-intl';

import type { GraphItems } from '../dashboard/GraphWrapper';
import LocalizableError from '../../../../i18n/LocalizableError';

export const emptyDashboardMessages: Object = defineMessages({
  title: {
    id: 'wallet.dashboard.empty.title',
    defaultMessage: '!!!You have not delegated your {ticker} yet',
  },
  text: {
    id: 'wallet.dashboard.empty.text',
    defaultMessage:
      '!!!Go to the delegation page to choose what stake pool you want to delegate in.',
  },
});

export type RewardsGraphData = {|
  +items: ?{|
    totalRewards: Array<GraphItems>,
    perEpochRewards: Array<GraphItems>,
  |},
  +hideYAxis: boolean,
  +error: ?LocalizableError,
|};
export type GraphData = {|
  +rewardsGraphData: RewardsGraphData,
|};
