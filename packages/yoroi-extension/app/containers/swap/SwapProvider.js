// @flow
import { useMemo, type Node, useState, useEffect } from 'react';
import {
  supportedProviders,
  swapApiMaker,
  swapManagerMaker,
  SwapProvider as Provider,
  swapStorageMaker,
} from '@yoroi/swap';
import { asGetStakingKey } from '../../api/ada/lib/storage/models/PublicDeriver/traits';
import { unwrapStakingKey } from '../../api/ada/lib/storage/bridge/utils';

type Props = {|
  children?: Node,
|};

function SwapProvider({ children, publicDeriver }: Props): Node {
  const [stakingKey, setStakingKey] = useState(null);
  const defaultToken = publicDeriver.getParent().getDefaultToken();

  const withStakingKey = asGetStakingKey(publicDeriver);
  if (withStakingKey == null) {
    throw new Error(`${nameof(SwapProvider)} missing staking key functionality`);
  }

  useEffect(() => {
    withStakingKey
      .getStakingKey()
      .then(stakingKeyResp => {
        const stakignAddr = stakingKeyResp.addr.Hash;
        const skey = Buffer.from(unwrapStakingKey(stakignAddr).to_bytes()).toString('hex');
        setStakingKey(skey);
        return null;
      })
      .catch(err => {
        console.error(`unexpected erorr: failed to get wallet staking key: ${err}`);
      });
  }, []);

  const swapStorage = useMemo(
    () =>
      swapStorageMaker({
        // todo: storage api should be moved into its own file.
        storage: {
          getItem: (key: string) => Promise.resolve(localStorage.getItem(key)),
          setItem: (key: string, value: string) =>
            Promise.resolve(localStorage.setItem(key, value)),
          removeItem: (key: string) => Promise.resolve(localStorage.removeItem(key)),
        },
      }),
    []
  );

  const swapApi = useMemo(
    () =>
      swapApiMaker({
        isMainnet: false,
        stakingKey,
        primaryTokenId: defaultToken.defaultIdentifier,
        supportedProviders,
      }),
    []
  );

  const swapManager = useMemo(() => swapManagerMaker({ swapApi, swapStorage }), [
    swapStorage,
    swapApi,
  ]);

  return <Provider swapManager={swapManager}>{children}</Provider>;
}

SwapProvider.defaultProps = {
  children: undefined,
};

export default SwapProvider;
