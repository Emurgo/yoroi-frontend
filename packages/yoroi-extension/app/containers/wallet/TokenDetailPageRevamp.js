// @flow
import { observer } from 'mobx-react';
import { Component } from 'react';
import type {  StoresAndActionsProps } from '../../types/injectedProps.types';
import type { ComponentType, Node } from 'react';
import {
  genLookupOrFail,
  getTokenIdentifierIfExists,
  getTokenStrictName,
} from '../../stores/stateless/tokenHelpers';
import { splitAmount, truncateToken } from '../../utils/formatters';
import type { Match } from 'react-router-dom';
import { withRouter } from 'react-router-dom';
import { Box } from '@mui/system';
import TokenDetails from '../../components/wallet/assets/TokenDetails';
import { getDescriptionFromTokenMetadata } from '../../utils/nftMetadata';
import { getNetworkById } from '../../api/ada/lib/storage/database/prepackaged/networks';

type Props = {|
  ...StoresAndActionsProps,
|};
type MatchProps = {|
  match: Match,
|};

type AllProps = {| ...Props, ...MatchProps |};

@observer
class TokenDetailsPageRevamp extends Component<AllProps> {
  render(): Node {
    const publicDeriver = this.props.stores.wallets.selected;
    // Guard against potential null values
    if (!publicDeriver)
      throw new Error(`Active wallet requiTokenDetails)}d for ${nameof(TokenDetailsPageRevamp)}.`);
    const spendableBalance = this.props.stores.transactions.balance;
    const getTokenInfo = genLookupOrFail(this.props.stores.tokenInfoStore.tokenInfo);
    const network = getNetworkById(publicDeriver.networkId);

    const assetsList =
      spendableBalance == null
        ? []
        : spendableBalance
            .nonDefaultEntries()
            .map(entry => ({
              entry,
              info: getTokenInfo(entry),
            }))
            .filter(item => item.info.IsNFT === false)
            .map(token => {
              const policyId = token.entry.identifier.split('.')[0];
              const name = truncateToken(getTokenStrictName(token.info).name ?? '-');

              const numberOfDecimals = token.info?.Metadata.numberOfDecimals ?? 0;
              const shiftedAmount = token.entry.amount.shiftedBy(-numberOfDecimals);
              const [beforeDecimal, afterDecimal] = splitAmount(shiftedAmount, numberOfDecimals);
              return {
                policyId,
                lastUpdatedAt: token.info.Metadata.lastUpdatedAt,
                ticker: token.info.Metadata.ticker ?? '-',
                assetName: token.entry.identifier.split('.')[1] ?? '',
                name,
                id: getTokenIdentifierIfExists(token.info) ?? '-',
                amount: [beforeDecimal, afterDecimal].join(''),
                description: getDescriptionFromTokenMetadata(policyId, name, token.info.Metadata),
              };
            });

    const { tokenId } = this.props.match.params;
    const tokenInfo = assetsList.find(token => token.id === tokenId);
    return (
      <Box
        borderRadius="8px"
        bgcolor="var(--yoroi-palette-common-white)"
        height="content"
        overflow="auto"
      >
        <TokenDetails tokenInfo={tokenInfo} network={network} />
      </Box>
    );
  }
}
export default (withRouter(TokenDetailsPageRevamp): ComponentType<Props>);
