// @flow
import type { Node } from 'react';
import { useEffect, useMemo, useState } from 'react';
import type { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver';
import {
  supportedProviders,
  swapApiMaker,
  swapManagerMaker,
  SwapProvider as Provider,
  swapStorageMaker,
} from '@yoroi/swap';
import { asGetStakingKey } from '../../api/ada/lib/storage/models/PublicDeriver/traits';
import { unwrapStakingKey } from '../../api/ada/lib/storage/bridge/utils';
import { asyncLocalStorageWrapper } from '../../api/localStorage';

type Props = {|
  children?: Node,
  publicDeriver: PublicDeriver<> | null,
|};

function SwapProvider({ children, publicDeriver }: Props): Node {
  if (!publicDeriver) throw new Error(`${nameof(SwapProvider)} requires a wallet to be selected`);

  const [stakingKey, setStakingKey] = useState(null);
  const defaultToken = publicDeriver.getParent().getDefaultToken();

  useEffect(() => {
    const withStakingKey = asGetStakingKey(publicDeriver);
    if (withStakingKey == null) {
      throw new Error(`${nameof(SwapProvider)} missing staking key functionality`);
    }

    withStakingKey
      .getStakingKey()
      .then(stakingKeyResp => {
        const skey = unwrapStakingKey(stakingKeyResp.addr.Hash).to_keyhash()?.to_hex();
        if (skey == null) {
          throw new Error('Cannot get staking key from the wallet!');
        }
        setStakingKey(skey);
        return null;
      })
      .catch(err => {
        console.error(`unexpected erorr: failed to get wallet staking key: ${err}`);
      });
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
        primaryTokenId: defaultToken.defaultIdentifier,
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
