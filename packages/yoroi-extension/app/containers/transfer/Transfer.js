// @flow
import type { Node } from 'react';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { Component, lazy, Suspense } from 'react';
import { observer } from 'mobx-react';
import { IntlContext } from 'react-intl';
import TopBarLayout from '../../components/layout/TopBarLayout';
import BannerContainer from '../banners/BannerContainer';
import SidebarContainer from '../SidebarContainer';
import NoWalletMessage from '../wallet/NoWalletMessage';
import NavBarTitle from '../../components/topbar/NavBarTitle';
import globalMessages from '../../i18n/global-messages';
import NavBarContainerRevamp from '../NavBarContainerRevamp';
import type { StoresProps } from '../../stores';

export const WalletTransferPagePromise: void => Promise<any> = () => import('./WalletTransferPage');
const WalletTransferPage = lazy(WalletTransferPagePromise);

type Props = {|
  +children?: Node,
|};

type AllProps = {| ...Props, ...StoresProps |};

@observer
export default class Transfer extends Component<AllProps> {
  static contextType:any = IntlContext;
  static defaultProps: {| children: void |} = {
    children: undefined,
  };

  render(): Node {
    const { stores } = this.props;
    const sidebarContainer = <SidebarContainer stores={stores} />;
    const navbar = (
      <NavBarContainerRevamp
        stores={stores}
        title={<NavBarTitle title={this.context.intl.formatMessage(globalMessages.sidebarTransfer)} />}
      />
    );

    return (
      <TopBarLayout
        banner={<BannerContainer stores={stores} />}
        navbar={navbar}
        sidebar={sidebarContainer}
        showInContainer
      >
        {this.getContent()}
      </TopBarLayout>
    );
  }

  getContent: void => Node = () => {
    const { stores } = this.props;
    const wallet = this.props.stores.wallets.selected;
    if (wallet == null) {
      return <NoWalletMessage />;
    }

    return (
      <Suspense fallback={null}>
        <WalletTransferPage stores={stores} />
      </Suspense>
    );
  };
}
