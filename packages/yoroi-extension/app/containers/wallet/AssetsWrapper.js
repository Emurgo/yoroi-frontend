// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { computed } from 'mobx';
import type { InjectedOrGenerated } from '../../types/injectedPropsType';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver/index';
import { MultiToken } from '../../api/common/lib/MultiToken';
import type { TokenInfoMap } from '../../stores/toplevel/TokenInfoStore';
import type { TokenRow } from '../../api/ada/lib/storage/database/primitives/tables';
import type { TxRequests } from '../../stores/toplevel/TransactionsStore';
import TopBarLayout from '../../components/layout/TopBarLayout';
import BannerContainer from '../banners/BannerContainer';
import NavBarContainerRevamp from '../NavBarContainerRevamp';
import NavBarTitle from '../../components/topbar/NavBarTitle';
import globalMessages from '../../i18n/global-messages';
import SidebarContainer from '../SidebarContainer';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { intlShape } from 'react-intl';
import type { GeneratedData as BannerContainerData } from '../banners/BannerContainer';
import type { GeneratedData as SidebarContainerData } from '../SidebarContainer';
import type { GeneratedData as NavBarContainerRevampData } from '../NavBarContainerRevamp';

export type GeneratedData = typeof AssetsWrapper.prototype.generated;
type Props = {|
  ...InjectedOrGenerated<GeneratedData>,
  +children?: Node,
|};
@observer
export default class AssetsWrapper extends Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };
  static defaultProps: {| children: void |} = {
    children: undefined,
  };

  render(): Node {
    const publicDeriver = this.generated.stores.wallets.selected;
    if (!publicDeriver) throw new Error(`Active wallet required for ${nameof(AssetsWrapper)}.`);

    const { intl } = this.context;
    const sidebarContainer = <SidebarContainer {...this.generated.SidebarContainerProps} />;

    return (
      <TopBarLayout
        banner={<BannerContainer {...this.generated.BannerContainerProps} />}
        sidebar={sidebarContainer}
        navbar={
          <NavBarContainerRevamp
            {...this.generated.NavBarContainerRevampProps}
            title={<NavBarTitle title={intl.formatMessage(globalMessages.sidebarAssets)} />}
          />
        }
        showInContainer
        showAsCard
      >
        {this.props.children}
      </TopBarLayout>
    );
  }

  @computed get generated(): {|
    BannerContainerProps: InjectedOrGenerated<BannerContainerData>,
    SidebarContainerProps: InjectedOrGenerated<SidebarContainerData>,
    NavBarContainerRevampProps: InjectedOrGenerated<NavBarContainerRevampData>,

    stores: {|
      router: {| location: any |},
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
    actions: {|
      router: {|
        goToRoute: {|
          trigger: (params: {|
            publicDeriver?: null | PublicDeriver<>,
            params?: ?any,
            route: string,
          |}) => void,
        |},
      |},
    |},
  |} {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(AssetsWrapper)} no way to generated props`);
    }
    const { stores, actions } = this.props;
    return Object.freeze({
      stores: {
        router: {
          location: stores.router.location,
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
        profile: {
          shouldHideBalance: stores.profile.shouldHideBalance,
        },
      },
      actions: {
        router: {
          goToRoute: { trigger: actions.router.goToRoute.trigger },
        },
      },
      BannerContainerProps: ({ actions, stores }: InjectedOrGenerated<BannerContainerData>),
      NavBarContainerRevampProps: ({
        actions,
        stores,
      }: InjectedOrGenerated<NavBarContainerRevampData>),
      SidebarContainerProps: ({ actions, stores }: InjectedOrGenerated<SidebarContainerData>),
    });
  }
}
