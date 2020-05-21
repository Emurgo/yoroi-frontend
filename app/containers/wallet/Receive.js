// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { computed } from 'mobx';
import { observer } from 'mobx-react';
import type { InjectedOrGenerated } from '../../types/injectedPropsType';
import ReceiveWithNavigation from '../../components/wallet/layouts/ReceiveWithNavigation';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver/index';
import type { AddressTypeName } from '../../stores/base/AddressesStore';

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

  render(): Node {
    const publicDeriver = this.generated.stores.wallets.selected;
    if (publicDeriver == null) throw new Error(`${nameof(Receive)} no public deriver`);
    const { addresses } = this.generated.stores.substores.ada;
    return (
      <ReceiveWithNavigation
        addressTypes={addresses.getStoresForWallet(publicDeriver)}
      >
        {this.props.children}
      </ReceiveWithNavigation>
    );
  }

  @computed get generated() {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(Receive)} no way to generated props`);
    }
    const { stores, } = this.props;
    return Object.freeze({
      stores: {
        wallets: {
          selected: stores.wallets.selected,
        },
        substores: {
          ada: {
            addresses: {
              getStoresForWallet: (publicDeriver: PublicDeriver<>) => {
                const substore = stores.substores.ada;
                const addressStores = substore.addresses.getStoresForWallet(publicDeriver);
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
        },
      },
    });
  }
}
