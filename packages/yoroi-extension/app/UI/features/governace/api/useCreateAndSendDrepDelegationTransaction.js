// @flow

export const useCreateAndSendDrepDelegationTransaction = ({
  walletId,
  governanceVote,
}: {|
  walletId: string,
  governanceVote: {| kind: string, drepID: string | null |},
|}): void => {
  localStorage.setItem(`Governance - ${walletId}`, JSON.stringify(governanceVote));
};
