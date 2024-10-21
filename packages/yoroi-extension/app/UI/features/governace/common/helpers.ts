import BigNumber from 'bignumber.js';
import { calculateAndFormatValue } from '../../../../utils/unit-of-account';

export const mapStakingKeyStateToGovernanceAction = (state: any) => {
  if (!state.drepDelegation) return null;
  const vote = state.drepDelegation;
  return vote.action === 'abstain'
    ? { kind: 'abstain' }
    : vote.action === 'no-confidence'
    ? { kind: 'no-confidence' }
    : { kind: 'delegate', drepID: vote.drepID };
};

// <TODO:DEDUPLICATE> extract this and fix all places where it's duplicated
export const getFormattedPairingValue = (getCurrentPrice, defaultTokenInfo, unitOfAccount, lovelaces: string): string => {
  const { currency } = unitOfAccount;
  if (currency == null || defaultTokenInfo.ticker == null) return '-';
  const price = getCurrentPrice(defaultTokenInfo.ticker, currency);
  const shiftedAmount = new BigNumber(lovelaces).shiftedBy(-(defaultTokenInfo.decimals ?? 0));
  const val = price ? calculateAndFormatValue(shiftedAmount, price) : '-';
  return `${val} ${currency}`;
};
