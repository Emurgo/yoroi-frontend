// @flow
import { observer } from 'mobx-react';
import { Component } from 'react';
import type { InjectedOrGenerated } from '../../types/injectedPropsType';
import type { ComponentType, Node } from 'react';
import {
  genLookupOrFail,
  getTokenIdentifierIfExists,
  getTokenStrictName,
} from '../../stores/stateless/tokenHelpers';
import { truncateToken } from '../../utils/formatters';
import { computed } from 'mobx';
import type { TokenInfoMap } from '../../stores/toplevel/TokenInfoStore';
import type { TokenRow } from '../../api/ada/lib/storage/database/primitives/tables';
import { MultiToken } from '../../api/common/lib/MultiToken';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver';
import type { Match, Location } from 'react-router-dom';
import { withRouter } from 'react-router-dom';
import { Box } from '@mui/system';
import NFTDetails from '../../components/wallet/assets/NFTDetails';
import {
  getAuthorFromTokenMetadata,
  getDescriptionFromTokenMetadata,
  getImageFromTokenMetadata,
} from '../../utils/nftMetadata';

export type GeneratedData = typeof NFTDetailPageRevamp.prototype.generated;
type Props = {|
  ...InjectedOrGenerated<GeneratedData>,
|};
type MatchProps = {|
  match: Match,
  location: Location,
|};

type AllProps = {| ...Props, ...MatchProps |};

@observer
class NFTDetailPageRevamp extends Component<AllProps> {
  render(): Node {
    const publicDeriver = this.generated.stores.wallets.selected;
    // Guard against potential null values
    if (!publicDeriver)
      throw new Error(`Active wallet requiTokenDetails for ${nameof(NFTDetailPageRevamp)}.`);
    const spendableBalance = this.generated.stores.transactions.balance;
    const getTokenInfo = genLookupOrFail(this.generated.stores.tokenInfoStore.tokenInfo);
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
              const policyId = token.entry.identifier.split('.')[0];
              const fullName = getTokenStrictName(token.info);
              const name = truncateToken(fullName ?? '-');
              return {
                policyId,
                name,
                lastUpdatedAt: token.info.Metadata.lastUpdatedAt,
                ticker: token.info.Metadata.ticker ?? '-',
                assetName: token.entry.identifier.split('.')[1] ?? '',
                id: getTokenIdentifierIfExists(token.info) ?? '-',
                image: getImageFromTokenMetadata(policyId, fullName, token.info.Metadata),
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

  @computed get generated(): {|
    stores: {|
      tokenInfoStore: {|
        tokenInfo: TokenInfoMap,
        getDefaultTokenInfo: number => $ReadOnly<TokenRow>,
      |},
      transactions: {| balance: MultiToken | null |},
      wallets: {| selected: null | PublicDeriver<> |},
    |},
  |} {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null) {
      throw new Error(`${nameof(NFTDetailPageRevamp)} no way to generated props`);
    }
    const { stores } = this.props;
    return Object.freeze({
      stores: {
        wallets: {
          selected: stores.wallets.selected,
        },
        tokenInfoStore: {
          tokenInfo: stores.tokenInfoStore.tokenInfo,
          getDefaultTokenInfo: stores.tokenInfoStore.getDefaultTokenInfo,
        },
        transactions: {
          balance: stores.transactions.balance,
        },
      },
    });
  }
}
export default (withRouter(NFTDetailPageRevamp): ComponentType<Props>);
