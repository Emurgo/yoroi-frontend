// @flow
import { observer } from 'mobx-react';
import { Component } from 'react';
import classnames from 'classnames';
import { defineMessages, intlShape } from 'react-intl';
import type { Node } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import { ReactComponent as IconCopy } from '../../assets/images/copy.inline.svg';
import { ReactComponent as IconCopied } from '../../assets/images/copied.inline.svg';
import styles from './CopyableAddress.scss';
import { Box, Tooltip, Typography } from '@mui/material';
import type { Notification } from '../../types/notification.types';
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
  +sx?: Object,
  id: string,
|};

@observer
export default class CopyableAddress extends Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  static defaultProps: {|
    darkVariant: boolean,
    elementId: void,
    onCopyAddress: void,
    sx: Object,
    placementTooltip: string,
  |} = {
    onCopyAddress: undefined,
    placementTooltip: 'bottom',
    elementId: undefined,
    sx: {},
    darkVariant: false,
  };

  render(): Node {
    const { hash, elementId, sx, onCopyAddress, notification, darkVariant, id } = this.props;
    const { intl } = this.context;

    const Icon = notification && notification.id === elementId ? IconCopied : IconCopy;
    const tooltipComponent = (
      <Tooltip
        title={
          <Typography component="div" variant="body3">
            {notification && notification.id === elementId
              ? intl.formatMessage(notification.message)
              : intl.formatMessage(copyableMessages.copyTooltipMessage)}
          </Typography>
        }
        placement={this.props.placementTooltip}
      >
        <span className={styles.copyIconBig} id={id + '-copyAddress-button'}>
          <Icon />
        </span>
      </Tooltip>
    );

    return (
      <Box
        sx={sx}
        className={classnames([styles.component, darkVariant === true && styles.componentDark])}
        id={id + '-copyableAddress-box'}
      >
        <span id={id + '-address-text'}>{this.props.children}</span>
        <CopyToClipboard
          text={hash}
          onCopy={onCopyAddress == null ? undefined : (_text, _result) => onCopyAddress()}
        >
          {tooltipComponent}
        </CopyToClipboard>
      </Box>
    );
  }
}
