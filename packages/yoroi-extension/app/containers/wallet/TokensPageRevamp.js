// @flow
import { observer } from 'mobx-react';
import { Component } from 'react';
import type { Node } from 'react';
import {
  genLookupOrFail,
  getTokenIdentifierIfExists,
  getTokenStrictName,
} from '../../stores/stateless/tokenHelpers';
import { splitAmount, truncateToken } from '../../utils/formatters';
import TokensPage from '../../components/wallet/assets/Tokens';
import type { StoresProps } from '../../stores';

@observer
export default class TokensPageRevamp extends Component<StoresProps> {
  render(): Node {
    const publicDeriver = this.props.stores.wallets.selected;
    // Guard against potential null values
    if (!publicDeriver) throw new Error(`Active wallet required for ${nameof(TokensPageRevamp)}.`);
    const spendableBalance = this.props.stores.transactions.balance;
    const getTokenInfo = genLookupOrFail(this.props.stores.tokenInfoStore.tokenInfo);

    const assetsList = (() => {
      if (spendableBalance == null) return [];
      return [
        spendableBalance.getDefaultEntry() ,
        ...spendableBalance.nonDefaultEntries()
      ]
        .map(entry => ({
          entry,
          info: getTokenInfo(entry),
        }))
        .filter(item => item.info.IsNFT === false)
        .map(token => {
          const numberOfDecimals = token.info?.Metadata.numberOfDecimals ?? 0;
          const shiftedAmount = token.entry.amount.shiftedBy(-numberOfDecimals);
          const [beforeDecimal, afterDecimal] = splitAmount(
            shiftedAmount,
            numberOfDecimals
          );

          return {
            name: truncateToken(getTokenStrictName(token.info).name ?? '-'),
            id: getTokenIdentifierIfExists(token.info) ?? '-',
            amount: [beforeDecimal, afterDecimal].join(''),
            amountForSorting: shiftedAmount,
          }
        });
    })();

    const assetDeposit = publicDeriver.assetDeposits;
    const isNonZeroDeposit = !assetDeposit?.isEmpty();
    return (
      <TokensPage
        assetsList={assetsList}
        getTokenInfo={genLookupOrFail(this.props.stores.tokenInfoStore.tokenInfo)}
        assetDeposit={isNonZeroDeposit ? assetDeposit : null}
        shouldHideBalance={this.props.stores.profile.shouldHideBalance}
      />
    );
  }
}
