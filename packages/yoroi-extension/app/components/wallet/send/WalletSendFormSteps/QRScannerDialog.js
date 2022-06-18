// @flow
import Dialog from '../../../widgets/Dialog';
import type { Node } from 'react'
import DialogCloseButton from '../../../widgets/DialogCloseButton';
import { Component } from 'react';
import Scanner from 'react-webcam-qr-scanner';
import { defineMessages, intlShape } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import styles from './QRScannerDialog.scss'
import WebcamIcon from '../../../../assets/images/webcam-picture-yoroi.inline.svg';
import { Typography } from '@mui/material';

const messages: Object = defineMessages({
  title: {
    id: 'wallet.send.form.qrDialog.title',
    defaultMessage: '!!!Scan QR code',
  },
  noDevices: {
    id: 'wallet.send.form.qrDialog.noDevices',
    defaultMessage: '!!!Webcam not found or permission is not given',
  }
});

type Props = {|
  onClose: void => void,
  onReadQR: string => void,
|}
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

  handleDecode: (result: {| data: string |}) => void = (result) => {
    this.props.onReadQR(result.data)
    this.props.onClose()
  }


  // eslint-disable-next-line camelcase
  UNSAFE_componentWillMount() {
    if(navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices().then((devices) => {
        let isEnabled = false
        devices.forEach(d => {
          if (d.kind === 'videoinput' && d.deviceId) {
            isEnabled = true
          }
        })

        if(!isEnabled) {
          throw new Error(this.context.intl.formatMessage(messages.noDevices))
        }


        return ''
      }).catch(err => {
        this.setState({ error: err.message })
      })
    }
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
          {error ? (
            <div className={styles.error}>
              <WebcamIcon />
              <Typography color='var(--yoroi-palette-gray-900)' variant='h4'>
                {error}
              </Typography>
            </div>
          ) : (
            <Scanner
              className={styles.scanner}
              onDecode={this.handleDecode}
              constraints={{
              audio: false,
                video: {
                  facingMode: 'environment'
                }
              }}
              captureSize={{ width: 300, height: 300 }}
            />
          )}
        </div>
      </Dialog>
    );
  }
}