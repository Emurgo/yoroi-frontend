// @flow
import React, { Component } from 'react';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import { intlShape, defineMessages } from 'react-intl';
import QRCode from 'qrcode.react';
import { buildURI } from '../../utils/URIHandling';
import Dialog from '../widgets/Dialog';
import DialogBackButton from '../widgets/DialogBackButton';
import DialogCloseButton from '../widgets/DialogCloseButton';
import WarningBox from '../widgets/WarningBox';
import CopyableAddress from '../widgets/CopyableAddress';

import styles from './URIDisplayDialog.scss';

const messages = defineMessages({
  uriDisplayDialogTitle: {
    id: 'uri.display.dialog.title',
    defaultMessage: '!!!Generated URL',
  },
  uriDisplayDialogCopyNotification: {
    id: 'uri.display.dialog.copy.notification',
    defaultMessage: '!!!URL successfully copied',
  },
  usabilityWarning: {
    id: 'uri.display.dialog.usabilityWarning',
    defaultMessage: 'This link can only be opened by users with Yoroi installed on their browser',
  }
});

type Props = {
  onClose: void => void,
  classicTheme: boolean,
  getNotification: Function,
  onCopyAddressTooltip: Function,
  onBack: void => void,
  address: string,
  amount: number,
};

@observer
export default class URIDisplayDialog extends Component<Props> {

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const {
      onClose,
      onBack,
      classicTheme,
      getNotification,
      onCopyAddressTooltip,
      address,
      amount,
    } = this.props;

    const { intl } = this.context;

    const uri = buildURI(address, amount);
    const uriNotificationId = 'uri-copyNotification';

    // Get QRCode color value from active theme's CSS variable
    const qrCodeBackgroundColor = document.documentElement ?
      document.documentElement.style.getPropertyValue('--theme-receive-qr-code-background-color') : 'transparent';
    const qrCodeForegroundColor = document.documentElement ?
      document.documentElement.style.getPropertyValue('--theme-receive-qr-code-foreground-color') : '#000';

    const uriUsabilityWarning = (
      <WarningBox>
        {intl.formatMessage(messages.usabilityWarning)}
      </WarningBox>
    );

    return (
      <Dialog
        title={intl.formatMessage(messages.uriDisplayDialogTitle)}
        className={classnames([styles.component, 'URIDisplayDialog'])}
        closeOnOverlayClick={false}
        closeButton={<DialogCloseButton />}
        classicTheme={classicTheme}
        onClose={onClose}
        backButton={<DialogBackButton onBack={onBack} />}
      >
        {uriUsabilityWarning}
        <div className={styles.qrCode}>
          <QRCode
            value={uri}
            bgColor={qrCodeBackgroundColor}
            fgColor={qrCodeForegroundColor}
            size={152}
          />
        </div>
        <div className={styles.uriDisplay}>
          <CopyableAddress
            hash={uri}
            elementId={uriNotificationId}
            onCopyAddress={onCopyAddressTooltip.bind(this, uriNotificationId)}
            getNotification={getNotification}
            tooltipOpensUpward
          >
            <span className={styles.uri}>{uri}</span>
          </CopyableAddress>
        </div>
      </Dialog>

    );
  }

}
