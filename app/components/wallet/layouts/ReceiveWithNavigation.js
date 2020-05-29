// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import ReceiveNavigation from '../navigation/ReceiveNavigation';
import styles from './ReceiveWithNavigation.scss';
import type { AddressTypeName } from '../../../stores/toplevel/AddressesStore';

export type Props = {|
  +children?: Node,
  +addressTypes: Array<{|
    +isActiveStore: boolean,
    +isHidden: boolean,
    +setAsActiveStore: void => void,
    +name: AddressTypeName,
  |}>;
|};

@observer
export default class ReceiveWithNavigation extends Component<Props> {
  static defaultProps: {|children: void|} = {
    children: undefined
  };

  render(): Node {
    const { children, addressTypes } = this.props;
    return (
      <div className={styles.component}>
        <div className={styles.navigation}>
          <ReceiveNavigation
            addressTypes={addressTypes}
          />
        </div>
        <div className={styles.page}>
          {children}
        </div>
      </div>
    );
  }
}
