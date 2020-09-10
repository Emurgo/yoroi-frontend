// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { computed, } from 'mobx';
import { intlShape, defineMessages } from 'react-intl';
import TopBarLayout from '../../components/layout/TopBarLayout';
import VerticallyCenteredLayout from '../../components/layout/VerticallyCenteredLayout';
import SidebarContainer from '../SidebarContainer';
import NavBarContainer from '../NavBarContainer';
import type { GeneratedData as SidebarContainerData } from '../SidebarContainer';
import type { GeneratedData as NavBarContainerData } from '../NavBarContainer';
import BannerContainer from '../banners/BannerContainer';
import type { GeneratedData as BannerContainerData } from '../banners/BannerContainer';
import NavBarBack from '../../components/topbar/NavBarBack';
import LoadingSpinner from '../../components/widgets/LoadingSpinner';
import { ROUTES } from '../../routes-config';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import type { InjectedOrGenerated } from '../../types/injectedPropsType';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver/index';
import type { WarningList } from '../../stores/toplevel/WalletSettingsStore';
import { allCategories } from '../../stores/stateless/topbarCategories';
import WalletExportInfo from '../../components/wallet/WalletExportInfo';
import {
  asHasPrivateDeriver,
} from '../../api/ada/lib/storage/models/PublicDeriver/traits';
import {
  asGetPrivateDeriverKey,
} from '../../api/ada/lib/storage/models/ConceptualWallet/traits';
import type {
  IGetPrivateDeriverKey,
} from '../../api/ada/lib/storage/models/ConceptualWallet/interfaces';
import type {
  PrivateKeyCache,
} from '../../stores/toplevel/WalletStore';

export type GeneratedData = typeof Wallet.prototype.generated;

type Props = {|
  ...InjectedOrGenerated<GeneratedData>,
  +children?: Node,
|};

const messages = defineMessages({
  backButton: {
    id: 'wallet.nav.backButton',
    defaultMessage: '!!!Back to my wallets',
  },
});

@observer
export default class Wallet extends Component<Props> {

  static defaultProps: {|children: void|} = {
    children: undefined
  };

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  componentDidMount() {
    const publicDeriver = this.generated.stores.wallets.selected;
    if (publicDeriver == null) throw new Error(`${nameof(Wallet)} no public deriver`);

    const activeCategory = allCategories.find(
      category => this.generated.stores.app.currentRoute.startsWith(category.route)
    );
    if (activeCategory == null) return;
    if (!activeCategory.isVisible({ selected: publicDeriver })) {
      const firstValidCategory = allCategories.find(
        category => category.isVisible({ selected: publicDeriver })
      );
      if (firstValidCategory == null) {
        throw new Error(`Selected wallet has no valid category`);
      }
      this.generated.actions.router.redirect.trigger({
        route: firstValidCategory.route,
      });
    }
  }

  navigateToWallets: string => void = (destination) => {
    this.generated.actions.router.goToRoute.trigger({ route: destination });
  }

  render(): Node {
    const { intl } = this.context;
    const { wallets, } = this.generated.stores;
    const sidebarContainer = (<SidebarContainer {...this.generated.SidebarContainerProps} />);
    const navbarContainer = (
      <NavBarContainer
        {...this.generated.NavBarContainerProps}
        title={
          <NavBarBack
            route={ROUTES.MY_WALLETS}
            onBackClick={this.navigateToWallets}
            title={intl.formatMessage(messages.backButton)}
          />
        }
      />
    );

    if (!wallets.selected) {
      return (
        <TopBarLayout
          banner={(<BannerContainer {...this.generated.BannerContainerProps} />)}
          navbar={navbarContainer}
          showInContainer
          showAsCard
        >
          <VerticallyCenteredLayout>
            <LoadingSpinner />
          </VerticallyCenteredLayout>
        </TopBarLayout>
      );
    }
    const selectedWallet = wallets.selected;
    const warning = this.getWarning(selectedWallet);

    let privateKey = undefined;
    const withPrivateDeriver = asHasPrivateDeriver(selectedWallet);
    if (withPrivateDeriver != null) {
      const withPrivateKey = asGetPrivateDeriverKey(withPrivateDeriver.getParent());
      if (withPrivateKey != null) {
        const cacheEntry = this.generated.stores.wallets.getPrivateKeyCache(withPrivateKey);
        privateKey = cacheEntry.privateKey;
      }
    }
    return (
      <TopBarLayout
        banner={(<BannerContainer {...this.generated.BannerContainerProps} />)}
        sidebar={sidebarContainer}
        navbar={navbarContainer}
        showInContainer
        showAsCard
      >
        {warning}
        <WalletExportInfo
          privateKey={privateKey}
        />
      </TopBarLayout>
    );
  }

  getWarning: PublicDeriver<> => void | Node = (publicDeriver) => {
    const warnings = this.generated.stores.walletSettings.getWalletWarnings(publicDeriver).dialogs;
    if (warnings.length === 0) {
      return undefined;
    }
    return warnings[warnings.length - 1]();
  }

  @computed get generated(): {|
    BannerContainerProps: InjectedOrGenerated<BannerContainerData>,
    NavBarContainerProps: InjectedOrGenerated<NavBarContainerData>,
    SidebarContainerProps: InjectedOrGenerated<SidebarContainerData>,
    actions: {|
      router: {|
        goToRoute: {|
          trigger: (params: {|
            publicDeriver?: null | PublicDeriver<>,
            params?: ?any,
            route: string
          |}) => void,
        |},
        redirect: {|
          trigger: (params: {|
            params?: ?any,
            route: string
          |}) => void
        |},
      |}
    |},
    stores: {|
      app: {| currentRoute: string |},
      walletSettings: {|
        getWalletWarnings: (PublicDeriver<>) => WarningList
      |},
      wallets: {|
        getPrivateKeyCache: IGetPrivateDeriverKey => PrivateKeyCache,
        selected: null | PublicDeriver<>
      |}
    |}
    |} {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(Wallet)} no way to generated props`);
    }
    const { stores, actions } = this.props;
    const settingStore = this.props.stores.walletSettings;
    return Object.freeze({
      stores: {
        app: {
          currentRoute: stores.app.currentRoute,
        },
        wallets: {
          selected: stores.wallets.selected,
          getPrivateKeyCache: stores.wallets.getPrivateKeyCache,
        },
        walletSettings: {
          getWalletWarnings: settingStore.getWalletWarnings,
        },
      },
      actions: {
        router: {
          goToRoute: { trigger: actions.router.goToRoute.trigger },
          redirect: { trigger: actions.router.redirect.trigger },
        },
      },
      SidebarContainerProps: ({ actions, stores, }: InjectedOrGenerated<SidebarContainerData>),
      NavBarContainerProps: ({ actions, stores, }: InjectedOrGenerated<NavBarContainerData>),
      BannerContainerProps: ({ actions, stores }: InjectedOrGenerated<BannerContainerData>),
    });
  }
}
