// @flow
import { observer } from 'mobx-react';
import React, { Component } from 'react';
import { defineMessages, intlShape } from 'react-intl';
import type { Node } from 'react';
import SvgInline from 'react-svg-inline';
import CopyToClipboard from 'react-copy-to-clipboard';
import iconCopy from '../../assets/images/copy.inline.svg';
import iconCopied from '../../assets/images/copied.inline.svg';
import styles from './CopyableAddress.scss';
import { Tooltip } from 'react-polymorph/lib/components/Tooltip';
import { TooltipSkin } from 'react-polymorph/lib/skins/simple/TooltipSkin';


const messages = defineMessages({
  copyTooltipMessage: {
    id: 'widgets.copyableaddress.addressCopyTooltipMessage',
    defaultMessage: '!!!Copy to clipboard',
  },
});

type Props = {
  children: Node,
  hash: string,
  elementId?: string,
  onCopyAddress?: Function,
  tooltipOpensUpward?: boolean,
  arrowRelativeToTip?: boolean,
  getNotification: Function,
};

@observer
export default class CopyableAddress extends Component<Props> {
  static contextTypes = {
    intl: intlShape.isRequired,
  };

  static defaultProps = {
    onCopyAddress: undefined,
    tooltipOpensUpward: false,
    arrowRelativeToTip: true,
    elementId: undefined,
  };

  render() {
    const { hash, elementId, onCopyAddress, getNotification } = this.props;
    const { intl } = this.context;
    const notification = getNotification;

    const tooltipComponent = (
      <Tooltip
        className={styles.SimpleTooltip}
        skin={TooltipSkin}
        isOpeningUpward={this.props.tooltipOpensUpward}
        arrowRelativeToTip={this.props.arrowRelativeToTip}
        tip={notification && notification.id === elementId
          ? intl.formatMessage(notification.message)
          : intl.formatMessage(messages.copyTooltipMessage)
        }
      >
        <SvgInline
          svg={notification && notification.id === elementId ? iconCopied : iconCopy}
          className={styles.copyIconBig}
        />
      </Tooltip>
    );

    return (
      <div className={styles.component}>
        <span>{this.props.children}</span>
        <CopyToClipboard
          text={hash}
          onCopy={onCopyAddress && onCopyAddress.bind(this, tooltipComponent)}
        >
          {tooltipComponent}
        </CopyToClipboard>
      </div>
    );
  }
}
