// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import ReceiveNavigation from '../navigation/ReceiveNavigation';
import styles from './ReceiveWithNavigation.scss';
import type { AddressTypeName, AddressFilterKind } from '../../../types/AddressFilterTypes';

export type Props = {|
  +children?: Node,
  +setFilter: AddressFilterKind => void,
  +activeFilter: AddressFilterKind,
  +addressStores: $ReadOnlyArray<{
    +isActiveStore: boolean,
    +setAsActiveStore: void => void,
    +name: AddressTypeName,
    +validFilters: $ReadOnlyArray<AddressFilterKind>,
    +wasExecuted: boolean,
    ...,
  }>;
|};

@observer
export default class ReceiveWithNavigation extends Component<Props> {
  static defaultProps: {|children: void|} = {
    children: undefined
  };

  render(): Node {
    return (
      <div className={styles.component}>
        <div className={styles.navigation}>
          <ReceiveNavigation
            addressStores={this.props.addressStores}
            setFilter={this.props.setFilter}
            activeFilter={this.props.activeFilter}
          />
        </div>
        <div className={styles.page}>
          {this.props.children}
        </div>
      </div>
    );
  }
}
