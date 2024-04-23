//@flow
import { useMemo } from 'react';
import adaLogo from './mockAssets/ada.inline.svg';
import {
  genLookupOrFail,
  getTokenIdentifierIfExists,
  getTokenName,
  getTokenStrictName,
} from '../../stores/stateless/tokenHelpers';
import { splitAmount, truncateToken } from '../../utils/formatters';
import useSwapPage from './context/swap-page/useSwapPage';

export function useTokenInfo({ tokenId }: {| tokenId: string |}): any {
  const { spendableBalance, tokenInfo } = useSwapPage();
  const getTokenInfo = genLookupOrFail(tokenInfo);

  const assetEntry = [spendableBalance.getDefaultEntry()]
    .concat(...spendableBalance.nonDefaultEntries())
    .filter(entry => entry.indentifier === tokenId)[0];

  return getTokenInfo(assetEntry);
}

export function useAssets(): Array<any> {
  const { spendableBalance, tokenInfo } = useSwapPage();
  const getTokenInfo = genLookupOrFail(tokenInfo);

  const assetsList = useMemo(() => {
    if (spendableBalance == null) return [];
    return [spendableBalance.getDefaultEntry()]
      .concat(...spendableBalance.nonDefaultEntries())
      .map(entry => ({
        entry,
        info: getTokenInfo(entry),
      }))
      .filter(t => !Boolean(t.info.IsNFT))
      .map(token => {
        const numberOfDecimals = token.info?.Metadata.numberOfDecimals ?? 0;
        const id = token.info.Identifier;
        // console.log('🚀 > token.info:', JSON.parse(JSON.stringify(token.info)));
        const shiftedAmount = token.entry.amount.shiftedBy(-numberOfDecimals);
        const [beforeDecimal, afterDecimal] = splitAmount(shiftedAmount, numberOfDecimals);
        return {
          id,
          group: token.info?.Metadata.policyId,
          fingerprint: getTokenIdentifierIfExists(token.info) ?? '',
          name: truncateToken(getTokenStrictName(token.info)?.name ?? '-'),
          decimals: token.info?.Metadata.numberOfDecimals,
          ticker: token.info?.Metadata.ticker ?? truncateToken(getTokenName(token.info) ?? '-'),
          kind: token.info?.IsNFT ? 'nft' : 'ft',
          amount: [beforeDecimal, afterDecimal].join(''),
          amountForSorting: shiftedAmount,
          description: '',
          metadatas: token.info?.Metadata,
          image: id ? '' : adaLogo,
        };
      });
  }, [spendableBalance, getTokenInfo]);

  return assetsList;
}

//   {
//     "id": "984394dcc0b08ea12d72b8833292e3c3197d7a8ac89aad61d2f5aa9e.45415254485f746f6b656e",
//     "group": "984394dcc0b08ea12d72b8833292e3c3197d7a8ac89aad61d2f5aa9e",
//     "fingerprint": "asset1lr7d44kvy8q8dqnat5macsj6matcvk046hdyeh",
//     "name": "EARTH_token",
//     "decimals": 6,
//     "description": "$EARTH token for use within the Unbounded.Earth metaverse",
//     "image": "https://tokens.muesliswap.com/static/img/tokens/984394dcc0b08ea12d72b8833292e3c3197d7a8ac89aad61d2f5aa9e.45415254485f746f6b656e.png",
//     "kind": "ft",
//     "ticker": "EARTH",
//     "metadatas": {}
// }
