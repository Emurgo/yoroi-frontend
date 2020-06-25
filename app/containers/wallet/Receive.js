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
import type { AddressFilterKind } from '../../types/AddressFilterTypes';
import { ROUTES } from '../../routes-config';
import { buildRoute } from '../../utils/routing';
import type { IAddressTypeStore, IAddressTypeUiSubset } from '../../stores/stateless/addressStores';
import { routeForStore, allAddressSubgroups, } from '../../stores/stateless/addressStores';
import FullscreenLayout from '../../components/layout/FullscreenLayout';

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
      ROUTES.WALLETS.RECEIVE.ROOT
    );

    const storesForWallet = allAddressSubgroups.filter(store => store.isRelated({
      selected: publicDeriver,
    }));
    if (this.generated.stores.app.currentRoute === rootRoute) {
      // if no store is specified, we just send the user to the first store in the list
      const firstRoute = routeForStore(storesForWallet[0].name);
      // we redirect otherwise it would break the back button
      this.generated.actions.router.redirect.trigger({ route: firstRoute });
    } else {
      const currentSelectedStore = storesForWallet.find(
        store => routeForStore(store.name) === this.generated.stores.app.currentRoute
      );
      // if user switched to a different wallet that doesn't support the store type selected
      if (currentSelectedStore == null) {
        // just send user to the first store supported by this wallet
        this.generated.actions.router.redirect.trigger({
          route: routeForStore(storesForWallet[0].name)
        });
      }
    }
  }
  componentWillUnmount() {
    this.generated.actions.addresses.resetFilter.trigger();
  }

  render(): Node {
    const publicDeriver = this.generated.stores.wallets.selected;
    if (publicDeriver == null) throw new Error(`${nameof(Receive)} no public deriver`);


    const storesForWallet = allAddressSubgroups
      .filter(store => store.isRelated({ selected: publicDeriver, }))
      .map(store => {
        const request = this.generated.stores.addresses.addressSubgroupMap.get(store.class);
        if (request == null) throw new Error('Should never happen');
        return {
          meta: store,
          request,
        };
      })
      .filter(storeInfo => !storeInfo.meta.isHidden({ result: storeInfo.request.all }))
      .map(storeInfo => ({
        isActiveStore: this.generated.stores.app.currentRoute.startsWith(
          routeForStore(storeInfo.meta.name)
        ),
        setAsActiveStore: () => this.generated.actions.router.goToRoute.trigger({
          route: routeForStore(storeInfo.meta.name),
        }),
        name: storeInfo.meta.name,
        validFilters: storeInfo.meta.validFilters,
        wasExecuted: storeInfo.request.wasExecuted,
      }));

    return (
      <FullscreenLayout bottomPadding={57}>
        <ReceiveWithNavigation
          addressStores={storesForWallet}
          setFilter={filter => this.generated.actions.addresses.setFilter.trigger(filter)}
          activeFilter={this.generated.stores.addresses.addressFilter}
        >
          {this.props.children}
        </ReceiveWithNavigation>
      </FullscreenLayout>
    );
  }

  @computed get generated(): {|
    stores: {|
      app: {| currentRoute: string |},
      addresses: {|
        addressFilter: AddressFilterKind,
        addressSubgroupMap: $ReadOnlyMap<Class<IAddressTypeStore>, IAddressTypeUiSubset>,
      |},
      wallets: {|selected: null | PublicDeriver<>|},
    |},
    actions: {|
      addresses: {|
        setFilter: {| trigger: (params: AddressFilterKind) => void |},
        resetFilter: {| trigger: (params: void) => void |},
      |},
      router: {|
        redirect: {|
          trigger: (params: {|
            params?: ?any,
            route: string
          |}) => void
        |},
        goToRoute: {|
          trigger: (params: {|
            publicDeriver?: null | PublicDeriver<>,
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
          addressSubgroupMap: stores.addresses.addressSubgroupMap,
        },
      },
      actions: {
        addresses: {
          setFilter: { trigger: actions.addresses.setFilter.trigger, },
          resetFilter: { trigger: actions.addresses.resetFilter.trigger, },
        },
        router: {
          goToRoute: { trigger: actions.router.goToRoute.trigger },
          redirect: { trigger: actions.router.redirect.trigger },
        },
      }
    });
  }
}
