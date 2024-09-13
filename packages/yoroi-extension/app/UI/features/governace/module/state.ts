import { invalid } from '@yoroi/common';
import { produce } from 'immer';

export type Vote = { kind: string; drepID?: string };

// Define types
export type GovernanceActions = {
  governanceVoteChanged: (vote: any) => void;
  dRepIdChanged: (id: string) => void;
};

export const GovernanceActionType = Object.freeze({
  GovernanceVoteChanged: 'governanceVoteChanged',
  DRepIdChanged: 'dRepIdChanged',
});

export type GovernanceAction =
  | {
      type: typeof GovernanceActionType.GovernanceVoteChanged;
      governanceVote: Vote;
    }
  | {
      type: typeof GovernanceActionType.DRepIdChanged;
      dRepId: '';
    };

// Define state type
export type GovernanceState = {
  governanceVote: any;
  dRepId?: string;
};

// Define default state
export const defaultGovernanceState: GovernanceState = {
  governanceVote: { kind: 'abstain', drepID: '' },
  dRepId: '',
};

// Define action handlers
export const defaultGovernanceActions: GovernanceActions = {
  governanceVoteChanged: () => invalid('missing init governanceVoteChanged'),
  dRepIdChanged: () => invalid('missing init dRepIdChanged'),
};

// Reducer function
export const GovernanceReducer = (state: GovernanceState, action: GovernanceAction): GovernanceState => {
  return produce(state, draft => {
    switch (action.type) {
      case GovernanceActionType.GovernanceVoteChanged:
        draft.governanceVote = action.governanceVote;
        break;
      case GovernanceActionType.DRepIdChanged:
        draft.dRepId = action.dRepId;
        break;
      default:
        return;
    }
  });
};
