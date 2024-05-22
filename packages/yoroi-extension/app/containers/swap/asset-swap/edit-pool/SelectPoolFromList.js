// @flow
import SelectPoolDialog from '../../../../components/swap/SelectPoolDialog';
import { useSwap } from '@yoroi/swap';
import type { RemoteTokenInfo } from '../../../../api/ada/lib/state-fetch/types';

type Props = {|
  +onClose: void => void,
  defaultTokenInfo: RemoteTokenInfo,
|}

export default function SelectSwapPoolFromList({ onClose, defaultTokenInfo }: Props): React$Node {

  const { orderData: { tokens, pools, selectedPoolId, amounts }, selectedPoolChanged } = useSwap();

  return <SelectPoolDialog
    onPoolSelected={poolId => selectedPoolChanged(poolId)}
    sellTokenId={amounts.sell.tokenId}
    denomination={tokens.priceDenomination}
    defaultTokenInfo={defaultTokenInfo}
    poolList={pools}
    currentPool={selectedPoolId}
    onClose={onClose}
  />;
}
