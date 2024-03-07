// @flow
import SelectPoolDialog from '../../../../components/swap/SelectPoolDialog';
import { useSwap } from '@yoroi/swap';
import type { RemoteTokenInfo } from '../../../../api/ada/lib/state-fetch/types';
import { useEffect, useState } from 'react';

type Props = {|
  +onClose: void => void,
  defaultTokenInfo: RemoteTokenInfo,
  tokenInfoLookup: string => Promise<RemoteTokenInfo>,
|}

export default function SelectSwapPoolFromList({ onClose, defaultTokenInfo, tokenInfoLookup }: Props): React$Node {

  const { orderData: { pools, selectedPoolId, amounts: { sell, buy } }, selectedPoolChanged } = useSwap();

  const [sellTokenInfo, setSellTokenInfo] = useState<?RemoteTokenInfo>(null);
  const [buyTokenInfo, setBuyTokenInfo] = useState<?RemoteTokenInfo>(null);

  useEffect(() => {
    tokenInfoLookup(sell.tokenId)
      .then(setSellTokenInfo)
      .catch(e => {
        console.error(`Failed to fetch SELL token info`, e);
        setSellTokenInfo(({}: any));
      });
    tokenInfoLookup(buy.tokenId)
      .then(setBuyTokenInfo)
      .catch(e => {
        console.error(`Failed to fetch BUY token info`, e);
        setBuyTokenInfo(({}: any));
      });
  }, []);

  return <SelectPoolDialog
    onPoolSelected={poolId => selectedPoolChanged(poolId)}
    sellTokenId={sell.tokenId}
    sellTokenInfo={sellTokenInfo}
    buyTokenInfo={buyTokenInfo}
    defaultTokenInfo={defaultTokenInfo}
    poolList={pools}
    currentPool={selectedPoolId}
    onClose={onClose}
  />;
}
