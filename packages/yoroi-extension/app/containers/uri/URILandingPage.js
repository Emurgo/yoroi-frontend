// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { computed } from 'mobx';
import { observer } from 'mobx-react';
import { ROUTES } from '../../routes-config';
import type { InjectedOrGenerated } from '../../types/injectedPropsType';
import URILandingDialogContainer from './URILandingDialogContainer';
import type { GeneratedData as URILandingDialogContainerData } from './URILandingDialogContainer';
import type { UriParams } from '../../utils/URIHandling';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver/index';
import { isValidReceiveAddress } from '../../api/ada/lib/storage/bridge/utils';

export type GeneratedData = typeof URILandingPage.prototype.generated;

@observer
export default class URILandingPage extends Component<InjectedOrGenerated<GeneratedData>> {
  onClose: void => void = () => {
    this.generated.actions.dialogs.closeActiveDialog.trigger();
    this.generated.actions.router.goToRoute.trigger({ route: ROUTES.MY_WALLETS });
    this.generated.stores.loading.resetUriParams();
  };

  onConfirm: void => void = () => {
    const firstSelectedWallet = this.firstSelectedWallet();

    // this will automatically reroute to the right page if no wallet exists
    this.generated.actions.router.goToRoute.trigger({
      route: ROUTES.WALLETS.SEND,
      publicDeriver: firstSelectedWallet,
    });
  };

  render(): Node {
    return (
      <URILandingDialogContainer
        {...this.generated.URILandingDialogContainerProps}
        onConfirm={this.onConfirm}
        onClose={this.onClose}
        firstSelectedWallet={this.firstSelectedWallet()}
      />
    );
  }

  @computed get generated(): {|
    URILandingDialogContainerProps: InjectedOrGenerated<URILandingDialogContainerData>,
    actions: {|
      dialogs: {|
        closeActiveDialog: {|
          trigger: (params: void) => void,
        |},
      |},
      router: {|
        goToRoute: {|
          trigger: (params: {|
            publicDeriver?: null | PublicDeriver<>,
            params?: ?any,
            route: string,
          |}) => void,
        |},
      |},
    |},
    stores: {|
      loading: {|
        resetUriParams: void => void,
        uriParams: ?UriParams,
      |},
      profile: {| isClassicTheme: boolean |},
      wallets: {|
        hasAnyWallets: boolean,
        publicDerivers: Array<PublicDeriver<>>,
      |},
    |},
  |} {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(URILandingDialogContainer)} no way to generated props`);
    }
    const { actions, stores } = this.props;
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
          publicDerivers: stores.wallets.publicDerivers,
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
      URILandingDialogContainerProps: ({
        stores,
        actions,
      }: InjectedOrGenerated<URILandingDialogContainerData>),
    });
  }

  firstSelectedWallet: void => null | PublicDeriver<> = () => {
    const wallets = this.generated.stores.wallets.publicDerivers;
    const firstCardanoWallet = wallets.find(publicDeriver => {
      if ( this.generated.stores.loading.uriParams?.address &&
        isValidReceiveAddress(
          this.generated.stores.loading.uriParams.address,
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
