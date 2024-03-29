// @flow
import { Component } from 'react';
import type { Element, Node } from 'react';
import { observer } from 'mobx-react';
import styles from './WalletRecoveryInstructions.scss';

type Props = {|
  +instructionsText: string | Element<any>,
|};

@observer
export default class WalletRecoveryInstructions extends Component<Props> {

  render(): Node {
    const { instructionsText } = this.props;
    return (
      <div className={styles.component}>
        {instructionsText}
      </div>
    );
  }

}
