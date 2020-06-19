// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import ReceiveNavigation from '../navigation/ReceiveNavigation';
import styles from './ReceiveWithNavigation.scss';
import type { AddressTypeName, AddressGroupName, AddressFilterKind } from '../../../types/AddressFilterTypes';

export type Props = {|
  +children?: Node,
  +setFilter: AddressFilterKind => void,
  +activeFilter: AddressFilterKind,
  +addressTypes: Array<{|
    +isActiveStore: boolean,
    +isHidden: boolean,
    +setAsActiveStore: void => void,
    +name: AddressTypeName,
    +groupName: AddressGroupName,
  |}>;
  +categoryTitle: string,
  +goAddressBook: void => void,
  +isAddressBookRoute: boolean
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
            addressTypes={this.props.addressTypes}
            setFilter={this.props.setFilter}
            activeFilter={this.props.activeFilter}
            categoryTitle={this.props.categoryTitle}
            goAddressBook={this.props.goAddressBook}
            isAddressBookRoute={this.props.isAddressBookRoute}
          />
        </div>
        <div className={styles.page}>
          {this.props.children}
        </div>
      </div>
    );
  }
}
