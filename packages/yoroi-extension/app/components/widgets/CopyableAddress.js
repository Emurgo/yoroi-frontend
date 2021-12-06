// @flow
import { observer } from 'mobx-react';
import { Component } from 'react';
import classnames from 'classnames';
import { defineMessages, intlShape } from 'react-intl';
import type { Node } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import IconCopy from '../../assets/images/copy.inline.svg';
import IconCopied from '../../assets/images/copied.inline.svg';
import styles from './CopyableAddress.scss';
import { Tooltip, Typography } from '@mui/material';
import type { Notification } from '../../types/notificationType';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

export const copyableMessages: Object = defineMessages({
  copyTooltipMessage: {
    id: 'widgets.copyableaddress.addressCopyTooltipMessage',
    defaultMessage: '!!!Copy to clipboard',
  },
  copied: {
    id: 'widgets.copyableaddress.copied',
    defaultMessage: '!!!Copied',
  },
});

type Props = {|
  +children: Node,
  +hash: string,
  +elementId?: string,
  +onCopyAddress?: void => void,
  +placementTooltip?: string,
  +notification: ?Notification,
  +darkVariant?: boolean,
|};

@observer
export default class CopyableAddress extends Component<Props> {
  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  static defaultProps: {|
    darkVariant: boolean,
    elementId: void,
    onCopyAddress: void,
    placementTooltip: string,
  |} = {
    onCopyAddress: undefined,
    placementTooltip: 'bottom',
    elementId: undefined,
    darkVariant: false
  };

  render(): Node {
    const { hash, elementId, onCopyAddress, notification, darkVariant } = this.props;
    const { intl } = this.context;

    const Icon = notification && notification.id === elementId
      ? IconCopied
      : IconCopy;
    const tooltipComponent = (
      <Tooltip
        title={
          <Typography variant="body3">
            {notification && notification.id === elementId
              ? intl.formatMessage(notification.message)
              : intl.formatMessage(copyableMessages.copyTooltipMessage)}
          </Typography>
        }
        placement={this.props.placementTooltip}
      >
        <span className={styles.copyIconBig}>
          <Icon />
        </span>
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
