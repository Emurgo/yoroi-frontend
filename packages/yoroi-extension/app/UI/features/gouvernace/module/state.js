// @flow
import { invalid } from '@yoroi/common';
import { produce } from 'immer';

// Define types
export type GouvernanceActions = {|
  +gouvernanceStatusChanged: (status: any) => void,
|};

export const GouvernanceActionType = Object.freeze({
  GouvernanceStatusChanged: 'gouvernanceStatusChanged',
});

export type GouvernanceAction = {|
  type: typeof GouvernanceActionType.GouvernanceStatusChanged,
  gouvernanceStatus: 'none' | 'drep' | 'abstain' | 'noConfidence',
|};

// Define state type
export type GouvernanceState = {|
  gouvernanceStatus?: 'none' | 'drep' | 'abstain' | 'noConfidence',
|};

// Define default state
export const defaultGouvernanceState: GouvernanceState = {
  gouvernanceStatus: 'none',
};

// Define action handlers
export const defaultGouvernanceActions: GouvernanceActions = {
  gouvernanceStatusChanged: () => invalid('missing init'),
};

// Reducer function
export const GouvernanceReducer = (
  state: GouvernanceState,
  action: GouvernanceAction
): GouvernanceState => {
  return produce(state, draft => {
    switch (action.type) {
      case GouvernanceActionType.GouvernanceStatusChanged:
        draft.gouvernanceStatus = action.gouvernanceStatus;
        break;
      default:
        (action: empty); // Ensure all cases are handled
    }
  });
};
