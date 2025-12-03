import {
  DREP_ALWAYS_ABSTAIN as API_ABSTAIN,
  DREP_ALWAYS_NO_CONFIDENCE as API_NO_CONFIDENCE,
} from '../../../../api/ada/lib/storage/bridge/delegationUtils';

export const LEARN_MORE_LINK =
  'https://help.yoroi-wallet.com/en/article/how-can-i-participate-in-governance-through-yoroi-155o8l3/ ';
export const YOROI_VOTING_RECORD_LINK =
  'https://2025budget.intersectmbo.org/voters/drep1ygr9tuapcanc3kpeyy4dc3vmrz9cfe5q7v9wj3x9j0ap3tswtre9j';
export const FIND_DREPS_LINK = 'https://beta.cexplorer.io/drep?tab=list';
export const FIND_DREPS_LINK_TESTNET = 'https://preprod.cexplorer.io/drep?tab=list';
export const YOROI_DREP_ID = 'drep1ygr9tuapcanc3kpeyy4dc3vmrz9cfe5q7v9wj3x9j0ap3tswtre9j';
export const EMURGO_DREP_ID = 'drep1ytvlwvyjmzfyn56n0zz4f6lj94wxhmsl5zky6knnzrf4jygpyahug';

export const DREP_ALWAYS_ABSTAIN = API_ABSTAIN;
export const DREP_ALWAYS_NO_CONFIDENCE = API_NO_CONFIDENCE;

export const drepNames = {
  [YOROI_DREP_ID]: 'Yoroi W₳llet',
  [EMURGO_DREP_ID]: 'EMURGO',
};

export const GOVERNANCE_STATUS = {
  IDLE: 'idle',
  HOVER: 'hover',
  DELEGATED: 'delegated',
  DISABLED: 'disabled',
} as const;

export type GovernanceStatusState = (typeof GOVERNANCE_STATUS)[keyof typeof GOVERNANCE_STATUS];
