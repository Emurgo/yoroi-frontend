// @flow
import { observer } from 'mobx-react';
import { Component } from 'react';
import type { InjectedOrGenerated } from '../../types/injectedPropsType';
import type { Node } from 'react';
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
import type { TxRequests } from '../../stores/toplevel/TransactionsStore';
import TokensPage from '../../components/wallet/assets/Tokens';

export type GeneratedData = typeof TokensPageRevamp.prototype.generated;

@observer
export default class TokensPageRevamp extends Component<InjectedOrGenerated<GeneratedData>> {
  render(): Node {
    const publicDeriver = this.generated.stores.wallets.selected;
    // Guard against potential null values
    if (!publicDeriver) throw new Error(`Active wallet required for ${nameof(TokensPageRevamp)}.`);
    const spendableBalance = this.generated.stores.transactions.getBalanceRequest.result;
    const getTokenInfo = genLookupOrFail(this.generated.stores.tokenInfoStore.tokenInfo);

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
            name: truncateToken(getTokenStrictName(token.info) ?? '-'),
            id: getTokenIdentifierIfExists(token.info) ?? '-',
            amount: [beforeDecimal, afterDecimal].join(''),
            amountForSorting: shiftedAmount,
          }
        });
    })();

    const txRequests = this.generated.stores.transactions.getTxRequests(publicDeriver);
    const assetDeposit = txRequests.requests.getAssetDepositRequest.result || null;

    const { stores } = this.generated;
    const { profile } = stores;
    const isNonZeroDeposit = !assetDeposit?.isEmpty();
    return (
      <TokensPage
        assetsList={assetsList}
        getTokenInfo={genLookupOrFail(this.generated.stores.tokenInfoStore.tokenInfo)}
        assetDeposit={isNonZeroDeposit ? assetDeposit : null}
        shouldHideBalance={profile.shouldHideBalance}
      />
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
      profile: {|
        shouldHideBalance: boolean,
      |},
    |},
  |} {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null) {
      throw new Error(`${nameof(TokensPageRevamp)} no way to generated props`);
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
        profile: {
          shouldHideBalance: stores.profile.shouldHideBalance,
        },
      },
    });
  }
}
