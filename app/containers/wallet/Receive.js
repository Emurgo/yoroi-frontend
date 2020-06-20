// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { computed } from 'mobx';
import { observer } from 'mobx-react';
import { intlShape } from 'react-intl';
import type {
  $npm$ReactIntl$IntlFormat,
} from 'react-intl';
import type { InjectedOrGenerated } from '../../types/injectedPropsType';
import ReceiveWithNavigation from '../../components/wallet/layouts/ReceiveWithNavigation';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver/index';
import type { AddressTypeName, AddressGroupName, AddressFilterKind } from '../../types/AddressFilterTypes';
import { ROUTES } from '../../routes-config';
import { buildRoute } from '../../utils/routing';

export type GeneratedData = typeof Receive.prototype.generated;

type Props = {|
  ...InjectedOrGenerated<GeneratedData>,
  +children?: Node
|};

@observer
export default class Receive extends Component<Props> {

  static defaultProps: {|children: void|} = {
    children: undefined,
  };
  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  componentDidMount() {
    const publicDeriver = this.generated.stores.wallets.selected;
    if (publicDeriver == null) throw new Error(`${nameof(Receive)} no public deriver`);
    const rootRoute = buildRoute(
      ROUTES.WALLETS.RECEIVE.ROOT,
      {
        id: publicDeriver.getPublicDeriverId(),
      }
    );
    if (this.generated.stores.app.currentRoute === rootRoute) {
      // if no store is specified, we just send the user to the first store in the list
      const stores = this.generated.stores.addresses.getStoresForWallet(publicDeriver);
      const firstRoute = buildRoute(
        ROUTES.WALLETS.RECEIVE.ADDRESS_LIST,
        {
          id: publicDeriver.getPublicDeriverId(),
          group: stores[0].groupName.stable,
          name: stores[0].name.stable,
        }
      );
      this.generated.actions.router.goToRoute.trigger({ route: firstRoute });
    }
  }
  componentWillUnmount() {
    this.generated.actions.addresses.resetFilter.trigger();
  }

  render(): Node {
    const publicDeriver = this.generated.stores.wallets.selected;
    if (publicDeriver == null) throw new Error(`${nameof(Receive)} no public deriver`);
    const { addresses } = this.generated.stores;
    return (
      <ReceiveWithNavigation
        addressTypes={addresses.getStoresForWallet(publicDeriver)}
        setFilter={filter => this.generated.actions.addresses.setFilter.trigger(filter)}
        activeFilter={this.generated.stores.addresses.addressFilter}
      >
        {this.props.children}
      </ReceiveWithNavigation>
    );
  }

  @computed get generated(): {|
    stores: {|
      app: {| currentRoute: string |},
      addresses: {|
        addressFilter: AddressFilterKind,
        getStoresForWallet: (
          publicDeriver: PublicDeriver<>
        ) => Array<
          {|
            +isActiveStore: boolean,
            +isHidden: boolean,
            +groupName: AddressGroupName,
            +name: AddressTypeName,
            +setAsActiveStore: (void) => void,
          |},
        >,
      |},
      wallets: {|selected: null | PublicDeriver<>|},
    |},
    actions: {|
      addresses: {|
        setFilter: {| trigger: (params: AddressFilterKind) => void |},
        resetFilter: {| trigger: (params: void) => void |},
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
    |}
    |} {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(Receive)} no way to generated props`);
    }
    const { stores, actions } = this.props;
    return Object.freeze({
      stores: {
        wallets: {
          selected: stores.wallets.selected,
        },
        app: {
          currentRoute: stores.app.currentRoute,
        },
        addresses: {
          addressFilter: stores.addresses.addressFilter,
          getStoresForWallet: (publicDeriver: PublicDeriver<>) => {
            const addressStores = stores.addresses.getStoresForWallet(publicDeriver);
            const functionalitySubset = addressStores.map(addressStore => ({
              isHidden: addressStore.isHidden,
              isActiveStore: addressStore.isActiveStore,
              setAsActiveStore: () => addressStore.setAsActiveStore(publicDeriver),
              name: addressStore.name,
              groupName: addressStore.groupName,
            }));
            return functionalitySubset;
          },
        },
      },
      actions: {
        addresses: {
          setFilter: { trigger: actions.addresses.setFilter.trigger, },
          resetFilter: { trigger: actions.addresses.resetFilter.trigger, },
        },
        router: {
          goToRoute: { trigger: actions.router.goToRoute.trigger },
        },
      }
    });
  }
}
