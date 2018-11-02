// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { defineMessages, intlShape } from 'react-intl';
import TrezorConnect, { DEVICE, DEVICE_EVENT, UI_EVENT, TRANSPORT_EVENT } from 'trezor-connect';

import DialogCloseButton from '../widgets/DialogCloseButton';
import Dialog from '../widgets/Dialog';
import globalMessages from '../../i18n/global-messages';
import LocalizableError from '../../i18n/LocalizableError';
import styles from './WalletTrezorDialog.scss';

const messages = defineMessages({
  title: {
    id: 'wallet.trezor.dialog.title.label',
    defaultMessage: '!!!Connect to Trezor',
    description: 'Label "Connect to Trezor" on the Connect to Trezor dialog.'
  },
  connectButtonLabel: {
    id: 'wallet.trezor.dialog.trezor.connect.button.label',
    defaultMessage: '!!!Connect',
    description: 'Label for the "Connect" button on the wallet restore dialog.'
  }
});

messages.fieldIsRequired = globalMessages.fieldIsRequired;

type Props = {
  onSubmit: Function,
  onCancel: Function,
  isSubmitting: boolean,
  mnemonicValidator: Function,
  error?: ?LocalizableError,
  suggestedMnemonics: Array<string>,
};

@observer
export default class WalletTrezorDialog extends Component<Props> {
  /**
   *
   * @param {*} props
   */
  constructor(props: Props) {
    super(props);
    // FIXME : remove if not used
    // UI_EVENT listener
    TrezorConnect.on(UI_EVENT, (event) => {
      console.log(`Trezor ${UI_EVENT} : ` + JSON.stringify(event, null, ' '));
    });
    // FIXME : remove if not used
    // TRANSPORT_EVENT listener
    TrezorConnect.on(TRANSPORT_EVENT, (event) => {
      console.log(`Trezor ${TRANSPORT_EVENT} : ` + JSON.stringify(event, null, ' '));
    });
    // DEVICE_EVENT listener
    TrezorConnect.on(DEVICE_EVENT, (event) => {
      console.log(`Trezor ${DEVICE_EVENT} : ` + JSON.stringify(event, null, ' '));
      if (event.type === DEVICE.CONNECT || event.type === DEVICE.CHANGED) {
        this.deviceEvent = event;
      }
    });
  }

  static contextTypes = {
    intl: intlShape.isRequired
  };

  // Trezor device event object
  // FIXME : Change it from any -> DeviceMessage type
  deviceEvent : any;

  // FIXME : Change it from any -> proper type
  checkTrezorResultValidity = (publicKeyInfo: any): boolean => {
    let valid = false;

    // FIXME : fetch 'device-connect' | 'device-changed' from trezor-connect
    if ((this.deviceEvent.type === DEVICE.CONNECT || this.deviceEvent.type === DEVICE.CHANGED) &&
    publicKeyInfo.success &&
    publicKeyInfo.payload.publicKey) {
      valid = true;
    }

    return valid;
  }

  submit = async () => {
    try {
      // FIXME : remove if not used
      // const features: any = await TrezorConnect.getFeatures({keepSession:true});
      // console.log(`Trezor getFeatures : ` + JSON.stringify(features, null, ' '));

      // const state: any = await TrezorConnect.getDeviceState({keepSession:true});
      // console.log(`Trezor getDeviceState : ` + JSON.stringify(state, null, ' '));

      // FIXME : find better place to store constants
      // FIXME : Change it from any -> proper type
      const publicKeyInfo: any = await TrezorConnect.cardanoGetPublicKey({ path: 'm/44\'/1815\'/0\'' });
      console.log('Trezor cardanoGetPublicKey : ' + JSON.stringify(publicKeyInfo, null, ' '));
      if (this.checkTrezorResultValidity(publicKeyInfo)) {
        // FIXME : get wallet name from form data
        const walletName = 'TREZOR WALLET';
        const walletData = {
          publicMasterKey: publicKeyInfo.payload.publicKey,
          walletName,
          deviceFeatures: this.deviceEvent.payload.features,
        };
        this.props.onSubmit(walletData);
      }
    } catch (error) {
      // FIXME: proper error handling
      console.log('TrezorConnectError : ' + JSON.stringify(error, null, ''));
    }
  }

  render() {
    const { intl } = this.context;
    const { isSubmitting, error, onCancel } = this.props;

    const dialogClasses = classnames([styles.component, 'WalletRestoreDialog']);

    const actions = [
      {
        className: isSubmitting ? styles.isSubmitting : null,
        label: intl.formatMessage(messages.connectButtonLabel),
        primary: true,
        disabled: isSubmitting,
        onClick: this.submit
      }
    ];

    return (
      <Dialog
        className={dialogClasses}
        title={intl.formatMessage(messages.title)}
        actions={actions}
        closeOnOverlayClick
        onClose={onCancel}
        closeButton={<DialogCloseButton />}
      >
        {error && <p className={styles.error}>{intl.formatMessage(error)}</p>}
      </Dialog>
    );
  }
}
