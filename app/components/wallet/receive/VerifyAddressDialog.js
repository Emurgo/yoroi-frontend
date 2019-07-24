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
import RawHash from '../../widgets/hashWrappers/RawHash';
import ExplorableHashContainer from '../../../containers/widgets/ExplorableHashContainer';
import type { ExplorerType } from '../../../domain/Explorer';

import LocalizableError from '../../../i18n/LocalizableError';
import styles from './VerifyAddressDialog.scss';

const messages = defineMessages({
  addressDetailsTitleLabel: {
    id: 'wallet.receive.confirmationDialog.addressDetailsTitleLabel',
    defaultMessage: '!!!Verify address',
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

type Props = {|
  isActionProcessing: boolean,
  error: ?LocalizableError,
  verify: Function,
  cancel: Function,
  selectedExplorer: ExplorerType,
  isHardware: boolean,
  walletAddress: string,
  walletPath: BIP32Path,
  classicTheme: boolean,
|};

@observer
export default class VerifyAddressDialog extends Component<Props> {

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const { intl } = this.context;
    const {
      isActionProcessing,
      error,
      verify,
      walletAddress,
      walletPath,
      cancel,
      isHardware,
      classicTheme,
    } = this.props;

    const dialogActions = !isHardware
      ? null
      : [{
        className: isActionProcessing ? styles.processing : null,
        label: intl.formatMessage(messages.verifyAddressButtonLabel),
        primary: true,
        disabled: isActionProcessing,
        onClick: verify,
      }];

    // TODO: This should be refactored somehow so it’s not duplicated in multiple files.
    // Get QRCode color value from active theme's CSS variable
    const qrCodeBackgroundColor = document.documentElement ?
      document.documentElement.style.getPropertyValue('--theme-receive-qr-code-background-color') : 'transparent';
    const qrCodeForegroundColor = document.documentElement ?
      document.documentElement.style.getPropertyValue('--theme-receive-qr-code-foreground-color') : '#000';

    const labelStyle = classicTheme ?
      'SimpleFormField_label FormFieldOverridesClassic_label VerifyAddressDialog_header' :
      'SimpleFormField_label FormFieldOverrides_label VerifyAddressDialog_header';

    const derivationClasses = classnames([styles.infoBlock, styles.derivation]);

    return (
      <Dialog
        className={classnames([styles.component, 'VerifyAddressDialog'])}
        title={intl.formatMessage(messages.addressDetailsTitleLabel)}
        actions={dialogActions}
        closeOnOverlayClick={false}
        closeButton={<DialogCloseButton />}
        onClose={cancel}
        classicTheme={classicTheme}
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
            <span className={labelStyle}>
              {intl.formatMessage(messages.addressLabel)}
            </span>
            <div className={styles.infoBlock}>
              <div className={styles.data}>
                <ExplorableHashContainer
                  light={false}
                  selectedExplorer={this.props.selectedExplorer}
                  hash={walletAddress}
                  linkType="address"
                >
                  <RawHash light>
                    {walletAddress}
                  </RawHash>
                </ExplorableHashContainer>
              </div>
            </div>
            <br />
            <span className={labelStyle}>
              {intl.formatMessage(messages.derivationPathLabel)}
            </span>
            <div className={derivationClasses}>
              <div className={styles.data}>
                {toDerivationPathString(walletPath)}
              </div>
            </div>
          </div>
        ) : null}
        { error ? (<ErrorBlock error={error} />) : null }
      </Dialog>);
  }
}
