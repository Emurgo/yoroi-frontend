// @flow
import { observer } from 'mobx-react';
import { Component } from 'react';
import type { StoresAndActionsProps } from '../../types/injectedPropsType';
import type { ComponentType, Node } from 'react';
import {
  genLookupOrFail,
  getTokenIdentifierIfExists,
  getTokenStrictName,
} from '../../stores/stateless/tokenHelpers';
import { truncateToken } from '../../utils/formatters';
import type { Match, Location } from 'react-router-dom';
import { withRouter } from 'react-router-dom';
import { Box } from '@mui/system';
import NFTDetails from '../../components/wallet/assets/NFTDetails';
import {
  getAuthorFromTokenMetadata,
  getDescriptionFromTokenMetadata,
  getImageFromTokenMetadata,
} from '../../utils/nftMetadata';

type Props = {|
  ...StoresAndActionsProps,
|};
type MatchProps = {|
  match: Match,
  location: Location,
|};

type AllProps = {| ...Props, ...MatchProps |};

@observer
class NFTDetailPageRevamp extends Component<AllProps> {
  render(): Node {
    const publicDeriver = this.props.stores.wallets.selected;
    // Guard against potential null values
    if (!publicDeriver)
      throw new Error(`Active wallet requiTokenDetails for ${nameof(NFTDetailPageRevamp)}.`);
    const spendableBalance = this.props.stores.transactions.balance;
    const getTokenInfo = genLookupOrFail(this.props.stores.tokenInfoStore.tokenInfo);
    const network = publicDeriver.getParent().getNetworkInfo();

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
                description: getDescriptionFromTokenMetadata(
                  policyId,
                  fullName,
                  token.info.Metadata
                ),
                author: getAuthorFromTokenMetadata(policyId, fullName, token.info.Metadata),
                // $FlowFixMe[prop-missing]
                metadata: token.info.Metadata?.assetMintMetadata?.[0] || null,
              };
            });

    const { nftId } = this.props.match.params;
    const currentNftIdx = nftsList.findIndex(nft => nft.id === nftId);
    const nftsCount = nftsList.length;
    const nftInfo = nftsList[currentNftIdx];

    const nextNftId =
      currentNftIdx === nftsCount - 1 ? nftsList[0]?.id : nftsList[currentNftIdx + 1]?.id;

    const prevNftId =
      currentNftIdx === 0 ? nftsList[nftsCount - 1]?.id : nftsList[currentNftIdx - 1]?.id;

    const urlPrams = new URLSearchParams(this.props.location.search);
    const tab = urlPrams.get('tab');

    return (
      <Box sx={{ width: '100%', pb: '50vh' }}>
        <NFTDetails
          nftInfo={nftInfo}
          network={network}
          nextNftId={nextNftId}
          prevNftId={prevNftId}
          tab={tab}
        />
      </Box>
    );
  }
}
export default (withRouter(NFTDetailPageRevamp): ComponentType<Props>);
