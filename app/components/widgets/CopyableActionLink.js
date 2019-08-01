// @flow
import { observer } from 'mobx-react';
import React, { Component } from 'react';
import type { Node } from 'react';
import SvgInline from 'react-svg-inline';
import CopyToClipboard from 'react-copy-to-clipboard';
import iconCopy from '../../assets/images/copy.inline.svg';
import iconCopied from '../../assets/images/copied.inline.svg';
import styles from './CopyableActionLink.scss';

type Props = {
  children: Node,
  hash: string,
  elementId?: string,
  onCopyAddress?: Function,
  getNotification: Function,
};

@observer
export default class CopyableActionLink extends Component<Props> {
  static defaultProps = {
    onCopyAddress: undefined,
    elementId: undefined,
  };

  render() {
    const { hash, elementId, onCopyAddress, getNotification } = this.props;
    const notification = getNotification;

    const actionLinkComponent = (
      <div>
        <span>
          <SvgInline
            svg={notification && notification.id === elementId ? iconCopied : iconCopy}
            className={styles.copyIconBig}
          />
        </span>
        <span>
          {this.props.children}
        </span>
      </div>
    );

    return (
      <div className={styles.component}>
        <CopyToClipboard
          text={hash}
          onCopy={onCopyAddress}
        >
          {actionLinkComponent}
        </CopyToClipboard>
      </div>
    );
  }
}
