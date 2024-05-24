// @flow
import { invalid } from '@yoroi/common';
import { produce } from 'immer';

type status = 'drep' | 'confidence';

// Define types
export type PortfolioActions = {|
  +portfolioStatusChanged: (status: status) => void,
|};

export const PortfolioActionType = Object.freeze({
  PortfolioStatusChanged: 'portfolioStatusChanged',
});

export type PortfolioAction = {|
  type: typeof PortfolioActionType.PortfolioStatusChanged,
  portfolioStatus: status,
|};

// Define state type
export type PortfolioState = {|
  portfolioStatus: status,
|};

// Define default state
export const defaultPortfolioState: PortfolioState = {
  portfolioStatus: 'none',
};

// Define action handlers
export const defaultPortfolioActions: PortfolioActions = {
  portfolioStatusChanged: () => invalid('missing init portfolioStatusChanged'),
};

// Reducer function
export const PortfolioReducer = (
  state: PortfolioState,
  action: PortfolioAction
): PortfolioState => {
  return produce(state, draft => {
    switch (action.type) {
      case PortfolioActionType.PortfolioStatusChanged:
        draft.portfolioStatus = action.portfolioStatus;
        break;
      default:
        return;
    }
  });
};
