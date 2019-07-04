// @flow
import React, { Component } from 'react';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import SvgInline from 'react-svg-inline';
import CopyToClipboard from 'react-copy-to-clipboard';
import { intlShape, defineMessages } from 'react-intl';
import type { MessageDescriptor } from 'react-intl';
import QRCode from 'qrcode.react';
import { buildURI } from '../../utils/URIHandling';

import Dialog from '../widgets/Dialog';
import DialogBackButton from '../widgets/DialogBackButton';
import DialogCloseButton from '../widgets/DialogCloseButton';
import NotificationMessage from '../widgets/NotificationMessage';
import iconCopy from '../../assets/images/clipboard-ic.inline.svg';
import successIcon from '../../assets/images/success-small.inline.svg';
import WarningBox from '../widgets/WarningBox';

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
  showNotification: boolean,
  onCopy: MessageDescriptor => void,
  onBack: void => void,
  address: string,
  amount: number,
};

type State = {
  copiedURI: string,
};


@observer
export default class URIDisplayDialog extends Component<Props, State> {

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  state = {
    copiedURI: '',
  };

  saveUriToState = (uri: string): void => {
    this.setState({ copiedURI: uri });
  };

  render() {
    const {
      onClose,
      onBack,
      classicTheme,
      showNotification,
      onCopy,
      address,
      amount,
    } = this.props;

    const uri = buildURI(address, amount);
    const { copiedURI } = this.state;

    const { intl } = this.context;

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

    const message = intl.formatMessage(messages.uriDisplayDialogCopyNotification);
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

        <NotificationMessage
          icon={successIcon}
          show={!!copiedURI && showNotification}
        >
          {message}
        </NotificationMessage>
        <div className={styles.qrCode}>
          <QRCode
            value={uri}
            bgColor={qrCodeBackgroundColor}
            fgColor={qrCodeForegroundColor}
            size={152}
          />
        </div>
        <div className={styles.uriDisplay}>
          <span className={styles.uri}>{uri}</span>
          <CopyToClipboard
            text={uri}
            onCopy={(uriText) => {
              this.saveUriToState(uriText);
              onCopy(message);
            }}
          >
            <span>
              <SvgInline svg={iconCopy} className={styles.copyIcon} />
            </span>
          </CopyToClipboard>
        </div>
      </Dialog>

    );
  }

}
