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
    tokenActivity: {},
    activityWindow: '24h',
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
    tokenActivityChanged: tokenActivity => {
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

  const { assetList } = usePortfolio();

  React.useEffect(() => {
    // filter and add here the ids for query

    const listForActivity = assetList.filter(item => item.policyId.length > 0).map(item => `${item.policyId}.${item.assetName}`); //

    actions.secondaryTokenIdsChanged(listForActivity);

    queryClient.invalidateQueries([queryKey]);
  }, [actions, queryClient]);

  // Use hook for each interval (24h, 1w, 1m)
  const { mutate: fetch24h, data: data24h, isLoading: loading24h } = useMultiTokenActivity('24h');
  // const { mutate: fetch1w, data: data1w, isLoading: loading1w } = useMultiTokenActivity('1w');
  // const { mutate: fetch1m, data: data1m, isLoading: loading1m } = useMultiTokenActivity('1m');

  React.useEffect(() => {
    if (state.secondaryTokenIds.length > 0) {
      fetch24h(state.secondaryTokenIds);
      // fetch1w(state.secondaryTokenIds);
      // fetch1m(state.secondaryTokenIds);
    }
  }, [state.secondaryTokenIds, fetch24h]);

  React.useEffect(() => {
    if (data24h) {
      console.log('data24h', data24h);
      const combinedData = {
        data24h: data24h,
        // '1w': data1w,
        // '1m': data1m,
      };
      actions.tokenActivityChanged(combinedData);
    }
  }, [data24h, actions]);

  const value = React.useMemo(
    () => ({
      ...state,
      isLoading: loading24h,
      // || loading1w || loading1m, // Combine loading states from all intervals
    }),
    [loading24h, state]
  );

  return <PortfolioTokenActivityContext.Provider value={value}>{children}</PortfolioTokenActivityContext.Provider>;
};

export const usePortfolioTokenActivity = () =>
  React.useContext(PortfolioTokenActivityContext) ?? invalid('usePortfolioTokenActiviy requires PortfolioTokenActivitiyProvider');

type PortfolioTokenActivityState = Readonly<{
  secondaryTokenIds: Portfolio.Token.Id[];
  tokenActivity: Portfolio.Api.TokenActivityResponse;
  activityWindow: Portfolio.Token.ActivityWindow;
  isLoading: boolean;
}>;

export enum PortfolioTokenActivityActionType {
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
      tokenActivity: Portfolio.Api.TokenActivityResponse;
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
  tokenActivityChanged: (tokenActivity: Portfolio.Api.TokenActivityResponse) => void;
  activityWindowChanged: (activityWindow: Portfolio.Token.ActivityWindow) => void;
}>;
