// @flow
import { Component } from 'react';
import type { Node, ComponentType } from 'react';
import type { StoresAndActionsProps } from '../../types/injectedProps.types';
import { observer } from 'mobx-react';
import { intlShape, injectIntl } from 'react-intl';
import TopBarLayout from '../../components/layout/TopBarLayout';
import BannerContainer from '../../containers/banners/BannerContainer';
import SidebarContainer from '../../containers/SidebarContainer';
import { Box, Typography } from '@mui/material';
import { withLayout } from '../../styles/context/layout';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { GouvernanceContextProvider } from '../features/gouvernace/module/GouvernanceContextProvider';
import globalMessages from '../../i18n/global-messages';
import { ModalProvider } from '../components/modals/ModalContext';
import { ModalManager } from '../components/modals/ModalManager';

type Props = {|
  ...StoresAndActionsProps,
  +children?: Node,
  navbar?: Node,
|};

type LayoutProps = {|
  stores: any,
  actions: any,
  children?: Node,
  navbar?: Node,
  intl: $npm$ReactIntl$IntlFormat,
|};

type InjectedLayoutProps = {|
  +renderLayoutComponent: any => Node,
|};

type AllProps = {| ...Props, ...InjectedLayoutProps |};

@observer
class GeneralPageLayout extends Component<LayoutProps> {
  static defaultProps: {| children: void |} = {
    children: undefined,
  };

  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  render() {
    const { children, actions, navbar, stores } = this.props;
    const sidebarContainer = <SidebarContainer actions={actions} stores={stores} />;
    const { intl } = this.context;

    const selectedWallet = this.props.stores.wallets.selected;
    if (!selectedWallet) {
      return null;
    }
    const currentWalletId = selectedWallet.getPublicDeriverId();
    const networkId = selectedWallet.getParent().getNetworkInfo().NetworkId;

    return (
      <GouvernanceContextProvider
        intl={this.context.intl}
        walletId={currentWalletId}
        networkId={networkId}
      >
        {/* TODO ModalProvider to be moved into APP after finish refactoring and bring everything in UI */}
        <ModalProvider>
          <ModalManager />
          <TopBarLayout
            banner={<BannerContainer actions={actions} stores={stores} />}
            sidebar={sidebarContainer}
            navbar={navbar}
          >
            {children}
          </TopBarLayout>
        </ModalProvider>
      </GouvernanceContextProvider>
    );
  }
}

export default (withLayout(GeneralPageLayout): ComponentType<Props>);
