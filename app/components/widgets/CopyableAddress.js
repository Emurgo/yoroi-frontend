// @flow
import { observer } from 'mobx-react';
import React, { Component } from 'react';
import classnames from 'classnames';
import { defineMessages, intlShape } from 'react-intl';
import type { Node } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import IconCopy from '../../assets/images/copy.inline.svg';
import IconCopied from '../../assets/images/copied.inline.svg';
import styles from './CopyableAddress.scss';
import { Tooltip } from 'react-polymorph/lib/components/Tooltip';
import { TooltipSkin } from 'react-polymorph/lib/skins/simple/TooltipSkin';
import type { Notification } from '../../types/notificationType';

const messages = defineMessages({
  copyTooltipMessage: {
    id: 'widgets.copyableaddress.addressCopyTooltipMessage',
    defaultMessage: '!!!Copy to clipboard',
  },
});

type Props = {
  +children: Node,
  +hash: string,
  +elementId?: string,
  +onCopyAddress?: void => void,
  +tooltipOpensUpward?: boolean,
  +arrowRelativeToTip?: boolean,
  +notification: ?Notification,
  +darkVariant?: boolean,
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
    darkVariant: false
  };

  render() {
    const { hash, elementId, onCopyAddress, notification, darkVariant } = this.props;
    const { intl } = this.context;

    const Icon = notification && notification.id === elementId
      ? IconCopied
      : IconCopy;
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

        <span className={styles.copyIconBig}><Icon /></span>
      </Tooltip>
    );

    return (
      <div
        className={classnames([
          styles.component,
          darkVariant === true && styles.componentDark
        ])}
      >
        <span>{this.props.children}</span>
        <CopyToClipboard
          text={hash}
          onCopy={onCopyAddress == null
            ? undefined
            : (_text, _result) => onCopyAddress()
          }
        >
          {tooltipComponent}
        </CopyToClipboard>
      </div>
    );
  }
}
