// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { ROUTES } from '../../routes-config';
import environment from '../../environment';
import type { InjectedProps } from '../../types/injectedPropsType';
import Wallet from '../../domain/Wallet';
import URILandingDialogContainer from './URILandingDialogContainer';

type Props = InjectedProps;

@observer
export default class URILandingPage extends Component<Props> {

  onClose = () => {
    this.props.actions.dialogs.closeActiveDialog.trigger();
    this.props.actions.router.goToRoute.trigger({ route: ROUTES.WALLETS.TRANSACTIONS });
    this.props.stores.loading.resetUriParams();
  };

  onConfirm = () => {
    const { wallets } = this.props.stores.substores[environment.API];
    let params = {};
    if (wallets.hasAnyWallets && wallets.first) {
      const firstWallet: Wallet = wallets.first;
      params = { id: firstWallet.id };
    }
    // this will automatically reroute to the right page if no wallet exists
    this.props.actions.router.goToRoute.trigger({
      route: ROUTES.WALLETS.SEND,
      params,
    });
  }

  render() {

    const { actions, stores } = this.props;
    const { profile, loading } = this.props.stores;

    return (
      <URILandingDialogContainer
        actions={actions}
        stores={stores}
        onConfirm={this.onConfirm}
        onClose={this.onClose}
        uriParams={loading.uriParams}
        classicTheme={profile.isClassicTheme}
      />
    );
  }

}
