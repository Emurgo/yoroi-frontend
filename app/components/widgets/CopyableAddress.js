// @flow
import { observer } from 'mobx-react';
import React, { Component } from 'react';
import type { Node } from 'react';
import SvgInline from 'react-svg-inline';
import CopyToClipboard from 'react-copy-to-clipboard';
import iconCopy from '../../assets/images/clipboard-ic.inline.svg';
import styles from './CopyableAddress.scss';

type Props = {|
  children: Node,
  hash: string,
  onCopyAddress?: Function,
|};

@observer
export default class CopyableAddress extends Component<Props> {

  static defaultProps = {
    onCopyAddress: undefined,
  };

  render() {
    const { hash, onCopyAddress } = this.props;

    return (
      <div className={styles.component}>
        <span>{this.props.children}</span>
        <CopyToClipboard
          text={hash}
          onCopy={onCopyAddress && onCopyAddress.bind(this, hash)}
        >
          <SvgInline svg={iconCopy} className={styles.copyIconBig} />
        </CopyToClipboard>
      </div>
    );
  }
}
