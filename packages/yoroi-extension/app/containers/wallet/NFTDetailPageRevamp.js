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

    const nftsList =
      spendableBalance == null
        ? []
        : spendableBalance
            .nonDefaultEntries()
            .map(entry => ({
              entry,
              info: getTokenInfo(entry),
            }))
            .map(token => ({
              policyId: token.entry.identifier.split('.')[0],
              lastUpdatedAt: token.info.Metadata.lastUpdatedAt,
              ticker: token.info.Metadata.ticker ?? '-',
              assetName: token.entry.identifier.split('.')[1] ?? '',
              name: truncateToken(getTokenStrictName(token.info) ?? '-'),
              id: getTokenIdentifierIfExists(token.info) ?? '-',
              amount: genFormatTokenAmount(getTokenInfo)(token.entry),
              assetMintMetadata: token.info.Metadata.assetMintMetadata?.[0],
            }))
            .map(({ assetMintMetadata, ...item }) => ({
              ...item,
              data: Object.values(assetMintMetadata || {})?.[0]?.[item.policyId],
            }))
            .map(item => ({
              ...item,
              data: Object.entries(item.data || {}).map(([name, data]) => ({
                name,
                data,
              }))?.[0],
            }))
            .map(({ data, ...item }) => ({ ...item, name: data?.name, image: data?.data?.image }));


    const { nftId } = this.props.match.params;
    const nftInfo = nftsList.find(nft => nft.name === nftId);

    return (
      <Box height="100%" overflow="overlay">
        <NFTDetails nftInfo={nftInfo} tokensCount={nftsList.length} />
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
