// @flow
import type { Node } from 'react';
import type { StoresAndActionsProps } from '../../types/injectedProps.types';
import React, { Component, Suspense } from 'react';
import { observer } from 'mobx-react';
import { Box } from '@mui/material';
import TopBarLayout from '../../components/layout/TopBarLayout';
import BannerContainer from '../banners/BannerContainer';
import SidebarContainer from '../SidebarContainer';

export const CreateWalletPagePromise: void => Promise<any> = () =>
  import('../../components/wallet/create-wallet/CreateWalletPage');
const CreateWalletPage = React.lazy(CreateWalletPagePromise);

@observer
export default class CreateWalletPageContainer extends Component<StoresAndActionsProps> {
  render(): Node {
    const { stores } = this.props;
    const { hasAnyWallets } = stores.wallets;

    const createWalletPageComponent = (
      <Suspense fallback={null}>
        <CreateWalletPage
          genWalletRecoveryPhrase={stores.substores.ada.wallets.genWalletRecoveryPhrase}
          createWallet={request => stores.substores.ada.wallets.createWallet(request)}
          setSelectedNetwork={stores.profile.setSelectedNetwork}
          selectedNetwork={stores.profile.selectedNetwork}
          openDialog={dialog => this.props.stores.uiDialogs.open({ dialog })}
          closeDialog={this.props.stores.uiDialogs.closeActiveDialog}
          isDialogOpen={stores.uiDialogs.isOpen}
          goToRoute={route => stores.app.goToRoute({ route })}
        />
      </Suspense>
    );

    return hasAnyWallets ? (
      <TopBarLayout
        banner={<BannerContainer stores={stores} />}
        sidebar={<SidebarContainer stores={stores} />}
        bgcolor="common.white"
      >
        {createWalletPageComponent}
      </TopBarLayout>
    ) : (
      <Box py="48px" height="100vh" sx={{ overflowY: 'auto' }}>
        {createWalletPageComponent}
      </Box>
    );
  }
}
