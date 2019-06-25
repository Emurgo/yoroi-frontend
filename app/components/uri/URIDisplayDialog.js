// @flow
import React, { Component } from 'react';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import SvgInline from 'react-svg-inline';
import CopyToClipboard from 'react-copy-to-clipboard';
import { intlShape, defineMessages } from 'react-intl';
import QRCode from 'qrcode.react';

import Dialog from '../widgets/Dialog';
import DialogCloseButton from '../widgets/DialogCloseButton';
import NotificationMessage from '../widgets/NotificationMessage';
import iconCopy from '../../assets/images/clipboard-ic.inline.svg';
import successIcon from '../../assets/images/success-small.inline.svg';

import styles from './URIDisplayDialog.scss';

const messages = defineMessages({
  uriDisplayDialogTitle: {
    id: 'uri.display.dialog.title',
    defaultMessage: '!!!Generated URL',
  },
  uriDisplayDialogCopyNotification: {
    id: 'uri.display.dialog.copy.notification',
    defaultMessage: '!!!URL successfully copied',
  }
});

type Props = {
  onClose: void => void,
  classicTheme: boolean,
  uri: string,
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

  onCopy = (uri: string): void => {
    this.setState({ copiedURI: uri });
  };

  render() {
    const {
      onClose,
      classicTheme,
      uri
    } = this.props;

    const { copiedURI } = this.state;

    const { intl } = this.context;

    // Get QRCode color value from active theme's CSS variable
    const qrCodeBackgroundColor = document.documentElement ?
      document.documentElement.style.getPropertyValue('--theme-receive-qr-code-background-color') : 'transparent';
    const qrCodeForegroundColor = document.documentElement ?
      document.documentElement.style.getPropertyValue('--theme-receive-qr-code-foreground-color') : '#000';


    return (
      <Dialog
        title={intl.formatMessage(messages.uriDisplayDialogTitle)}
        className={classnames([styles.component, 'URIDisplayDialog'])}
        closeOnOverlayClick={false}
        closeButton={<DialogCloseButton />}
        classicTheme={classicTheme}
        onClose={onClose}
      >
        <NotificationMessage
          icon={successIcon}
          show={!!copiedURI}
        >
          {intl.formatMessage(messages.uriDisplayDialogCopyNotification)}
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
          <span className={styles.test}>
            <CopyToClipboard
              text={uri}
              onCopy={this.onCopy}
            >
              <span>
                <SvgInline svg={iconCopy} className={styles.copyIcon} />
              </span>
            </CopyToClipboard>
          </span>
        </div>
      </Dialog>

    );
  }

}
