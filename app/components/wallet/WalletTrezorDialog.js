// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { defineMessages } from 'react-intl';
import DialogCloseButton from '../widgets/DialogCloseButton';
import Dialog from '../widgets/Dialog';
import TrezorConnect from 'trezor-connect';
// import globalMessages from '../../i18n/global-messages';
import LocalizableError from '../../i18n/LocalizableError';
import styles from './WalletTrezorDialog.scss';

const messages = defineMessages({
  title: {
    id: 'wallet.trezor.dialog.title.label',
    defaultMessage: '!!!Waiting for Trezor',
    description: 'Label "Waiting for Trezor" on the wallet connect trezor dialog.'
  },
});

type Props = {
  onCancel: Function,
  isConnecting: boolean,
  error?: ?LocalizableError,
};

@observer
export default class WalletTrezorDialog extends Component<Props> {

  componentDidMount() {
    TrezorConnect.requestLogin({ 
      challengeHidden: '0123456789abcdef',
      challengeVisual: 'Login to',
    }).then(result => {
      console.log('result: ', result);
      return result;
    }).catch(err => {
      console.log('error: ', err);
    });
  }

  render() {
    const { intl } = this.context;
    const { error, onCancel } = this.props;

    const dialogClasses = classnames([
      styles.component,
      // 'WalletTrezorDialog',
    ]);

    return (
      <Dialog
        className={dialogClasses}
        // title={intl.formatMessage(messages.title)}
        closeOnOverlayClick
        onClose={onCancel}
        closeButton={<DialogCloseButton />}
      >
      {/* Add message related to isConnecting or something */}
      {error && <p className={styles.error}>{intl.formatMessage(error)}</p>}
      </Dialog>
    );
  }
}
