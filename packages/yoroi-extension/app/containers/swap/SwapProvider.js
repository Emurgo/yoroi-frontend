// @flow
import type { Node } from 'react';
import { useEffect, useMemo, useState } from 'react';
import {
  supportedProviders,
  swapApiMaker,
  swapManagerMaker,
  SwapProvider as Provider,
  swapStorageMaker,
} from '@yoroi/swap';
import { unwrapStakingKey } from '../../api/ada/lib/storage/bridge/utils';
import type { WalletState } from '../../../chrome/extension/background/types';
import { asyncLocalStorageWrapper } from '../../api/localStorage';

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
    () => swapStorageMaker({ storage: asyncLocalStorageWrapper() }),
    []
  );

  const swapApi = useMemo(
    () =>
      swapApiMaker({
        // Preprod does not work atm so always mainnet
        isMainnet: true,
        stakingKey,
        primaryTokenId: publicDeriver.defaultTokenId,
        supportedProviders,
      }),
    [stakingKey]
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
