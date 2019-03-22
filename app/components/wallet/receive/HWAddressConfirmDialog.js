// @flow

/* eslint react/jsx-one-expression-per-line: 0 */  // the &nbsp; in the html breaks this

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { defineMessages, intlShape } from 'react-intl';
import QRCode from 'qrcode.react';

import Dialog from '../../widgets/Dialog';
import DialogCloseButton from '../../widgets/DialogCloseButton';
import ErrorBlock from '../../widgets/ErrorBlock';

import LocalizableError from '../../../i18n/LocalizableError';
import styles from './HWAddressConfirmDialog.scss';

const messages = defineMessages({
  verifyAddressTitleLabel: {
    id: 'wallet.receive.confirmationDialog.verifyAddressTitleLabel',
    defaultMessage: '!!!Verify Address.',
  },
  verifyAddressLabel: {
    id: 'wallet.receive.confirmationDialog.verifyAddressLabel',
    defaultMessage: '!!!Verify that the following address match with the one displayed in your hardware device.',
  },
  dismissDialogLabel: {
    id: 'wallet.receive.confirmationDialog.dismissDialogLabel',
    defaultMessage: '!!!OK',
  },
});

type Props = {
  error: ?LocalizableError,
  submit: Function,
  cancel: Function,
  walletAddress: ?string,
  walletDerivedPath: ?any,
};

@observer
export default class HWAddressConfirmDialog extends Component<Props> {

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const { intl } = this.context;
    const {
      error,
      submit,
      walletAddress,
      walletDerivedPath,
      cancel
    } = this.props;

    const dialogActions = [{
      className: null,
      label: intl.formatMessage(messages.dismissDialogLabel),
      primary: true,
      onClick: submit,
    }];

    // TODO: This should be refactored somehow so it’s not duplicated in multiple files.
    // Get QRCode color value from active theme's CSS variable
    const qrCodeBackgroundColor = document.documentElement ?
      document.documentElement.style.getPropertyValue('--theme-receive-qr-code-background-color') : 'transparent';
    const qrCodeForegroundColor = document.documentElement ?
      document.documentElement.style.getPropertyValue('--theme-receive-qr-code-foreground-color') : '#000';

    return (
      <Dialog
        className={classnames([styles.component, 'HWAddressConfirmDialog'])}
        title={intl.formatMessage(messages.verifyAddressTitleLabel)}
        actions={dialogActions}
        closeOnOverlayClick={false}
        closeButton={<DialogCloseButton />}
        onClose={cancel}
      >
        {walletAddress ? (
          <div>
            <div className={styles.qrCode}>
              <QRCode
                value={walletAddress}
                bgColor={qrCodeBackgroundColor}
                fgColor={qrCodeForegroundColor}
                size={152}
              />
            </div>
            <div className={styles.infoBlock}>
              <span>{intl.formatMessage(messages.verifyAddressLabel)}</span>
            </div>
            <div className={styles.infoBlock}>
              <span>{walletAddress}</span>
            </div>
          </div>
        ) : null}
        <ErrorBlock error={error} />
      </Dialog>);
  }
}
