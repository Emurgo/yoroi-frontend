// @flow
import { useQuery } from 'react-query';

type PoolTransition = {|
  kind: null | 'none' | 'delegate' | 'abstain' | 'no-confidence',
  drepID: 'drep1c93a2zvs3aw8e4naez0ynpmc48jbc7yaa3n2k8ljhwfdt70yscts' | null,
|};

// TODO mock impementation - add real endpoint
const getDrepDelegationState = async (walletId: string): Promise<PoolTransition> => {
  const storage = localStorage.getItem(`Governance - ${walletId}`);

  if (storage === null || storage === undefined) {
    return new Promise(resolve => {
      resolve({
        kind: 'none',
        drepID: null,
      });
    });
  } else {
    const parsedStorage = JSON.parse(storage);
    return new Promise(resolve => {
      resolve({
        kind: parsedStorage.kind,
        drepID: parsedStorage?.drepID ?? null,
      });
    });
  }
};

export const useDrepDelegationState = (walletId: string): any => {
  const DrepDelegationQuery = useQuery({
    queryKey: [walletId, 'DrepDelegationState'],
    queryFn: () => getDrepDelegationState(walletId),
  });

  return DrepDelegationQuery;
};
