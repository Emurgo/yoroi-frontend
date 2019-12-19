// @flow
import { observer } from 'mobx-react';
import React, { Component } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';

import IconCopy from '../../../assets/images/copy.inline.svg';
import styles from './WalletAddress.scss';

type Props = {|
  +hash: string,
|};

@observer
export default class WalletAddress extends Component<Props> {

  render() {
    const { hash } = this.props;

    return (
      <div className={styles.wrapper}>
        <div className={styles.hash}>{hash}</div>
        <CopyToClipboard text={hash}>
          <div className={styles.icon}>
            <IconCopy />
          </div>
        </CopyToClipboard>
      </div>
    );
  }
}
