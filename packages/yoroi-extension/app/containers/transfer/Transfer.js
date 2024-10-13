// @flow
import type { ComponentType, Node } from 'react';
import { Component, lazy, Suspense } from 'react';
import { observer } from 'mobx-react';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { intlShape } from 'react-intl';
import type { StoresAndActionsProps } from '../../types/injectedProps.types';
import TopBarLayout from '../../components/layout/TopBarLayout';
import BannerContainer from '../banners/BannerContainer';
import SidebarContainer from '../SidebarContainer';
import BackgroundColoredLayout from '../../components/layout/BackgroundColoredLayout';
import NoWalletMessage from '../wallet/NoWalletMessage';
import UnsupportedWallet from '../wallet/UnsupportedWallet';
import NavBarTitle from '../../components/topbar/NavBarTitle';
import NavBarContainer from '../NavBarContainer';
import globalMessages from '../../i18n/global-messages';
import HorizontalLine from '../../components/widgets/HorizontalLine';
import type { LayoutComponentMap } from '../../styles/context/layout';
import { withLayout } from '../../styles/context/layout';

export const WalletTransferPagePromise: void => Promise<any> = () => import('./WalletTransferPage');
const WalletTransferPage = lazy(WalletTransferPagePromise);

type Props = {|
  ...StoresAndActionsProps,
  +children?: Node,
|};

type InjectedLayoutProps = {| +renderLayoutComponent: LayoutComponentMap => Node |};
type AllProps = {| ...Props, ...InjectedLayoutProps |};

@observer
class Transfer extends Component<AllProps> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  static defaultProps: {| children: void |} = {
    children: undefined,
  };

  render(): Node {
    const { actions, stores } = this.props;
    const sidebarContainer = <SidebarContainer actions={actions} stores={stores} />;
    const navbar = (
      <NavBarContainer
        actions={actions}
        stores={stores}
        title={
          <NavBarTitle title={this.context.intl.formatMessage(globalMessages.sidebarTransfer)} />
        }
      />
    );
    return (
      <TopBarLayout
        banner={<BannerContainer actions={actions} stores={stores} />}
        navbar={navbar}
        sidebar={sidebarContainer}
        showInContainer
      >
        {this.getContent()}
      </TopBarLayout>
    );
  }

  getContent: void => Node = () => {
    const { actions, stores } = this.props;
    const wallet = this.props.stores.wallets.selected;
    if (wallet == null) {
      return <NoWalletMessage />;
    }
    // temporary solution: will need to handle more cases later for different currencies
    if (wallet.isCardanoHaskell) {
      return <UnsupportedWallet />;
    }
    return (
      <>
        <HorizontalLine />
        <BackgroundColoredLayout>
          <Suspense fallback={null}>
            <WalletTransferPage
              actions={actions}
              stores={stores}
              publicDeriver={wallet}
            />
          </Suspense>
        </BackgroundColoredLayout>
      </>
    );
  };
}
export default (withLayout(Transfer): ComponentType<Props>);
