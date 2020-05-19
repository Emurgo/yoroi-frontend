// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { computed } from 'mobx';
import { observer } from 'mobx-react';
import type { InjectedOrGenerated } from '../../types/injectedPropsType';
import ReceiveWithNavigation from '../../components/wallet/layouts/ReceiveWithNavigation';

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
        isActiveTab={(tab) => addresses.isActiveTab(
          tab,
          publicDeriver
        )}
        onTabClick={(page) => addresses.handleTabClick(
          page,
          publicDeriver
        )}
        showMangled={addresses.mangledAddressesForDisplay.hasAny}
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
              isActiveTab: stores.substores.ada.addresses.isActiveTab,
              handleTabClick: stores.substores.ada.addresses.handleTabClick,
              mangledAddressesForDisplay: {
                hasAny: stores.substores.ada.addresses.mangledAddressesForDisplay.hasAny,
              },
            },
          },
        },
      },
    });
  }
}
