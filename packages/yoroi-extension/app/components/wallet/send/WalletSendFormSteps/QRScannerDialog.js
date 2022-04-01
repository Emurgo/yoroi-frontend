// @flow
import Dialog from '../../../widgets/Dialog';
import DialogCloseButton from '../../../widgets/DialogCloseButton';
import { Component } from 'react';
import Scanner from 'react-webcam-qr-scanner';
import { defineMessages, intlShape } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import styles from './QRScannerDialog.scss'
import { isValidReceiveAddress } from '../../../../api/ada/lib/storage/bridge/utils';

const messages: Object = defineMessages({
  title: {
    id: 'wallet.send.form.qrDialog.title',
    defaultMessage: '!!!Scan QR code',
  }
});

type Props = {||}
type State = {|
  error: string,
|}

export default class QrScanner extends Component<Props, State> {
  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  state: State = {
    error: ''
  }

  handleDecode = (result) => {
    console.log(result)
    this.props.onUpdate(result.data)
    this.props.onClose()
  }

  handleScannerLoad = (mode) => {
    console.log({mode})
  }

  render(): Node {
    const { intl } = this.context;
    const { onClose } = this.props;
    const { error } = this.state

    return (
      <Dialog
        title={intl.formatMessage(messages.title)}
        closeOnOverlayClick={false}
        className={styles.dialog}
        onClose={onClose}
        closeButton={<DialogCloseButton />}
      >
        <div className={styles.component}>
          <p className={styles.error}>{error}</p>
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