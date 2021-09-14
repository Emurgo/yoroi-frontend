// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { computed, observable, runInAction } from 'mobx';
import type { Node } from 'react';
import { defineMessages, intlShape } from 'react-intl';
import type { InjectedOrGenerated } from '../../types/injectedPropsType';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver/index';
import {
  MultiToken,
} from '../../api/common/lib/MultiToken';
import type { TokenInfoMap } from '../../stores/toplevel/TokenInfoStore';
import type { TokenRow } from '../../api/ada/lib/storage/database/primitives/tables';
import { genFormatTokenAmount, genLookupOrFail, getTokenIdentifierIfExists, getTokenStrictName } from '../../stores/stateless/tokenHelpers';
import globalMessages from '../../i18n/global-messages';
import AssetsList from '../../components/wallet/assets/AssetsList';
import { truncateToken } from '../../utils/formatters';
import AssetsPage from '../../components/wallet/assets/AssetsPage';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

const messages = defineMessages({});

export type GeneratedData = typeof WalletAssetsPage.prototype.generated;

@observer
export default class WalletAssetsPage extends Component<InjectedOrGenerated<GeneratedData>> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const publicDeriver = this.generated.stores.wallets.selected;
    // Guard against potential null values
    if (!publicDeriver) throw new Error(`Active wallet required for ${nameof(WalletAssetsPage)}.`);
    const spendableBalance = this.generated.stores.transactions.getBalanceRequest.result
    const getTokenInfo= genLookupOrFail(this.generated.stores.tokenInfoStore.tokenInfo)

    const assetsList = (() => {
        if (spendableBalance == null) return [];
        return [
          ...spendableBalance.nonDefaultEntries(),
        ].map(entry => ({
          entry,
          info: getTokenInfo(entry),
        })).map(token => ({
          name: truncateToken(getTokenStrictName(token.info) ?? getTokenIdentifierIfExists(token.info) ?? '-'),
          id: (getTokenIdentifierIfExists(token.info) ?? '-'),
          amount: genFormatTokenAmount(getTokenInfo)(token.entry)
        }));
      })();
  
  
    return (
      <>
       <AssetsPage
        assetsList={assetsList}
       />
      </>
    );
  }

  @computed get generated(): {|
    stores: {|
      tokenInfoStore: {|
        tokenInfo: TokenInfoMap,
        getDefaultTokenInfo: number => $ReadOnly<TokenRow>,
      |},
      transactions: {|
        hasAnyPending: boolean,
        getBalanceRequest: {|
          result: ?MultiToken,
        |},
      |},
      wallets: {| selected: null | PublicDeriver<> |}
    |}
    |} {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null) {
      throw new Error(`${nameof(WalletAssetsPage)} no way to generated props`);
    }
    const { stores } = this.props;
    const adaStore = stores.substores.ada;
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
          hasAnyPending: stores.transactions.hasAnyPending,
          getBalanceRequest: (() => {
            if (stores.wallets.selected == null) return {
              result: undefined,
            };
            const { requests } = stores.transactions.getTxRequests(stores.wallets.selected);

            return {
              result: requests.getBalanceRequest.result,
            };
          })(),
        }
    }})
  }
};