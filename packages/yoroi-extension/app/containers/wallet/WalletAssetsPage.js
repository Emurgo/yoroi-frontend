// @flow
import { Component } from 'react';
import { observer } from 'mobx-react';
import type { Node } from 'react';
import type { StoresAndActionsProps } from '../../types/injectedProps.types';
import { genLookupOrFail, getTokenIdentifierIfExists, getTokenStrictName } from '../../stores/stateless/tokenHelpers';
import { splitAmount, truncateToken } from '../../utils/formatters';
import AssetsPage from '../../components/wallet/assets/AssetsPage';
import { getNetworkById } from '../../api/ada/lib/storage/database/prepackaged/networks';

@observer
export default class WalletAssetsPage extends Component<StoresAndActionsProps> {

  render(): Node {
    const publicDeriver = this.props.stores.wallets.selected;
    // Guard against potential null values
    if (!publicDeriver) throw new Error(`Active wallet required for ${nameof(WalletAssetsPage)}.`);
    const network = getNetworkById(publicDeriver.networkId);
    const spendableBalance = this.props.stores.transactions.balance;
    const getTokenInfo= genLookupOrFail(this.props.stores.tokenInfoStore.tokenInfo)

    const assetsList = (() => {
        if (spendableBalance == null) return [];
        return [
          ...spendableBalance.nonDefaultEntries(),
        ].map(entry => ({
          entry,
          info: getTokenInfo(entry),
        })).map(token => {
          const numberOfDecimals = token.info?.Metadata.numberOfDecimals ?? 0;
          const shiftedAmount = token.entry.amount.shiftedBy(-numberOfDecimals);
          const [beforeDecimal, afterDecimal] = splitAmount(
            shiftedAmount,
            numberOfDecimals
          );
          return {
            name: truncateToken(getTokenStrictName(token.info).name ?? '-'),
            id: (getTokenIdentifierIfExists(token.info) ?? '-'),
            amount: [beforeDecimal, afterDecimal].join(''),
            amountForSorting: shiftedAmount,
          }
        });
      })();

    const assetDeposit = publicDeriver.assetDeposits;

    const isNonZeroDeposit = !assetDeposit?.isEmpty();
    return (
      <AssetsPage
        assetsList={assetsList}
        getTokenInfo={genLookupOrFail(this.props.stores.tokenInfoStore.tokenInfo)}
        assetDeposit={isNonZeroDeposit ? assetDeposit : null}
        shouldHideBalance={this.props.stores.profile.shouldHideBalance}
        network={network}
      />
    )
  }
};
