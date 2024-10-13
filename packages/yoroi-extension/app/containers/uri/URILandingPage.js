// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { ROUTES } from '../../routes-config';
import type { StoresAndActionsProps } from '../../types/injectedProps.types';
import URILandingDialogContainer from './URILandingDialogContainer';
import { isValidReceiveAddress } from '../../api/ada/lib/storage/bridge/utils';
import { getNetworkById } from '../../api/ada/lib/storage/database/prepackaged/networks';

@observer
export default class URILandingPage extends Component<StoresAndActionsProps> {
  onClose: void => void = () => {
    const { stores } = this.props;
    this.props.actions.dialogs.closeActiveDialog.trigger();
    stores.app.goToRoute({ route: ROUTES.WALLETS.ROOT });
    stores.loading.resetUriParams();
  };

  onConfirm: void => void = () => {
    // this will automatically reroute to the right page if no wallet exists
    this.props.stores.app.goToRoute({
      route: ROUTES.WALLETS.SEND,
      publicDeriverId: this.firstSelectedWalletId(),
    });
  };

  render(): Node {
    return (
      <URILandingDialogContainer
        actions={this.props.actions}
        stores={this.props.stores}
        onConfirm={this.onConfirm}
        onClose={this.onClose}
        hasFirstSelectedWallet={this.firstSelectedWalletId() != null}
      />
    );
  }

  firstSelectedWalletId: void => null | number = () => {
    const { wallets } = this.props.stores.wallets;
    const firstCardanoWallet = wallets.find(wallet => {
      if ( this.props.stores.loading.uriParams?.address &&
        isValidReceiveAddress(
          this.props.stores.loading.uriParams.address,
          getNetworkById(wallet.networkId),
        ) === true
      ) {
        return true;
      }
      return false;
    });

    return firstCardanoWallet !== undefined ? firstCardanoWallet.publicDeriverId : null;
  }
}
