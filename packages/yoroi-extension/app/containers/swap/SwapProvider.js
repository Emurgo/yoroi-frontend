// @flow
import type { Node } from 'react';
import { useMemo, useState, useEffect } from 'react';
import {
  supportedProviders,
  swapApiMaker,
  swapManagerMaker,
  SwapProvider as Provider,
  swapStorageMaker,
} from '@yoroi/swap';
import { unwrapStakingKey } from '../../api/ada/lib/storage/bridge/utils';
import type { WalletState } from '../../../chrome/extension/background/types';

type Props = {|
  children?: Node,
  publicDeriver: WalletState | null,
|};

function SwapProvider({ children, publicDeriver }: Props): Node {
  if (!publicDeriver) throw new Error(`${nameof(SwapProvider)} requires a wallet to be selected`);

  const [stakingKey, setStakingKey] = useState(null);

  useEffect(() => {
    const stakignAddr = publicDeriver.stakingAddress;
    const skey = Buffer.from(unwrapStakingKey(stakignAddr).to_bytes()).toString('hex');
    setStakingKey(skey);
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
        isMainnet: true,
        stakingKey,
        primaryTokenId: publicDeriver.defaultTokenId,
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
