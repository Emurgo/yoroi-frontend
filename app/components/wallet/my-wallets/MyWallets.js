// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';

import styles from './MyWallets.scss';

type Props = {|
    wallets: Array<Object>,
|};

@observer
export default class MyWallets extends Component<Props> {

  render() {
    return (
      <div className={styles.page}>
          MY_WALLETS_PAGE
      </div>
    );
  }
}
