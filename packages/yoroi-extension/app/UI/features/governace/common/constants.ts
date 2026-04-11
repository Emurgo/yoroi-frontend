import {
  DREP_ALWAYS_ABSTAIN as API_ABSTAIN,
  DREP_ALWAYS_NO_CONFIDENCE as API_NO_CONFIDENCE,
} from '../../../../api/ada/lib/storage/bridge/delegationUtils';

export const LEARN_MORE_LINK =
  'https://help.yoroi-wallet.com/en/article/how-can-i-participate-in-governance-through-yoroi-155o8l3/ ';
export const FIND_DREPS_LINK = 'https://beta.cexplorer.io/drep?tab=list';
export const FIND_DREPS_LINK_TESTNET = 'https://preprod.cexplorer.io/drep';

export const CEXPLORER_DREP_URL = 'https://cexplorer.io/drep';
export const CEXPLORER_DREP_URL_TESTNET = 'https://preprod.cexplorer.io/drep';

export const getDrepExplorerUrl = (drepId: string, isTestnet: boolean): string => {
  const baseUrl = isTestnet ? CEXPLORER_DREP_URL_TESTNET : CEXPLORER_DREP_URL;
  return `${baseUrl}/${drepId}`;
};

export const DREP_ALWAYS_ABSTAIN = API_ABSTAIN;
export const DREP_ALWAYS_NO_CONFIDENCE = API_NO_CONFIDENCE;

export const GOVERNANCE_STATUS = {
  IDLE: 'idle',
  HOVER: 'hover',
  DELEGATED: 'delegated',
  DISABLED: 'disabled',
} as const;

export type GovernanceStatusState = (typeof GOVERNANCE_STATUS)[keyof typeof GOVERNANCE_STATUS];
