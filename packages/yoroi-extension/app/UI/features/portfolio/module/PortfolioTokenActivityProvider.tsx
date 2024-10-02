import { invalid } from '@yoroi/common';
import { Portfolio } from '@yoroi/types';
import { freeze, produce } from 'immer';
import React from 'react';
import { useQueryClient } from 'react-query';

import { queryInfo } from '../../../utils/query-client';
import { useMultiTokenActivity } from '../../../utils/useMultiTokenActivity';
import { usePortfolio } from './PortfolioContextProvider';

const queryKey = [queryInfo.keyToPersist, 'portfolioTokenActivity'];
const defaultPortfolioTokenActivityState: PortfolioTokenActivityState = freeze(
  {
    secondaryTokenIds: [],
    aggregatedBalances: {},
    tokenActivity: { data24h: {}, data30d: {}, data7d: {} },
    activityWindow: Portfolio.Token.ActivityWindow.OneDay,
    isLoading: false,
  },
  true
);

const PortfolioTokenActivityContext = React.createContext<PortfolioTokenActivityState>({
  ...defaultPortfolioTokenActivityState,
});

type Props = {
  children: React.ReactNode;
};

export const PortfolioTokenActivityProvider = ({ children }: Props) => {
  const queryClient = useQueryClient();
  const [state, dispatch] = React.useReducer(portfolioTokenActivityReducer, defaultPortfolioTokenActivityState);

  const actions = React.useRef<PortfolioTokenActivityActions>({
    secondaryTokenIdsChanged: secondaryTokenIds => {
      dispatch({
        type: PortfolioTokenActivityActionType.SecondaryTokenIdsChanged,
        secondaryTokenIds,
      });
    },
    tokenActivityChanged: (tokenActivity: any) => {
      dispatch({
        type: PortfolioTokenActivityActionType.TokenActivityChanged,
        tokenActivity,
      });
    },
    activityWindowChanged: activityWindow => {
      dispatch({
        type: PortfolioTokenActivityActionType.ActivityWindowChanged,
        activityWindow,
      });
    },
  }).current;

  const { ftAssetList, walletBalance } = usePortfolio();

  React.useEffect(() => {
    const listForActivity: any = ftAssetList
      .filter(item => item.info?.policyId?.length > 0)
      .map(item => `${item.info?.policyId}.${item.assetName}`); //

    actions.secondaryTokenIdsChanged(listForActivity);

    queryClient.invalidateQueries([queryKey]);
  }, [actions, queryClient]);
  // Use hook for each interval (24h, 1w, 1m)
  const { mutate: fetch24h, data: data24h, isLoading: loading24h } = useMultiTokenActivity('24h');
  const { mutate: fetch7d, data: data7d, isLoading: loading7d } = useMultiTokenActivity('7d');
  const { mutate: fetch30d, data: data30d, isLoading: loading30d } = useMultiTokenActivity('30d');
  React.useEffect(() => {
    if (state.secondaryTokenIds.length > 0) {
      fetch24h(state.secondaryTokenIds);
      fetch7d(state.secondaryTokenIds);
      fetch30d(state.secondaryTokenIds);
    }
  }, [state.secondaryTokenIds, fetch24h]);

  React.useEffect(() => {
    if (data24h) {
      const combinedData: any = {
        data24h: data24h,
        data7d: data7d,
        data30d: data30d,
      };
      actions.tokenActivityChanged(combinedData);
    }
  }, [data24h, actions, data30d, data7d, loading24h, loading30d, loading7d, walletBalance?.ada]);

  const value = React.useMemo(
    () => ({
      ...state,
      isLoading: loading24h,
      // || loading1w || loading1m, // Combine loading states from all intervals
    }),
    [loading24h, data7d, data30d, state]
  );

  return <PortfolioTokenActivityContext.Provider value={value}>{children}</PortfolioTokenActivityContext.Provider>;
};

export const usePortfolioTokenActivity = () =>
  React.useContext(PortfolioTokenActivityContext) ?? invalid('usePortfolioTokenActiviy requires PortfolioTokenActivitiyProvider');

type PortfolioTokenActivityState = Readonly<{
  secondaryTokenIds: Portfolio.Token.Id[];
  tokenActivity: {
    data24h: Portfolio.Api.TokenActivityResponse;
    data7d: Portfolio.Api.TokenActivityResponse;
    data30d: Portfolio.Api.TokenActivityResponse;
  };
  activityWindow: Portfolio.Token.ActivityWindow;
  isLoading: boolean;
}>;

enum PortfolioTokenActivityActionType {
  SecondaryTokenIdsChanged = 'SecondaryTokenIdsChanged',
  TokenActivityChanged = 'TokenActivityChanged',
  ActivityWindowChanged = 'ActivityWindowChanged',
}

export type PortfolioTokenActivityAction =
  | {
      type: PortfolioTokenActivityActionType.SecondaryTokenIdsChanged;
      secondaryTokenIds: Portfolio.Token.Id[];
    }
  | {
      type: PortfolioTokenActivityActionType.TokenActivityChanged;
      tokenActivity: {
        data24h: Portfolio.Api.TokenActivityResponse;
        data7d: Portfolio.Api.TokenActivityResponse;
        data30d: Portfolio.Api.TokenActivityResponse;
      };
    }
  | {
      type: PortfolioTokenActivityActionType.ActivityWindowChanged;
      activityWindow: Portfolio.Token.ActivityWindow;
    };

export const portfolioTokenActivityReducer = (
  state: PortfolioTokenActivityState,
  action: PortfolioTokenActivityAction
): PortfolioTokenActivityState => {
  return produce(state, draft => {
    switch (action.type) {
      case PortfolioTokenActivityActionType.SecondaryTokenIdsChanged:
        draft.secondaryTokenIds = action.secondaryTokenIds;
        break;
      case PortfolioTokenActivityActionType.TokenActivityChanged:
        draft.tokenActivity = action.tokenActivity;
        break;
      case PortfolioTokenActivityActionType.ActivityWindowChanged:
        draft.activityWindow = action.activityWindow;
        break;
    }
  });
};

export type PortfolioTokenActivityActions = Readonly<{
  secondaryTokenIdsChanged: (secondaryTokenIds: Portfolio.Token.Id[]) => void;
  tokenActivityChanged: (tokenActivity: {
    data24h: Portfolio.Api.TokenActivityResponse;
    data7d: Portfolio.Api.TokenActivityResponse;
    data30d: Portfolio.Api.TokenActivityResponse;
  }) => void;
  activityWindowChanged: (activityWindow: Portfolio.Token.ActivityWindow) => void;
}>;
