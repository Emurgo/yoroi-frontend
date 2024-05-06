// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { ROUTES } from '../../routes-config';
import type { StoresAndActionsProps } from '../../types/injectedProps.types';
import URILandingDialogContainer from './URILandingDialogContainer';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver/index';
import { isValidReceiveAddress } from '../../api/ada/lib/storage/bridge/utils';

@observer
export default class URILandingPage extends Component<StoresAndActionsProps> {
  onClose: void => void = () => {
    this.props.actions.dialogs.closeActiveDialog.trigger();
    this.props.actions.router.goToRoute.trigger({ route: ROUTES.WALLETS.ROOT });
    this.props.stores.loading.resetUriParams();
  };

  onConfirm: void => void = () => {
    const firstSelectedWallet = this.firstSelectedWallet();

    // this will automatically reroute to the right page if no wallet exists
    this.props.actions.router.goToRoute.trigger({
      route: ROUTES.WALLETS.SEND,
      publicDeriver: firstSelectedWallet,
    });
  };

  render(): Node {
    return (
      <URILandingDialogContainer
        actions={this.props.actions}
        stores={this.props.stores}
        onConfirm={this.onConfirm}
        onClose={this.onClose}
        firstSelectedWallet={this.firstSelectedWallet()}
      />
    );
  }

  firstSelectedWallet: void => null | PublicDeriver<> = () => {
    const wallets = this.props.stores.wallets.publicDerivers;
    const firstCardanoWallet = wallets.find(publicDeriver => {
      if ( this.props.stores.loading.uriParams?.address &&
        isValidReceiveAddress(
          this.props.stores.loading.uriParams.address,
          publicDeriver.getParent().getNetworkInfo()
        ) === true
      ) {
        return true;
      }
      return false;
    });

    return firstCardanoWallet !== undefined ? firstCardanoWallet : null;
  }
}
