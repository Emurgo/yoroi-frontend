// @flow
import React, { Component } from 'react';
import PropTypes from 'prop-types'; 
import { observer, inject } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import classnames from 'classnames';
import SvgInline from 'react-svg-inline';
import Input from 'react-polymorph/lib/components/Input';
import SimpleInputSkin from 'react-polymorph/lib/skins/simple/raw/InputSkin';

import globalMessages from '../../../i18n/global-messages';
import LocalizableError from '../../../i18n/LocalizableError';

import Dialog from '../../widgets/Dialog';
import DialogCloseButton from '../../widgets/DialogCloseButton';

import ProgressStepBlock from './common/ProgressStepBlock';
import HelpLinkBlock from './common/HelpLinkBlock';
import ErrorBlock from './common/ErrorBlock';

import externalLinkSVG from '../../../assets/images/link-external.inline.svg';
import saveLoadGIF from '../../../assets/images/trezor/save-load.inline.svg';
import saveStartSVG from '../../../assets/images/trezor/save-start.inline.svg';
import saveErrorSVG from '../../../assets/images/trezor/save-error.inline.svg';

import ReactToolboxMobxForm from '../../../utils/ReactToolboxMobxForm';
import { isValidHardwareWalletName } from '../../../utils/validations';

import type { ProgressInfo, StepState } from '../../../stores/ada/TrezorConnectStore'
import { StepStateOption } from '../../../stores/ada/TrezorConnectStore'

import styles from './SaveDialog.scss';

const messages = defineMessages({
  title: {
    id: 'wallet.trezor.dialog.title.label',
    defaultMessage: '!!!Connect to Trezor Hardware Wallet',
    description: 'Label "Connect to Trezor Hardware Wallet" on the Connect to Trezor Hardware Wallet dialog.'
  },
  saveWalletNameInputLabel: {
    id: 'wallet.trezor.dialog.trezor.step.save.walletName.label',
    defaultMessage: '!!!Wallet name',
    description: 'Label for the wallet name input on the Connect to Trezor Hardware Wallet dialog.'
  },
  saveWalletNameInputPlaceholder: {
    id: 'wallet.restore.dialog.wallet.name.input.hint',
    defaultMessage: '!!!Enter wallet name',
    description: 'Placeholder "Enter wallet name" for the wallet name input on the wallet restore dialog.'
  },
  saveWalletNameInputBottomInfo: {
    id: 'wallet.trezor.dialog.trezor.step.save.walletName.info',
    defaultMessage: '!!!We have fetched Trezor device’s name for you; you can use as it is or assign a different name.',
    description: 'Hint for the wallet name input on the wallet restore dialog.'
  },
  saveButtonLabel: {
    id: 'wallet.trezor.dialog.trezor.save.button.label',
    defaultMessage: '!!!Save',
    description: 'Label for the "Save" button on the Connect to Trezor Hardware Wallet dialog.'
  },  
  saveError101: {
    id: 'wallet.trezor.dialog.trezor.step.save.error.101',
    defaultMessage: '!!!Falied to save. Please check your Internet connection and retry.',
    description: '<Falied to save. Please check your Internet connection and retry.> on the Connect to Trezor Hardware Wallet dialog.'
  },  
});

messages.fieldIsRequired = globalMessages.fieldIsRequired;

type Props = {
  progressInfo: ProgressInfo,
  error: ?LocalizableError,
  isActionProcessing: boolean,
  defaultWalletName: string,
  submit: Function,
  cancel: Function,
};

@observer
export default class SaveDialog extends Component<Props> {

  static contextTypes = {
    intl: intlShape.isRequired
  };

  // form for wallet name
  form: typeof ReactToolboxMobxForm;

  componentWillMount() {
    const { intl } = this.context;

    this.form = new ReactToolboxMobxForm({
      fields: {
        walletName: {
          label: intl.formatMessage(messages.saveWalletNameInputLabel),
          placeholder: intl.formatMessage(messages.saveWalletNameInputPlaceholder),
          value: this.props.defaultWalletName,
          validators: [({ field }) => (
            [
              isValidHardwareWalletName(field.value),
              intl.formatMessage(globalMessages.invalidHardwareWalletName)
            ]
          )],
        },
      },
    }, {
      options: {
        validateOnChange: true,
        validationDebounceWait: 250,
      },
    });
  }

  render() {
    const { intl } = this.context;
    
    // walletNameBlock
    const walletNameFieldClasses = classnames([
      'walletName',
      styles.walletName,
    ]);
    const walletNameField = this.form.$('walletName');

    const walletNameBlock = (
      <div className={classnames([styles.headerBlock, styles.headerSaveBlock])}>
        <Input
          className={walletNameFieldClasses}
          {...walletNameField.bind()}
          error={walletNameField.error}
          skin={<SimpleInputSkin />}
        />
        <span>{intl.formatMessage(messages.saveWalletNameInputBottomInfo)}</span>
      </div>);
    
    // middleBlock selection depending upon state
    let middleBlock = null;
    
    switch(this.props.progressInfo.stepState) {
      case StepStateOption.LOAD:
        middleBlock = (
          <div className={classnames([styles.middleBlock, styles.middleSaveLoadBlock])}>
            <SvgInline svg={saveLoadGIF} cleanup={['title']} />
          </div>);
        break;
      case StepStateOption.PROCESS:
        // START
        middleBlock = (
          <div className={classnames([styles.middleBlock, styles.middleSaveStartProcessBlock])}>
            <SvgInline svg={saveStartSVG} cleanup={['title']} />
          </div>);        
        break;
      case StepStateOption.ERROR:
        middleBlock = (
          <div className={classnames([styles.middleBlock, styles.middleSaveErrorBlock])}>
            <SvgInline svg={saveErrorSVG} cleanup={['title']} />
          </div>);        
        break;
      default:
        console.error('Error : something unexpected happened');
        break;
    }

    const dailogActions = [{
      className: this.props.isActionProcessing ? styles.processing : null,
      label: intl.formatMessage(messages.saveButtonLabel),
      primary: true,
      disabled: this.props.isActionProcessing,
      onClick: this.save
    }];

    return (
      <Dialog
        className={classnames([styles.component, 'SaveDialog'])}
        title={intl.formatMessage(messages.title)}
        actions={dailogActions}
        closeOnOverlayClick={false}
        onClose={this.props.cancel}
        closeButton={<DialogCloseButton />}
      >
        <ProgressStepBlock progressInfo={this.props.progressInfo} />
        {walletNameBlock}
        {middleBlock}
        <HelpLinkBlock progressInfo={this.props.progressInfo} />
        <ErrorBlock progressInfo={this.props.progressInfo} error={this.props.error} />
      </Dialog>);
  }

  save = async () => {
    this.form.submit({
      onSuccess: async (form) => {
        const { walletName } = form.values();
        this.props.submit(walletName);
      },
      onError: () => {},
    });
  }  
}
