// @flow
import { observer } from 'mobx-react';
import React, { Component } from 'react';
import { defineMessages, intlShape, FormattedHTMLMessage } from 'react-intl';
import type { Node } from 'react';
import type { Notification } from '../../types/notificationType';
import type { InjectedProps } from '../../types/injectedPropsType';
import SvgInline from 'react-svg-inline';
import CopyToClipboard from 'react-copy-to-clipboard';
import iconCopy from '../../assets/images/clipboard-ic.inline.svg';
import styles from './CopyableAddress.scss';
import { Tooltip } from 'react-polymorph/lib/components/Tooltip';
import { TooltipSkin } from 'react-polymorph/lib/skins/simple/TooltipSkin';
import type { StoresMap } from '../../stores/index';

const messages = defineMessages({
  copyTooltipMessage: {
    id: 'wallet.receive.page.addressCopyTooltipMessage',
    defaultMessage: '!!!Copy to clipboard',
  },
});

type Props = {
  children: Node,
  hash: string,
  onCopyAddress?: Function,
  tooltipOpensUpward?: boolean,
  arrowRelativeToTip?: boolean,
  showNotification: Function,
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
  };

  render() {
    const { hash, onCopyAddress, showNotification } = this.props;
    const { intl } = this.context;
    const notification = showNotification;

    const tooltipComponent = (
      <Tooltip
        className={styles.SimpleTooltip}
        skin={TooltipSkin}
        isOpeningUpward={this.props.tooltipOpensUpward}
        arrowRelativeToTip={this.props.arrowRelativeToTip}
        tip={ !notification
          ? intl.formatMessage(messages.copyTooltipMessage)
          : intl.formatMessage(notification.message)
        }
      >
        <SvgInline svg={iconCopy} className={styles.copyIconBig} />
      </Tooltip>
    )

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
