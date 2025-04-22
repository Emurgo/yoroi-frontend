// @flow
import { Box } from '@mui/system';
import { observer } from 'mobx-react';
import type { ComponentType, Node } from 'react';
import { Component } from 'react';
import NFTDetails from '../../components/wallet/assets/NFTDetails';
import { genLookupOrFail, getTokenIdentifierIfExists, getTokenStrictName } from '../../stores/stateless/tokenHelpers';
import { truncateToken } from '../../utils/formatters';
import { getAuthorFromTokenMetadata, getDescriptionFromTokenMetadata, getImageFromTokenMetadata } from '../../utils/nftMetadata';
import { getNetworkById } from '../../api/ada/lib/storage/database/prepackaged/networks';
import type { StoresProps } from '../../stores';
import { useParams, useSearchParams } from 'react-router';

function NFTDetailPageRevamp(props: StoresProps) {
  const publicDeriver = props.stores.wallets.selected;
  // Guard against potential null values
  if (!publicDeriver) throw new Error(`Active wallet requiTokenDetails for ${nameof(NFTDetailPageRevamp)}.`);
  const spendableBalance = props.stores.transactions.balance;
  const getTokenInfo = genLookupOrFail(props.stores.tokenInfoStore.tokenInfo);
  const network = getNetworkById(publicDeriver.networkId);

  const nftsList =
    spendableBalance == null
      ? []
      : spendableBalance
          .nonDefaultEntries()
          .map(entry => ({
            entry,
            info: getTokenInfo(entry),
          }))
          .filter(item => item.info.IsNFT)
          .map(token => {
            const split = token.entry.identifier.split('.');
            const policyId = split[0];
            const assetNameHex = split[1] ?? '';
            const strictName = getTokenStrictName(token.info);
            const cip67PRefix = strictName.cip67Tag != null ? `(${strictName.cip67Tag}) ` : '';
            const fullName = cip67PRefix + (strictName.name ?? '');
            const name = truncateToken(fullName ?? '-');
            return {
              policyId,
              name,
              lastUpdatedAt: token.info.Metadata.lastUpdatedAt,
              ticker: token.info.Metadata.ticker ?? '-',
              assetName: assetNameHex,
              id: getTokenIdentifierIfExists(token.info) ?? '-',
              image: getImageFromTokenMetadata(policyId, assetNameHex, token.info.Metadata),
              description: getDescriptionFromTokenMetadata(policyId, fullName, token.info.Metadata),
              author: getAuthorFromTokenMetadata(policyId, fullName, token.info.Metadata),
              // $FlowFixMe[prop-missing]
              metadata: token.info.Metadata?.assetMintMetadata?.[0] || null,
            };
          });

  const { nftId } = useParams();
  const currentNftIdx = nftsList.findIndex(nft => nft.id === nftId);
  const nftsCount = nftsList.length;
  const nftInfo = nftsList[currentNftIdx];

  const nextNftId = currentNftIdx === nftsCount - 1 ? nftsList[0]?.id : nftsList[currentNftIdx + 1]?.id;

  const prevNftId = currentNftIdx === 0 ? nftsList[nftsCount - 1]?.id : nftsList[currentNftIdx - 1]?.id;

  const [urlPrams] = useSearchParams();
  const tab = urlPrams.get('tab');

  return (
    <Box sx={{ width: '100%', backgroundColor: 'ds.bg_color_max' }}>
      <NFTDetails nftInfo={nftInfo} network={network} nextNftId={nextNftId} prevNftId={prevNftId} tab={tab} />
    </Box>
  );
}

export default (observer(NFTDetailPageRevamp): ComponentType<StoresProps>);
