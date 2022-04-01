// @flow
import Dialog from '../../../widgets/Dialog';
import DialogCloseButton from '../../../widgets/DialogCloseButton';
import { Component } from 'react';
import Scanner from 'react-webcam-qr-scanner';
import { defineMessages, intlShape } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import styles from './QRScannerDialog.scss'

const messages: Object = defineMessages({
  title: {
    id: 'wallet.send.form.qrDialog.title',
    defaultMessage: '!!!Scan QR code',
  }
});

type Props = {||}

export default class QrScanner extends Component<Props> {
  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  handleDecode = (result) => {
    console.log(result);
  }

  handleScannerLoad = (mode) => {
    console.log({mode});
  }

  render(): Node {
    const { intl } = this.context;
    const { onClose } = this.props

    return (
      <Dialog
        title={intl.formatMessage(messages.title)}
        closeOnOverlayClick={false}
        className={styles.dialog}
        onClose={onClose}
        closeButton={<DialogCloseButton />}
      >
        <div className={styles.component}>
          <Scanner
            className={styles.scanner}
            onDecode={this.handleDecode}
            onScannerLoad={this.handleScannerLoad}
            constraints={{
              audio: false,
              video: {
                facingMode: 'environment'
              }
            }}
            captureSize={{ width: 300, height: 300 }}
          />
        </div>
      </Dialog>
    );
  }
}