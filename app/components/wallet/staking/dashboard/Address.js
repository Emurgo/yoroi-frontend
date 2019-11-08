// @flow
import { observer } from 'mobx-react';
import React, { Component } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';

import IconCopy from '../../../../assets/images/copy.inline.svg';
import styles from './Address.scss';

type Props = {
  hash: string,
};

@observer
export default class Address extends Component<Props> {

  render() {
    const { hash } = this.props;

    const hashLength = hash.length;
    const truncatedHash = hash.substring(0, 6) + ' . . . ' + hash.substring(hashLength - 6, hashLength);

    return (
      <div className={styles.wrapper}>
        <div className={styles.hash}>{truncatedHash}</div>
        <CopyToClipboard text={hash}>
          <div className={styles.icon}>
            <IconCopy />
          </div>
        </CopyToClipboard>
      </div>
    );
  }
}
