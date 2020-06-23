// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { computed } from 'mobx';
import { observer } from 'mobx-react';
import { intlShape } from 'react-intl';
import type { InjectedOrGenerated } from '../../types/injectedPropsType';
import TopBarLayout from '../../components/layout/TopBarLayout';
import BannerContainer from '../banners/BannerContainer';
import type { GeneratedData as BannerContainerData } from '../banners/BannerContainer';
import SidebarContainer from '../SidebarContainer';
import BackgroundColoredLayout from '../../components/layout/BackgroundColoredLayout';
import NoWalletMessage from '../../components/wallet/settings/NoWalletMessage';
import NavBarTitle from '../../components/topbar/NavBarTitle';
import NavBarContainer from '../NavBarContainer';
import globalMessages from '../../i18n/global-messages';
import WalletTransferPage from './WalletTransferPage';
import type { GeneratedData as WalletTransferPageData } from './WalletTransferPage';
import type { GeneratedData as SidebarContainerData } from '../SidebarContainer';
import type { GeneratedData as NavBarContainerData } from '../NavBarContainer';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver/index';

export type GeneratedData = typeof Transfer.prototype.generated;

type Props = {|
  ...InjectedOrGenerated<GeneratedData>,
  +children?: Node,
|};

@observer
export default class Transfer extends Component<Props> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  static defaultProps: {|children: void|} = {
    children: undefined,
  };

  render(): Node {
    const sidebarContainer = (<SidebarContainer {...this.generated.SidebarContainerProps} />);

    const navbar = (
      <NavBarContainer
        {...this.generated.NavBarContainerProps}
        title={<NavBarTitle
          title={this.context.intl.formatMessage(globalMessages.sidebarTransfer)}
        />}
      />
    );

    return (
      <TopBarLayout
        banner={(<BannerContainer {...this.generated.BannerContainerProps} />)}
        navbar={navbar}
        sidebar={sidebarContainer}
        showInContainer
      >
        {this.getContent()}
      </TopBarLayout>
    );
  }

  getContent: void => Node = () => {
    const wallet = this.generated.stores.wallets.selected;
    if (wallet == null) {
      return (<NoWalletMessage />);
    }
    return (
      <BackgroundColoredLayout>
        <WalletTransferPage
          {...this.generated.WalletTransferPageProps}
          publicDeriver={wallet}
        />
      </BackgroundColoredLayout>
    );
  }

  @computed get generated(): {|
    BannerContainerProps: InjectedOrGenerated<BannerContainerData>,
    NavBarContainerProps: InjectedOrGenerated<NavBarContainerData>,
    SidebarContainerProps: InjectedOrGenerated<SidebarContainerData>,
    WalletTransferPageProps: InjectedOrGenerated<WalletTransferPageData>,
    actions: {|
      router: {|
        goToRoute: {|
          trigger: (params: {|
            publicDeriver?: null | PublicDeriver<>,
            params?: ?any,
            route: string
          |}) => void
        |}
      |}
    |},
    stores: {|
      app: {| currentRoute: string |},
      wallets: {| selected: null | PublicDeriver<> |}
    |}
    |} {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(Transfer)} no way to generated props`);
    }
    const { stores, actions } = this.props;
    return Object.freeze({
      stores: {
        app: {
          currentRoute: stores.app.currentRoute,
        },
        wallets: {
          selected: stores.wallets.selected,
        }
      },
      actions: {
        router: {
          goToRoute: { trigger: actions.router.goToRoute.trigger },
        },
      },
      SidebarContainerProps: (
        { actions, stores, }: InjectedOrGenerated<SidebarContainerData>
      ),
      NavBarContainerProps: (
        { actions, stores, }: InjectedOrGenerated<NavBarContainerData>
      ),
      WalletTransferPageProps: (
        { actions, stores, }: InjectedOrGenerated<WalletTransferPageData>
      ),
      BannerContainerProps: ({ actions, stores }: InjectedOrGenerated<BannerContainerData>),
    });
  }
}
