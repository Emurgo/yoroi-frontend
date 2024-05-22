// @flow
import { invalid } from '@yoroi/common';
import { produce } from 'immer';

type status = 'none' | 'drep' | 'abstain' | 'noConfidence';

// Define types
export type GouvernanceActions = {|
  +gouvernanceStatusChanged: (status: status) => void,
  +dRepIdChanged: (id: string) => void,
|};

export const GouvernanceActionType = Object.freeze({
  GouvernanceStatusChanged: 'gouvernanceStatusChanged',
  DRepIdChanged: 'dRepIdChanged',
});

export type GouvernanceAction =
  | {|
      type: typeof GouvernanceActionType.GouvernanceStatusChanged,
      gouvernanceStatus: status,
    |}
  | {|
      type: typeof GouvernanceActionType.DRepIdChanged,
      dRepId: '',
    |};

// Define state type
export type GouvernanceState = {|
  gouvernanceStatus: status,
  dRepId: string,
|};

// Define default state
export const defaultGouvernanceState: GouvernanceState = {
  gouvernanceStatus: 'none',
  dRepId: '',
};

// Define action handlers
export const defaultGouvernanceActions: GouvernanceActions = {
  gouvernanceStatusChanged: () => invalid('missing init gouvernanceStatusChanged'),
  dRepIdChanged: () => invalid('missing init dRepIdChanged'),
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
      case GouvernanceActionType.DRepIdChanged:
        draft.dRepId = action.dRepId;
        break;
      default:
        return;
    }
  });
};
