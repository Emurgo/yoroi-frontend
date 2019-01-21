// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import classnames from 'classnames';
import SvgInline from 'react-svg-inline';
import { Input } from 'react-polymorph/lib/components/Input';
import { InputSkin } from 'react-polymorph/lib/skins/simple/InputSkin';

import globalMessages from '../../../i18n/global-messages';
import LocalizableError from '../../../i18n/LocalizableError';

import Dialog from '../../widgets/Dialog';
import DialogCloseButton from '../../widgets/DialogCloseButton';

import ProgressStepBlock from './common/ProgressStepBlock';
import HelpLinkBlock from './common/HelpLinkBlock';
import TrezorErrorBlock from './common/TrezorErrorBlock';

import saveLoadGIF from '../../../assets/images/trezor/connect/save-load.inline.svg';
import saveStartSVG from '../../../assets/images/trezor/connect/save-start.inline.svg';
import saveErrorSVG from '../../../assets/images/trezor/connect/save-error.inline.svg';

import ReactToolboxMobxForm from '../../../utils/ReactToolboxMobxForm';
import { isValidWalletName } from '../../../utils/validations';

import type { ProgressInfo } from '../../../stores/ada/TrezorConnectStore';
import { StepState } from '../../../stores/ada/TrezorConnectStore';

import { Logger } from '../../../utils/logging';

import styles from './SaveDialog.scss';

const messages = defineMessages({
  saveWalletNameInputLabel: {
    id: 'wallet.trezor.dialog.step.save.walletName.label',
    defaultMessage: '!!!Wallet name',
    description: 'Label for the wallet name input on the Connect to Trezor Hardware Wallet dialog.'
  },
  saveWalletNameInputPlaceholder: {
    id: 'wallet.trezor.dialog.step.save.walletName.hint',
    defaultMessage: '!!!Enter wallet name',
    description: 'Placeholder "Enter wallet name" for the wallet name input on the wallet restore dialog.'
  },
  saveWalletNameInputBottomInfo: {
    id: 'wallet.trezor.dialog.step.save.walletName.info',
    defaultMessage: '!!!We have fetched Trezor device’s name for you; you can use as it is or assign a different name.',
    description: 'Hint for the wallet name input on the wallet restore dialog.'
  },
  saveButtonLabel: {
    id: 'wallet.trezor.dialog.save.button.label',
    defaultMessage: '!!!Save',
    description: 'Label for the "Save" button on the Connect to Trezor Hardware Wallet dialog.'
  },
});

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

  form: typeof ReactToolboxMobxForm;

  componentWillMount() {
    const { intl } = this.context;
    const { defaultWalletName } = this.props;

    this.form = new ReactToolboxMobxForm({
      fields: {
        walletName: {
          label: intl.formatMessage(messages.saveWalletNameInputLabel),
          placeholder: intl.formatMessage(messages.saveWalletNameInputPlaceholder),
          value: defaultWalletName,
          validators: [({ field }) => (
            [
              isValidWalletName(field.value),
              intl.formatMessage(globalMessages.invalidWalletName)
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
    const { progressInfo, isActionProcessing, error, cancel } = this.props;

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
          skin={InputSkin}
        />
        <span>{intl.formatMessage(messages.saveWalletNameInputBottomInfo)}</span>
      </div>);

    let middleBlock = null;

    switch (progressInfo.stepState) {
      case StepState.LOAD:
        middleBlock = (
          <div className={classnames([styles.middleBlock, styles.middleSaveLoadBlock])}>
            <SvgInline svg={saveLoadGIF} cleanup={['title']} />
          </div>);
        break;
      case StepState.PROCESS:
        middleBlock = (
          <div className={classnames([styles.middleBlock, styles.middleSaveStartProcessBlock])}>
            <SvgInline svg={saveStartSVG} cleanup={['title']} />
          </div>);
        break;
      case StepState.ERROR:
        middleBlock = (
          <div className={classnames([styles.middleBlock, styles.middleSaveErrorBlock])}>
            <SvgInline svg={saveErrorSVG} cleanup={['title']} />
          </div>);
        break;
      default:
        Logger.error('trezorConnect::ConnectDialog::render: something unexpected happened');
        break;
    }

    const dailogActions = [{
      className: isActionProcessing ? styles.processing : null,
      label: intl.formatMessage(messages.saveButtonLabel),
      primary: true,
      disabled: isActionProcessing,
      onClick: this.save
    }];

    return (
      <Dialog
        className={classnames([styles.component, 'SaveDialog'])}
        title={intl.formatMessage(globalMessages.trezorConnectAllDialogTitle)}
        actions={dailogActions}
        closeOnOverlayClick={false}
        onClose={cancel}
        closeButton={<DialogCloseButton />}
      >
        <ProgressStepBlock progressInfo={progressInfo} />
        {walletNameBlock}
        {middleBlock}
        <HelpLinkBlock progressInfo={progressInfo} />
        <TrezorErrorBlock progressInfo={progressInfo} error={error} />
      </Dialog>);
  }

  save = async () => {
    this.form.submit({
      onSuccess: async (form) => {
        const { walletName } = form.values();
        this.props.submit(walletName);
      }
    });
  }
}
