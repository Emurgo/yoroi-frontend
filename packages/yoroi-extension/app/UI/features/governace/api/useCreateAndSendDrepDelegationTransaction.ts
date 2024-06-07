import { Vote } from '../module/state';

export const useCreateAndSendDrepDelegationTransaction = ({
  walletId,
  governanceVote,
}: {
  walletId: string;
  governanceVote: Vote;
}): void => {
  localStorage.setItem(`Governance - ${walletId}`, JSON.stringify(governanceVote));
};
