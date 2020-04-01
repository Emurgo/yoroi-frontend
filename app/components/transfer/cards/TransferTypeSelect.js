// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';

import TransferCards from './TransferCards';
import styles from './TransferTypeSelect.scss';

type Props = {|
  +onByron: void => void,
|};

@observer
export default class TransferTypeSelect extends Component<Props> {
  render() {

    return (
      <div className={styles.component}>
        <div className={styles.hero}>
          <div className={styles.heroInner}>
            <div className={styles.heroRight}>
              <TransferCards
                onByron={this.props.onByron}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
