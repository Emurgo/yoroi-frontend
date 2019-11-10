// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import classnames from 'classnames';
import SvgInline from 'react-svg-inline';
import { Input } from 'react-polymorph/lib/components/Input';
import { InputOwnSkin } from '../../../../themes/skins/InputOwnSkin';

import globalMessages from '../../../../i18n/global-messages';
import LocalizableError from '../../../../i18n/LocalizableError';

import Dialog from '../../../widgets/Dialog';
import DialogCloseButton from '../../../widgets/DialogCloseButton';

import ProgressStepBlock from '../common/ProgressStepBlock';
import HelpLinkBlock from './HelpLinkBlock';
import HWErrorBlock from '../common/HWErrorBlock';

import infoIconSVG from '../../../../assets/images/hardware-wallet/info-icon.inline.svg';

import saveLoadImage from '../../../../assets/images/hardware-wallet/trezor/save-load-modern.inline.svg';
import saveErrorImage from '../../../../assets/images/hardware-wallet/trezor/save-error-modern.inline.svg';

import saveLoadSVG from '../../../../assets/images/hardware-wallet/trezor/save-load.inline.svg';
import saveErrorSVG from '../../../../assets/images/hardware-wallet/trezor/save-error.inline.svg';

import ReactToolboxMobxForm from '../../../../utils/ReactToolboxMobxForm';
import vjf from 'mobx-react-form/lib/validators/VJF';
import { isValidWalletName } from '../../../../utils/validations';

import { ProgressInfo } from '../../../../types/HWConnectStoreTypes';
import { StepState } from '../../../widgets/ProgressSteps';

import { Logger } from '../../../../utils/logging';

import styles from '../common/SaveDialog.scss';
import headerMixin from '../../../mixins/HeaderBlock.scss';
import config from '../../../../config';

const saveStartSVG = saveLoadSVG;

const messages = defineMessages({
  saveWalletNameInputBottomInfo: {
    id: 'wallet.connect.trezor.dialog.step.save.walletName.info',
    defaultMessage: '!!!We have fetched Trezor device’s name for you; you can use as it is or assign a different name.',
  },
});

type Props = {|
  progressInfo: ProgressInfo,
  error: ?LocalizableError,
  isActionProcessing: boolean,
  defaultWalletName: string,
  onExternalLinkClick: Function,
  submit: Function,
  cancel: Function,
  classicTheme: boolean
|};

@observer
export default class SaveDialog extends Component<Props> {
  static contextTypes = {
    intl: intlShape.isRequired
  };

  form: typeof ReactToolboxMobxForm;

  // eslint-disable-next-line camelcase
  UNSAFE_componentWillMount() {
    const { intl } = this.context;
    const { defaultWalletName } = this.props;

    this.form = new ReactToolboxMobxForm({
      fields: {
        walletName: {
          label: intl.formatMessage(globalMessages.hwConnectDialogSaveWalletNameInputLabel),
          placeholder: this.props.classicTheme ?
            intl.formatMessage(globalMessages.hwConnectDialogSaveWalletNameInputPH) : '',
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
        validationDebounceWait: config.forms.FORM_VALIDATION_DEBOUNCE_WAIT,
      },
      plugins: {
        vjf: vjf()
      },
    });
  }

  render() {
    const { form } = this;
    const { intl } = this.context;

    const { walletName } = form.values();
    const {
      progressInfo,
      isActionProcessing,
      error,
      onExternalLinkClick,
      cancel,
      classicTheme
    } = this.props;

    const walletNameFieldClasses = classnames([
      'walletName',
      styles.walletName,
    ]);
    const walletNameField = this.form.$('walletName');

    const walletNameBlock = (
      <div className={classnames([headerMixin.headerBlock, styles.headerSaveBlock])}>
        <div className={styles.walletNameInfoWrapper}>
          <div className={styles.walletNameInfoIcon}>
            <SvgInline svg={infoIconSVG} width="20" height="20" />
          </div>
          <div className={styles.walletNameInfo}>
            {intl.formatMessage(messages.saveWalletNameInputBottomInfo)}
          </div>
        </div>
        <Input
          className={walletNameFieldClasses}
          {...walletNameField.bind()}
          error={walletNameField.error}
          skin={InputOwnSkin}
          done={isValidWalletName(walletName)}
        />
      </div>);

    let middleBlock = null;

    switch (progressInfo.stepState) {
      case StepState.LOAD:
        middleBlock = (
          <div className={classnames([styles.middleBlock, styles.middleSaveLoadBlock])}>
            <SvgInline svg={classicTheme ? saveLoadSVG : saveLoadImage} />
          </div>);
        break;
      case StepState.PROCESS:
        middleBlock = (
          <div className={classnames([styles.middleBlock, styles.middleSaveStartProcessBlock])}>
            <SvgInline svg={classicTheme ? saveStartSVG : saveLoadImage} />
          </div>);
        break;
      case StepState.ERROR:
        middleBlock = (
          <div className={classnames([styles.middleBlock, styles.middleSaveErrorBlock])}>
            <SvgInline svg={classicTheme ? saveErrorSVG : saveErrorImage} />
          </div>);
        break;
      default:
        Logger.error('trezorConnect::ConnectDialog::render: something unexpected happened');
        break;
    }

    const disabledCondition = (
      isActionProcessing
      || !isValidWalletName(walletName)
    );

    const dialogActions = [{
      className: isActionProcessing ? styles.processing : null,
      label: intl.formatMessage(globalMessages.hwConnectDialogSaveButtonLabel),
      primary: true,
      disabled: disabledCondition,
      onClick: this.save
    }];

    return (
      <Dialog
        className={classnames([styles.component, 'SaveDialog'])}
        title={intl.formatMessage(globalMessages.trezorConnectAllDialogTitle)}
        actions={dialogActions}
        closeOnOverlayClick={false}
        onClose={cancel}
        closeButton={<DialogCloseButton />}
        classicTheme={classicTheme}
      >
        <ProgressStepBlock progressInfo={progressInfo} classicTheme={classicTheme} />
        {walletNameBlock}
        {middleBlock}
        {error &&
          <HWErrorBlock progressInfo={progressInfo} error={error} classicTheme={classicTheme} />
        }
        <HelpLinkBlock onExternalLinkClick={onExternalLinkClick} />
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
