// @flow
import type { Node } from 'react';
import React, { Component } from 'react';
import { computed } from 'mobx';
import { observer } from 'mobx-react';
import { ROUTES } from '../../routes-config';
import type { InjectedOrGenerated } from '../../types/injectedPropsType';
import URILandingDialogContainer from './URILandingDialogContainer';
import type { GeneratedData as URILandingDialogContainerData } from './URILandingDialogContainer';
import type { UriParams } from '../../utils/URIHandling';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver/index';

export type GeneratedData = typeof URILandingPage.prototype.generated;

@observer
export default class URILandingPage extends Component<InjectedOrGenerated<GeneratedData>> {

  onClose: void => void = () => {
    this.generated.actions.dialogs.closeActiveDialog.trigger();
    this.generated.actions.router.goToRoute.trigger({ route: ROUTES.WALLETS.TRANSACTIONS });
    this.generated.stores.loading.resetUriParams();
  };

  onConfirm: void => void = () => {
    const { wallets } = this.generated.stores;
    let params = {};
    if (wallets.hasAnyWallets && wallets.first) {
      const firstWallet = wallets.first;
      params = { id: firstWallet.getPublicDeriverId() };
    }
    // this will automatically reroute to the right page if no wallet exists
    this.generated.actions.router.goToRoute.trigger({
      route: ROUTES.WALLETS.SEND,
      params,
    });
  }

  render(): Node {
    return (
      <URILandingDialogContainer
        {...this.generated.URILandingDialogContainerProps}
        onConfirm={this.onConfirm}
        onClose={this.onClose}
      />
    );
  }

  @computed get generated(): {|
    URILandingDialogContainerProps: InjectedOrGenerated<URILandingDialogContainerData>,
    actions: {|
      dialogs: {|
        closeActiveDialog: {|
          trigger: (params: void) => void
        |}
      |},
      router: {|
        goToRoute: {|
          trigger: (params: {|
            forceRefresh?: boolean,
            params?: ?any,
            route: string
          |}) => void
        |}
      |}
    |},
    stores: {|
      loading: {|
        resetUriParams: void => void,
        uriParams: ?UriParams
      |},
      profile: {| isClassicTheme: boolean |},
      wallets: {|
        first: null | PublicDeriver<>,
        hasAnyWallets: boolean
      |}
    |}
    |} {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(URILandingDialogContainer)} no way to generated props`);
    }
    const { actions, stores, } = this.props;
    return Object.freeze({
      stores: {
        profile: {
          isClassicTheme: stores.profile.isClassicTheme,
        },
        loading: {
          uriParams: stores.loading.uriParams,
          resetUriParams: stores.loading.resetUriParams,
        },
        wallets: {
          hasAnyWallets: stores.wallets.hasAnyWallets,
          first: stores.wallets.first,
        },
      },
      actions: {
        dialogs: {
          closeActiveDialog: {
            trigger: actions.dialogs.closeActiveDialog.trigger,
          },
        },
        router: {
          goToRoute: {
            trigger: actions.router.goToRoute.trigger,
          },
        },
      },
      URILandingDialogContainerProps: (
        { stores, actions }: InjectedOrGenerated<URILandingDialogContainerData>
      )
    });
  }

}
