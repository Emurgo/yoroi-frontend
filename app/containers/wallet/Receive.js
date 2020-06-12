// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { computed } from 'mobx';
import { observer } from 'mobx-react';
import { intlShape, defineMessages } from 'react-intl';
import type {
  $npm$ReactIntl$IntlFormat,
} from 'react-intl';
import type { InjectedOrGenerated } from '../../types/injectedPropsType';
import ReceiveWithNavigation from '../../components/wallet/layouts/ReceiveWithNavigation';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver/index';
import type { AddressTypeName } from '../../stores/toplevel/AddressesStore';
import type { AddressFilterKind } from '../../types/AddressFilterTypes';
import environment from '../../environment';
import { ROUTES } from '../../routes-config';
import { buildRoute } from '../../utils/routing';

export type GeneratedData = typeof Receive.prototype.generated;

type Props = {|
  ...InjectedOrGenerated<GeneratedData>,
  +children?: Node
|};

const messages = defineMessages({
  baseLabel: {
    id: 'wallet.receive.navigation.baseLabel',
    defaultMessage: '!!!Base'
  },
  groupLabel: {
    id: 'wallet.receive.navigation.groupLabel',
    defaultMessage: '!!!Group'
  },
  byronLabel: {
    id: 'wallet.receive.navigation.byronLabel',
    defaultMessage: '!!!Byron'
  },
});

@observer
export default class Receive extends Component<Props> {

  static defaultProps: {|children: void|} = {
    children: undefined,
  };
  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  componentWillUnmount() {
    this.generated.actions.addresses.resetFilter.trigger();
  }

  getCategoryTitle: void => string = () => {
    const { intl } = this.context;

    if (environment.isShelley()) {
      return intl.formatMessage(messages.groupLabel);
    }
    // eslint-disable-next-line no-constant-condition
    if (false) { // TODO: fix condition during Haskell Shelley integration
      return intl.formatMessage(messages.baseLabel);
    }
    return intl.formatMessage(messages.byronLabel);
  }

  render(): Node {
    const publicDeriver = this.generated.stores.wallets.selected;
    if (publicDeriver == null) throw new Error(`${nameof(Receive)} no public deriver`);
    const { addresses, app } = this.generated.stores;
    const { actions } = this.generated;

    const addressBookRoute = buildRoute(
      ROUTES.WALLETS.RECEIVE.ADDRESS_BOOK,
      {
        id: publicDeriver.getPublicDeriverId(),
      }
    );
    return (
      <ReceiveWithNavigation
        addressTypes={addresses.getStoresForWallet(publicDeriver)}
        setFilter={filter => this.generated.actions.addresses.setFilter.trigger(filter)}
        activeFilter={this.generated.stores.addresses.addressFilter}
        categoryTitle={this.getCategoryTitle()}
        goAddressBook={() => actions.router.goToRoute.trigger({ route: addressBookRoute })}
        isAddressBookRoute={this.generated.stores.app.currentRoute === addressBookRoute}
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
            const functionalitySubset: Array<{|
              +isActiveStore: boolean,
              +isHidden: boolean,
              +setAsActiveStore: void => void,
              +name: AddressTypeName,
            |}> = addressStores.map(addressStore => ({
              isHidden: addressStore.isHidden,
              isActiveStore: addressStore.isActiveStore,
              setAsActiveStore: () => addressStore.setAsActiveStore(publicDeriver),
              name: addressStore.name,
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
