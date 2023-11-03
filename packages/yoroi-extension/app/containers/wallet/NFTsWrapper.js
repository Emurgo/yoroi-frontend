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
import TopBarLayout from '../../components/layout/TopBarLayout';
import BannerContainer from '../banners/BannerContainer';
import NavBarContainerRevamp from '../NavBarContainerRevamp';
import NavBarTitle from '../../components/topbar/NavBarTitle';
import SidebarContainer from '../SidebarContainer';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { intlShape, defineMessages } from 'react-intl';
import type { GeneratedData as BannerContainerData } from '../banners/BannerContainer';
import type { GeneratedData as SidebarContainerData } from '../SidebarContainer';
import type { GeneratedData as NavBarContainerRevampData } from '../NavBarContainerRevamp';
import { buildRoute } from '../../utils/routing';
import { matchPath } from 'react-router';

export type GeneratedData = typeof NFTsWrapper.prototype.generated;
type Props = {|
  ...InjectedOrGenerated<GeneratedData>,
  +children?: Node,
|};

const messages = defineMessages({
  NFTGallery: {
    id: 'wallet.nftGallary.title',
    defaultMessage: '!!!NFT Gallery',
  },
})
@observer
export default class NFTsWrapper extends Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };
  static defaultProps: {| children: void |} = {
    children: undefined,
  };
  // <TODO:CHECK_LINT>
  // eslint-disable-next-line react/no-unused-class-component-methods
  isActivePage: string => boolean = route => {
    const { location } = this.generated.stores.router;
    if (location) {
      return !!matchPath(location.pathname, {
        path: buildRoute(route),
        exact: false,
      });
    }
    return false;
  };

  render(): Node {
    const publicDeriver = this.generated.stores.wallets.selected;
    if (!publicDeriver) throw new Error(`Active wallet required for ${nameof(NFTsWrapper)}.`);

    const { intl } = this.context;
    const sidebarContainer = <SidebarContainer {...this.generated.SidebarContainerProps} />;
    return (
      <TopBarLayout
        banner={<BannerContainer {...this.generated.BannerContainerProps} />}
        sidebar={sidebarContainer}
        navbar={
          <NavBarContainerRevamp
            {...this.generated.NavBarContainerRevampProps}
            title={<NavBarTitle title={intl.formatMessage(messages.NFTGallery)} />}
          />
        }
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
      transactions: {| balance: MultiToken | null |},
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
      throw new Error(`${nameof(NFTsWrapper)} no way to generated props`);
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
          balance: stores.transactions.balance,
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
