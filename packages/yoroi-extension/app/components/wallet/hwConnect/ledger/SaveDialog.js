// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import classnames from 'classnames';
import TextField from '../../../common/TextField'

import globalMessages from '../../../../i18n/global-messages';
import LocalizableError from '../../../../i18n/LocalizableError';

import Dialog from '../../../widgets/Dialog';
import DialogCloseButton from '../../../widgets/DialogCloseButton';

import ProgressStepBlock from '../common/ProgressStepBlock';
import HelpLinkBlock from './HelpLinkBlock';
import HWErrorBlock from '../common/HWErrorBlock';

import { ReactComponent as InfoIconSVG }  from '../../../../assets/images/info-icon.inline.svg';

import { ReactComponent as SaveLoadImage }  from '../../../../assets/images/hardware-wallet/ledger/save-load-modern.inline.svg';
import { ReactComponent as SaveErrorImage }  from '../../../../assets/images/hardware-wallet/ledger/save-error-modern.inline.svg';

import { ReactComponent as SaveLoadSVG }  from '../../../../assets/images/hardware-wallet/ledger/save-load.inline.svg';
import { ReactComponent as SaveErrorSVG }  from '../../../../assets/images/hardware-wallet/ledger/save-error.inline.svg';

import ReactToolboxMobxForm from '../../../../utils/ReactToolboxMobxForm';
import vjf from 'mobx-react-form/lib/validators/VJF';
import { isValidWalletName } from '../../../../utils/validations';

import { ProgressInfo } from '../../../../types/HWConnectStoreTypes';
import { StepState } from '../../../widgets/ProgressSteps';

import { Logger } from '../../../../utils/logging';

import styles from '../common/SaveDialog.scss';
import headerMixin from '../../../mixins/HeaderBlock.scss';
import config from '../../../../config';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

const SaveStartSVG = SaveLoadSVG;

const messages = defineMessages({
  saveWalletNameInputBottomInfo: {
    id: 'wallet.connect.ledger.dialog.step.save.walletName.info',
    defaultMessage: '!!!We have fetched Ledger device’s name for you; you can use as it is or assign a different name.',
  },
});

type Props = {|
  +progressInfo: ProgressInfo,
  +error: ?LocalizableError,
  +isActionProcessing: boolean,
  +defaultWalletName: string,
  +onExternalLinkClick: MouseEvent => void,
  +submit: string => PossiblyAsync<void>,
  +cancel: void => void,
|};

@observer
export default class SaveDialog extends Component<Props> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired
  };

  form: ReactToolboxMobxForm;

  // eslint-disable-next-line camelcase
  UNSAFE_componentWillMount() {
    const { intl } = this.context;
    const { defaultWalletName } = this.props;

    this.form = new ReactToolboxMobxForm({
      fields: {
        walletName: {
          label: intl.formatMessage(globalMessages.hwConnectDialogSaveWalletNameInputLabel),
          placeholder: '',
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

  render(): Node {
    const { form } = this;
    const { intl } = this.context;

    const { walletName } = form.values();
    const {
      progressInfo,
      isActionProcessing,
      error,
      onExternalLinkClick,
      cancel,
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
            <InfoIconSVG width="20" height="20" />
          </div>
          <div className={styles.walletNameInfo}>
            {intl.formatMessage(messages.saveWalletNameInputBottomInfo)}
          </div>
        </div>
        <TextField
          className={walletNameFieldClasses}
          {...walletNameField.bind()}
          error={walletNameField.error}
          done={walletNameField.isValid}
        />
      </div>);

    let middleBlock = null;

    switch (progressInfo.stepState) {
      case StepState.LOAD:
        middleBlock = (
          <div className={classnames([styles.middleBlock, styles.middleSaveLoadBlock])}>
            <SaveLoadImage/>
          </div>);
        break;
      case StepState.PROCESS:
        middleBlock = (
          <div className={classnames([styles.middleBlock, styles.middleSaveStartProcessBlock])}>
            <SaveLoadImage/>
          </div>);
        break;
      case StepState.ERROR:
        middleBlock = (
          <div className={classnames([styles.middleBlock, styles.middleSaveErrorBlock])}>
            <SaveErrorImage/>
          </div>);
        break;
      default:
        Logger.error('ledger::ConnectDialog::render: something unexpected happened');
        break;
    }

    const disabledCondition = (
      isActionProcessing
      || !isValidWalletName(walletName)
    );

    const dialogActions = [{
      label: intl.formatMessage(globalMessages.hwConnectDialogSaveButtonLabel),
      primary: true,
      disabled: disabledCondition,
      isSubmitting: isActionProcessing,
      onClick: this.save
    }];

    return (
      <Dialog
        className={classnames([styles.component, 'SaveDialog'])}
        title={intl.formatMessage(globalMessages.ledgerConnectAllDialogTitle)}
        actions={dialogActions}
        closeOnOverlayClick={false}
        onClose={cancel}
        closeButton={<DialogCloseButton />}
      >
        <ProgressStepBlock progressInfo={progressInfo} />
        {walletNameBlock}
        {middleBlock}
        {error &&
          <HWErrorBlock progressInfo={progressInfo} error={error} />
        }
        <HelpLinkBlock onExternalLinkClick={onExternalLinkClick} />
      </Dialog>);
  }

  save: void => void = () => {
    this.form.submit({
      onSuccess: async (form) => {
        const { walletName } = form.values();
        await this.props.submit(walletName);
      }
    });
  }
}
