// @flow
import { observer } from 'mobx-react';
import React, { Component } from 'react';
import classnames from 'classnames';
import SvgInline from 'react-svg-inline';
import CopyToClipboard from 'react-copy-to-clipboard';
import iconCopy from '../../assets/images/clipboard-ic.inline.svg';
import styles from './CopyableAddress.scss';

type Props = {
  address: string,
  isUsed?: boolean,
  onCopyAddress?: Function,
};

@observer
export default class CopyableAddress extends Component<Props> {

  static defaultProps = {
    onCopyAddress: undefined,
    isUsed: false,
  };

  render() {
    const { address, onCopyAddress, isUsed } = this.props;

    const walletAddressClasses = classnames([
      styles.hash,
      isUsed ? styles.usedWalletAddress : null,
    ]);

    return (
      <div className={styles.component}>
        <div className={walletAddressClasses}>
          <span>{address}</span>
          <CopyToClipboard
            text={address}
            onCopy={onCopyAddress && onCopyAddress.bind(this, address)}
          >
            <SvgInline svg={iconCopy} className={styles.copyIconBig} />
          </CopyToClipboard>
        </div>
      </div>
    );
  }
}
