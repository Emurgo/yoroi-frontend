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
import { splitAmount, truncateToken } from '../../utils/formatters';
import { computed } from 'mobx';
import type { TokenInfoMap } from '../../stores/toplevel/TokenInfoStore';
import type { TokenRow } from '../../api/ada/lib/storage/database/primitives/tables';
import { MultiToken } from '../../api/common/lib/MultiToken';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver';
import type { Match } from 'react-router-dom';
import { withRouter } from 'react-router-dom';
import { Box } from '@mui/system';
import TokenDetails from '../../components/wallet/assets/TokenDetails';
import { getDescriptionFromTokenMetadata } from '../../utils/nftMetadata';

export type GeneratedData = typeof TokenDetailsPageRevamp.prototype.generated;
type Props = {|
  ...InjectedOrGenerated<GeneratedData>,
|};
type MatchProps = {|
  match: Match,
|};

type AllProps = {| ...Props, ...MatchProps |};

@observer
class TokenDetailsPageRevamp extends Component<AllProps> {
  render(): Node {
    const publicDeriver = this.generated.stores.wallets.selected;
    // Guard against potential null values
    if (!publicDeriver)
      throw new Error(`Active wallet requiTokenDetails)}d for ${nameof(TokenDetailsPageRevamp)}.`);
    const spendableBalance = this.generated.stores.transactions.balance;
    const getTokenInfo = genLookupOrFail(this.generated.stores.tokenInfoStore.tokenInfo);
    const network = publicDeriver.getParent().getNetworkInfo();

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
              const name = truncateToken(getTokenStrictName(token.info) ?? '-');

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
      throw new Error(`${nameof(TokenDetailsPageRevamp)} no way to generated props`);
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
          balance: stores.transactions.balance
        },
      },
    });
  }
}
export default (withRouter(TokenDetailsPageRevamp): ComponentType<Props>);
