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
import NFTDetails from '../../components/wallet/assets/NFTDetails';
import {
  getDescriptionFromTokenMetadata,
  getImageFromTokenMetadata,
} from '../../utils/nftMetadata';

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
      throw new Error(`Active wallet requiTokenDetails)}d for ${nameof(NFTDetailPageRevamp)}.`);
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
                image: getImageFromTokenMetadata(policyId, name, token.info.Metadata),
                description: getDescriptionFromTokenMetadata(
                  policyId,
                  name,
                  token.info.Metadata
                ),
              };
            });

    const { nftId } = this.props.match.params;
    const nftInfo = nftsList.find(nft => nft.name === nftId);

    return (
      <Box height="100%" overflow="overlay">
        <NFTDetails nftInfo={nftInfo} nftsCount={nftsList.length} network={network} />
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
