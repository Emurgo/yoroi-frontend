// @flow

/* eslint react/jsx-one-expression-per-line: 0 */  // the &nbsp; in the html breaks this

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { defineMessages, intlShape } from 'react-intl';
import QRCode from 'qrcode.react';
import type {
  BIP32Path
} from '@cardano-foundation/ledgerjs-hw-app-cardano';
import {
  toDerivationPathString,
} from 'yoroi-extension-ledger-bridge';

import Dialog from '../../widgets/Dialog';
import DialogCloseButton from '../../widgets/DialogCloseButton';
import ErrorBlock from '../../widgets/ErrorBlock';

import LocalizableError from '../../../i18n/LocalizableError';
import styles from './AddressDetailsDialog.scss';

const messages = defineMessages({
  addressDetailsTitleLabel: {
    id: 'wallet.receive.confirmationDialog.addressDetailsTitleLabel',
    defaultMessage: '!!!Address details',
  },
  verifyAddressButtonLabel: {
    id: 'wallet.receive.confirmationDialog.verifyAddressButtonLabel',
    defaultMessage: '!!!Verify on hardware wallet',
  },
  addressLabel: {
    id: 'wallet.receive.confirmationDialog.addressLabel',
    defaultMessage: '!!!Address',
  },
  derivationPathLabel: {
    id: 'wallet.receive.confirmationDialog.derivationPathLabel',
    defaultMessage: '!!!Derivation Path',
  },
});

type Props = {
  error: ?LocalizableError,
  verify: Function,
  cancel: Function,
  isHardware: boolean,
  walletAddress: string,
  walletPath: BIP32Path,
};

@observer
export default class AddressDetailsDialog extends Component<Props> {

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const { intl } = this.context;
    const {
      error,
      verify,
      walletAddress,
      walletPath,
      cancel,
      isHardware
    } = this.props;

    const dialogActions = !isHardware
      ? []
      : [{
        // TODO: add spinner while calling hardware wallet?
        className: null,
        label: intl.formatMessage(messages.verifyAddressButtonLabel),
        primary: true,
        onClick: verify,
      }];

    // TODO: This should be refactored somehow so it’s not duplicated in multiple files.
    // Get QRCode color value from active theme's CSS variable
    const qrCodeBackgroundColor = document.documentElement ?
      document.documentElement.style.getPropertyValue('--theme-receive-qr-code-background-color') : 'transparent';
    const qrCodeForegroundColor = document.documentElement ?
      document.documentElement.style.getPropertyValue('--theme-receive-qr-code-foreground-color') : '#000';

    return (
      <Dialog
        className={classnames([styles.component, 'AddressDetailsDialog'])}
        title={intl.formatMessage(messages.addressDetailsTitleLabel)}
        actions={dialogActions}
        closeOnOverlayClick={false}
        closeButton={<DialogCloseButton />}
        onClose={cancel}
      >
        {walletAddress ? (
          <div>
            <div align="center">
              <QRCode
                value={walletAddress}
                bgColor={qrCodeBackgroundColor}
                fgColor={qrCodeForegroundColor}
                size={152}
              />
            </div>
            <br />
            <br />
            <span className="SimpleFormField_label FormFieldOverrides_label">
              {intl.formatMessage(messages.addressLabel)}
            </span>
            <div className={styles.infoBlock}>
              <p>{walletAddress}</p>
            </div>
            <br />
            <span className="SimpleFormField_label FormFieldOverrides_label">
              {intl.formatMessage(messages.derivationPathLabel)}
            </span>
            <div className={styles.infoBlock}>
              <p>{toDerivationPathString(walletPath)}</p>
            </div>
          </div>
        ) : null}
        <ErrorBlock error={error} />
      </Dialog>);
  }
}
