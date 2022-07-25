// @flow
import { observer } from 'mobx-react';
import { Component } from 'react';
import type { InjectedOrGenerated } from '../../types/injectedPropsType';
import type { ComponentType, Node } from 'react';
import {
  genFormatTokenAmount,
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
import type { TxRequests } from '../../stores/toplevel/TransactionsStore';
import type { Match } from 'react-router-dom';
import { withRouter } from 'react-router-dom';
import { Box } from '@mui/system';
import NFTDetails, { tabs } from '../../components/wallet/assets/NFTDetails';

export type GeneratedData = typeof NFTDetailPageRevamp.prototype.generated;
type Props = {|
  ...InjectedOrGenerated<GeneratedData>,
|};
type MatchProps = {|
  match: Match,
|};

type AllProps = {| ...Props, ...MatchProps |};

@observer
class NFTDetailPageRevamp extends Component<AllProps> {
  render(): Node {
    const publicDeriver = this.generated.stores.wallets.selected;
    // Guard against potential null values
    if (!publicDeriver)
      throw new Error(`Active wallet requiTokenDetails for ${nameof(NFTDetailPageRevamp)}.`);
    const spendableBalance = this.generated.stores.transactions.getBalanceRequest.result;
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
              const name = truncateToken(getTokenStrictName(token.info) ?? '-');
              return {
                policyId,
                name,
                lastUpdatedAt: token.info.Metadata.lastUpdatedAt,
                ticker: token.info.Metadata.ticker ?? '-',
                assetName: token.entry.identifier.split('.')[1] ?? '',
                id: getTokenIdentifierIfExists(token.info) ?? '-',
                amount: genFormatTokenAmount(getTokenInfo)(token.entry),
                nftMetadata: token.info.Metadata.assetMintMetadata
                  && token.info.Metadata.assetMintMetadata.length > 0
                  && token.info.Metadata.assetMintMetadata[0]['721']
                  && token.info.Metadata.assetMintMetadata[0]['721'][policyId]
                  && token.info.Metadata.assetMintMetadata[0]['721'][policyId][name]
                  ? token.info.Metadata.assetMintMetadata[0]['721'][policyId][name]
                  : undefined,
                assetMintMetadata: token.info.Metadata.assetMintMetadata[0]
              };
            })
            .map(item => {
              const { nftMetadata } = item
              const author = nftMetadata?.author || nftMetadata?.authors;

              return {
                policyId: item.policyId,
                lastUpdatedAt: item.lastUpdatedAt,
                ticker: item.ticker,
                assetName: item.assetName,
                id: item.id,
                amount: item.amount,
                name: item.name,
                image: item.nftMetadata?.image ?? '',
                description: item.nftMetadata?.description ?? '',
                nftMetadata: item.assetMintMetadata,
                author,
              }
            });

    const { nftId } = this.props.match.params;
    const currentNftIdx = nftsList.findIndex(nft => nft.id === nftId);
    const nftsCount = nftsList.length;
    const nftInfo = nftsList[currentNftIdx];

    const nextNftId = currentNftIdx === nftsCount - 1 ?
    nftsList[0]?.id : nftsList[currentNftIdx + 1]?.id

    const prevNftId = currentNftIdx === 0 ?
    nftsList[nftsCount - 1]?.id : nftsList[currentNftIdx - 1]?.id

    const urlPrams = new URLSearchParams(this.props.location.search);
    const tab = urlPrams.get('tab') === null ? tabs[0].id : urlPrams.get('tab');
    return (
      <Box width="100%" height="100%">
        <NFTDetails
          nftInfo={nftInfo}
          selectedExplorer={this.generated.stores.explorers.selectedExplorer.get(network.NetworkId)}
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
      transactions: {|
        getBalanceRequest: {|
          result: ?MultiToken,
        |},
        getTxRequests: (PublicDeriver<>) => TxRequests,
      |},
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
        explorers: {
          selectedExplorer: stores.explorers.selectedExplorer,
        },
        wallets: {
          selected: stores.wallets.selected,
        },
        tokenInfoStore: {
          tokenInfo: stores.tokenInfoStore.tokenInfo,
          getDefaultTokenInfo: stores.tokenInfoStore.getDefaultTokenInfo,
        },
        transactions: {
          getBalanceRequest: (() => {
            if (stores.wallets.selected == null)
              return {
                result: undefined,
              };
            const { requests } = stores.transactions.getTxRequests(stores.wallets.selected);

            return {
              result: requests.getBalanceRequest.result,
            };
          })(),
          getTxRequests: stores.transactions.getTxRequests,
        },
      },
    });
  }
}
export default (withRouter(NFTDetailPageRevamp): ComponentType<Props>);
