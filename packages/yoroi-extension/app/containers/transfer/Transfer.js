// @flow
import type { Node } from 'react';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import type { StoresAndActionsProps } from '../../types/injectedProps.types';
import { Component, lazy, Suspense } from 'react';
import { observer } from 'mobx-react';
import { intlShape } from 'react-intl';
import TopBarLayout from '../../components/layout/TopBarLayout';
import BannerContainer from '../banners/BannerContainer';
import SidebarContainer from '../SidebarContainer';
import NoWalletMessage from '../wallet/NoWalletMessage';
import NavBarTitle from '../../components/topbar/NavBarTitle';
import globalMessages from '../../i18n/global-messages';
import NavBarContainerRevamp from '../NavBarContainerRevamp';

export const WalletTransferPagePromise: void => Promise<any> = () => import('./WalletTransferPage');
const WalletTransferPage = lazy(WalletTransferPagePromise);

type Props = {|
  +children?: Node,
|};

type AllProps = {| ...Props, ...StoresAndActionsProps |};

@observer
export default class Transfer extends Component<AllProps> {
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
      <NavBarContainerRevamp
        actions={actions}
        stores={stores}
        title={<NavBarTitle title={this.context.intl.formatMessage(globalMessages.sidebarTransfer)} />}
      />
    );

    return (
      <TopBarLayout banner={<BannerContainer actions={actions} stores={stores} />} navbar={navbar} sidebar={sidebarContainer}>
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

    return (
      <Suspense fallback={null}>
        <WalletTransferPage actions={actions} stores={stores} />
      </Suspense>
    );
  };
}
