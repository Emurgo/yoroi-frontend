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
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver/index';

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

  getStakePoolMeta: () => any = () => {
    const publicDeriver = this.props.stores.wallets.selected;
    const delegationStore = this.props.stores.delegation;
    const currentPool = delegationStore.getDelegatedPoolId(publicDeriver);
    if (currentPool == null) return null;
    const networkInfo = publicDeriver.getParent().getNetworkInfo();
    const poolMeta = delegationStore.getLocalPoolInfo(networkInfo, currentPool);
    const poolInfo = delegationStore.getLocalRemotePoolInfo(networkInfo, currentPool) ?? {};
    if (poolMeta == null) {
      // server hasn't returned information about the stake pool yet
      return null;
    }
    const { intl } = this.context;
    const name = poolMeta.info?.name ?? intl.formatMessage(globalMessages.unknownPoolLabel);
    const delegatedPool = {
      id: String(currentPool),
      name,
      websiteUrl: poolMeta.info?.homepage,
      ticker: poolMeta.info?.ticker,
      ...poolInfo,
    };

    return {
      ...delegatedPool,
      ...poolMeta,
    };
  };

  createCurrrentWalletInfo: () => any = () => {
    const { wallets, delegation, substores } = this.props.stores;
    const walletCurrentPoolInfo = this.getStakePoolMeta();

    const selectedWallet = wallets.selected;
    if (selectedWallet == null) {
      throw new Error(`no selected Wallet. Should never happen`);
    }

    const currentWalletId = selectedWallet.getPublicDeriverId();
    const networkInfo = selectedWallet.getParent().getNetworkInfo();
    const networkId = networkInfo.NetworkId;

    return {
      currentPool: walletCurrentPoolInfo,
      networkId,
      walletId: currentWalletId,
    };
  };

  render() {
    const { children, actions, navbar, stores } = this.props;
    const sidebarContainer = <SidebarContainer actions={actions} stores={stores} />;
    const { intl } = this.context;

    const currentWalletInfo = this.createCurrrentWalletInfo();

    return (
      <GouvernanceContextProvider intl={this.context.intl} currentWallet={currentWalletInfo}>
        <ModalProvider>
          <ModalManager />
          <TopBarLayout banner={<BannerContainer actions={actions} stores={stores} />} sidebar={sidebarContainer} navbar={navbar}>
            {children}
          </TopBarLayout>
        </ModalProvider>
      </GouvernanceContextProvider>
    );
  }
}

export default (withLayout(GeneralPageLayout): ComponentType<Props>);
