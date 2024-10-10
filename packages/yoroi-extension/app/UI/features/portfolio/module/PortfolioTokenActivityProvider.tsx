import { invalid } from '@yoroi/common';
import { Portfolio } from '@yoroi/types';
import { freeze, produce } from 'immer';
import React, { useEffect, useReducer, useRef } from 'react';
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
  const { backendServiceZero } = usePortfolio();
  const [state, dispatch] = useReducer(portfolioTokenActivityReducer, defaultPortfolioTokenActivityState);

  const actions = useRef<PortfolioTokenActivityActions>({
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

  const { ftAssetList } = usePortfolio();

  useEffect(() => {
    const listForActivity: any[] = ftAssetList
      .filter(item => item.info?.policyId?.length > 0)
      .map(item => `${item.info?.policyId}.${item.assetName}`);

    actions.secondaryTokenIdsChanged(listForActivity);
    queryClient.invalidateQueries(queryKey);
  }, [actions, ftAssetList, queryClient]);

  // Use `useQuery` hooks to fetch and cache the token activity data for each interval
  const { data: data24h, isLoading: loading24h, error: data24hError } = useMultiTokenActivity(
    state.secondaryTokenIds,
    '24h',
    backendServiceZero
  );
  const { data: data7d, isLoading: loading7d, error: data7dError } = useMultiTokenActivity(
    state.secondaryTokenIds,
    '7d',
    backendServiceZero
  );
  const { data: data30d, isLoading: loading30d, error: data30dError } = useMultiTokenActivity(
    state.secondaryTokenIds,
    '30d',
    backendServiceZero
  );

  useEffect(() => {
    if (data24h || data7d || data30d) {
      const combinedData: any = {
        data24h: data24hError ? [] : data24h || {},
        data7d: data7dError ? [] : data7d || {},
        data30d: data30dError ? [] : data30d || {},
      };
      actions.tokenActivityChanged(combinedData);
    }
  }, [data24h, data7d, data30d, actions]);

  const value = React.useMemo(
    () => ({
      ...state,
      isLoading: loading24h,
    }),
    [loading24h, loading7d, loading30d, state]
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
