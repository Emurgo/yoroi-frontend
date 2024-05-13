// @flow
import type { Node } from 'react';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import type { StoresAndActionsProps } from '../../types/injectedProps.types';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { intlShape } from 'react-intl';
import { ROUTES } from '../../routes-config';
import { buildRoute } from '../../utils/routing';
import { routeForStore, allAddressSubgroups } from '../../stores/stateless/addressStores';
import { Box } from '@mui/material';
import ReceiveWithNavigation from '../../components/wallet/layouts/ReceiveWithNavigation';

type Props = {|
  ...StoresAndActionsProps,
  +children?: Node,
|};

@observer
export default class Receive extends Component<Props> {
  static defaultProps: {| children: void |} = {
    children: undefined,
  };
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  componentDidMount() {
    const publicDeriver = this.props.stores.wallets.selected;
    if (publicDeriver == null) throw new Error(`${nameof(Receive)} no public deriver`);
    const rootRoute = buildRoute(ROUTES.WALLETS.RECEIVE.ROOT);

    const storesForWallet = allAddressSubgroups.filter(store =>
      store.isRelated({
        selected: publicDeriver,
      })
    );
    if (this.props.stores.app.currentRoute === rootRoute) {
      // if no store is specified, we just send the user to the first store in the list
      const firstRoute = routeForStore(storesForWallet[0].name);
      // we redirect otherwise it would break the back button
      this.props.actions.router.redirect.trigger({ route: firstRoute });
    } else {
      const currentSelectedStore = storesForWallet.find(
        store => routeForStore(store.name) === this.props.stores.app.currentRoute
      );
      // if user switched to a different wallet that doesn't support the store type selected
      if (currentSelectedStore == null) {
        // just send user to the first store supported by this wallet
        this.props.actions.router.redirect.trigger({
          route: routeForStore(storesForWallet[0].name),
        });
      }
    }
  }
  componentWillUnmount() {
    this.props.actions.addresses.resetFilter.trigger();
  }

  render(): Node {
    const publicDeriver = this.props.stores.wallets.selected;
    if (publicDeriver == null) throw new Error(`${nameof(Receive)} no public deriver`);

    const storesForWallet = allAddressSubgroups
      .filter(store => store.isRelated({ selected: publicDeriver }))
      .map(store => {
        const request = this.props.stores.addresses.addressSubgroupMap.get(store.class);
        if (request == null) throw new Error('Should never happen');
        return {
          meta: store,
          request,
        };
      })
      .filter(storeInfo => !storeInfo.meta.isHidden({ result: storeInfo.request.all }))
      .map(storeInfo => ({
        isActiveStore: this.props.stores.app.currentRoute.startsWith(
          routeForStore(storeInfo.meta.name)
        ),
        setAsActiveStore: () =>
          this.props.actions.router.goToRoute.trigger({
            route: routeForStore(storeInfo.meta.name),
          }),
        name: storeInfo.meta.name,
        validFilters: storeInfo.meta.validFilters,
        wasExecuted: storeInfo.request.wasExecuted,
      }));

    return (
      <Box display="flex" mx="auto">
        <ReceiveWithNavigation
          addressStores={storesForWallet}
          setFilter={filter => this.props.actions.addresses.setFilter.trigger(filter)}
          activeFilter={this.props.stores.addresses.addressFilter}
        >
          {this.props.children}
        </ReceiveWithNavigation>
      </Box>
    );
  }
}
