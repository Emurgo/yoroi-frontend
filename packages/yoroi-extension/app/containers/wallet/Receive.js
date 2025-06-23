// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { IntlContext } from 'react-intl';
import { ROUTES } from '../../routes-config';
import { buildRoute } from '../../utils/routing';
import { routeForStore, allAddressSubgroups } from '../../stores/stateless/addressStores';
import { Box } from '@mui/material';
import ReceiveWithNavigation from '../../components/wallet/layouts/ReceiveWithNavigation';
import type { StoresProps } from '../../stores';

type LocalProps = {|
  +children?: Node,
|};

@observer
export default class Receive extends Component<{| ...StoresProps, ...LocalProps |}> {
  static defaultProps: {| children: void |} = {
    children: undefined,
  };
  static contextType:any = IntlContext;
  componentDidMount() {
    const { stores } = this.props;
    const publicDeriver = stores.wallets.selected;
    if (publicDeriver == null) throw new Error(`${nameof(Receive)} no public deriver`);
    const rootRoute = buildRoute(ROUTES.WALLETS.RECEIVE.ROOT);

    const storesForWallet = allAddressSubgroups.filter(store => store.isRelated());
    if (stores.routing.currentRoute === rootRoute) {
      // if no store is specified, we just send the user to the first store in the list
      const firstRoute = routeForStore(storesForWallet[0].name);
      // we redirect otherwise it would break the back button
      stores.routing.replaceRoute({ route: firstRoute });
    } else {
      const currentSelectedStore = storesForWallet.find(
        store => routeForStore(store.name) === stores.routing.currentRoute
      );
      // if user switched to a different wallet that doesn't support the store type selected
      if (currentSelectedStore == null) {
        // just send user to the first store supported by this wallet
        stores.routing.replaceRoute({
          route: routeForStore(storesForWallet[0].name),
        });
      }
    }
  }
  componentWillUnmount() {
    this.props.stores.addresses.resetFilter();
  }

  render(): Node {
    const { stores } = this.props;
    const publicDeriver = stores.wallets.selected;
    if (publicDeriver == null) throw new Error(`${nameof(Receive)} no public deriver`);

    const storesForWallet = allAddressSubgroups
      .filter(store => store.isRelated())
      .map(store => {
        const request = stores.addresses.addressSubgroupMap.get(store.class);
        if (request == null) throw new Error('Should never happen');
        return {
          meta: store,
          request,
        };
      })
      .filter(storeInfo => !storeInfo.meta.isHidden({ result: storeInfo.request.all }))
      .map(storeInfo => ({
        isActiveStore: stores.routing.currentRoute.startsWith(
          routeForStore(storeInfo.meta.name)
        ),
        setAsActiveStore: () =>
          stores.routing.goToRoute({
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
          setFilter={filter => stores.addresses.setFilter(filter)}
          activeFilter={stores.addresses.addressFilter}
        >
          {this.props.children}
        </ReceiveWithNavigation>
      </Box>
    );
  }
}
