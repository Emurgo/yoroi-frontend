// @flow
import type { Node } from 'react';
import React, { Component, Suspense } from 'react';
import { observer } from 'mobx-react';
import { Box } from '@mui/material';
import TopBarLayout from '../../../components/layout/TopBarLayout';
import BannerContainer from '../../banners/BannerContainer';
import SidebarContainer from '../../SidebarContainer';
import type { StoresProps } from '../../../stores';

export const RestoreWalletPagePromise: void => Promise<any> = () =>
  import('../../../components/wallet/restore/RestoreWalletPage');
const RestoreWalletPageComponent = React.lazy(RestoreWalletPagePromise);

@observer
export default class RestoreWalletPage extends Component<StoresProps> {
  render(): Node {
    const { stores } = this.props;
    const { hasAnyWallets } = stores.wallets;

    const restoreWalletPageComponent = (
      <Suspense fallback={null}>
        <RestoreWalletPageComponent
          restoreWallet={stores.substores.ada.walletRestore.restoreWallet}
          stores={stores}
          openDialog={dialog => this.props.stores.uiDialogs.open({ dialog })}
          closeDialog={this.props.stores.uiDialogs.closeActiveDialog}
          isDialogOpen={stores.uiDialogs.isOpen}
        />
      </Suspense>
    );

    return hasAnyWallets ? (
      <TopBarLayout
        banner={<BannerContainer stores={stores} />}
        sidebar={<SidebarContainer stores={stores} />}
        bgcolor="common.white"
      >
        {restoreWalletPageComponent}
      </TopBarLayout>
    ) : (
      <Box py="48px" height="100vh" sx={{ overflowY: 'auto' }}>
        {restoreWalletPageComponent}
      </Box>
    );
  }
}
