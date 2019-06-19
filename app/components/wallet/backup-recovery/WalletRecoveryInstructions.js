// @flow
import React, { Component } from 'react';
import type { Element } from 'react';
import { observer } from 'mobx-react';
import styles from './WalletRecoveryInstructions.scss';

type Props = {|
  instructionsText: string | Element<any>,
  classicTheme: boolean
|};

@observer
export default class WalletRecoveryInstructions extends Component<Props> {

  render() {
    const { instructionsText, classicTheme } = this.props;
    return (
      <div className={classicTheme ? styles.componentClassic : styles.component}>
        {instructionsText}
      </div>
    );
  }

}
