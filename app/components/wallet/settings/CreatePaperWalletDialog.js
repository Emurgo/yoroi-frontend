// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { Input } from 'react-polymorph/lib/components/Input';
import { InputSkin } from 'react-polymorph/lib/skins/simple/InputSkin';
import { defineMessages, intlShape } from 'react-intl';
import ReactToolboxMobxForm from '../../../utils/ReactToolboxMobxForm';
import DialogCloseButton from '../../widgets/DialogCloseButton';
import Dialog from '../../widgets/Dialog';
import {isValidWalletPassword, isValidRepeatPassword, isValidPaperPassword} from '../../../utils/validations';
import globalMessages from '../../../i18n/global-messages';
import LocalizableError from '../../../i18n/LocalizableError';
import styles from './CreatePaperWalletDialog.scss';
import config from '../../../config';

const messages = defineMessages({
  dialogTitleCreatePaperWallet: {
    id: 'settings.paperWallet.dialog.title',
    defaultMessage: '!!!Create Paper Wallet',
  },
  paperPasswordLabel: {
    id: 'settings.paperWallet.dialog.paperPasswordLabel',
    defaultMessage: '!!!Paper wallet password',
  },
  repeatPasswordLabel: {
    id: 'settings.paperWallet.dialog.repeatPasswordLabel',
    defaultMessage: '!!!Repeat paper wallet password',
  },
  paperPasswordPlaceholder: {
    id: 'settings.paperWallet.dialog.paperPasswordPlaceholder',
    defaultMessage: '!!!Type paper wallet password',
  },
  repeatPasswordPlaceholder: {
    id: 'settings.paperWallet.dialog.repeatPasswordPlaceholder',
    defaultMessage: '!!!Type paper wallet password again',
  },
});

type Props = {
  numAddresses: number,
  isCustomPassword: boolean,
  passwordValue: string,
  repeatedPasswordValue: string,
  onSave: Function,
  onCancel: Function,
  onDataChange: Function,
  isSubmitting: boolean,
  error: ?LocalizableError,
};

@observer
export default class CreatePaperWalletDialog extends Component<Props> {
  static contextTypes = {
    intl: intlShape.isRequired,
  };

  form = new ReactToolboxMobxForm({
    fields: {
      paperPassword: {
        type: 'password',
        label: this.context.intl.formatMessage(messages.paperPasswordLabel),
        placeholder: this.context.intl.formatMessage(messages.paperPasswordPlaceholder),
        value: '',
        validators: [({ field, form }) => {
          const repeatPasswordField = form.$('repeatPassword');
          if (repeatPasswordField.value.length > 0) {
            repeatPasswordField.validate({ showErrors: true });
          }
          return [
            isValidPaperPassword(field.value),
            this.context.intl.formatMessage(globalMessages.invalidPaperPassword)
          ];
        }],
      },
      repeatPassword: {
        type: 'password',
        label: this.context.intl.formatMessage(messages.repeatPasswordLabel),
        placeholder: this.context.intl.formatMessage(messages.repeatPasswordPlaceholder),
        value: '',
        validators: [({ field, form }) => {
          const paperPassword = form.$('paperPassword').value;
          if (paperPassword.length === 0) return [true];
          return [
            isValidRepeatPassword(paperPassword, field.value),
            this.context.intl.formatMessage(globalMessages.invalidRepeatPassword)
          ];
        }],
      },
    }
  }, {
    options: {
      validateOnChange: true,
      validationDebounceWait: config.forms.FORM_VALIDATION_DEBOUNCE_WAIT,
    },
  });

  submit = () => {
    this.form.submit({
      onSuccess: (form) => {
        const { paperPassword } = form.values();
        this.props.onSave({ passwordValue: paperPassword });
      },
      onError: () => {},
    });
  };

  handleDataChange = (key: string, value: string) => {
    this.props.onDataChange({ [key]: value });
  };

  render() {
    const { form } = this;
    const { intl } = this.context;
    const {
      onCancel,
      numAddresses,
      isCustomPassword,
      passwordValue,
      repeatedPasswordValue,
      isSubmitting,
      error,
    } = this.props;

    const dialogClasses = classnames(['changePasswordDialog', styles.dialog]);
    const confirmButtonClasses = classnames([
      'confirmButton',
      isSubmitting ? styles.isSubmitting : null,
    ]);
    const paperPasswordClasses = classnames([
      'newPassword',
      styles.newPassword,
    ]);

    const actions = [
      {
        label: intl.formatMessage(globalMessages.save),
        onClick: this.submit,
        primary: true,
        className: confirmButtonClasses,
      },
    ];

    const paperPasswordField = form.$('paperPassword');
    const repeatedPasswordField = form.$('repeatPassword');

    return (
      <Dialog
        title={intl.formatMessage(messages.dialogTitleCreatePaperWallet)}
        actions={actions}
        closeOnOverlayClick
        onClose={!isSubmitting ? onCancel : null}
        className={dialogClasses}
        closeButton={<DialogCloseButton onClose={onCancel} />}
      >

        <div className={paperPasswordClasses}>
          <Input
            type="password"
            className={paperPasswordClasses}
            value={passwordValue}
            onChange={(value) => this.handleDataChange('passwordValue', value)}
            {...paperPasswordField.bind()}
            error={paperPasswordField.error}
            skin={InputSkin}
          />

          <Input
            type="password"
            className="repeatedPassword"
            value={repeatedPasswordValue}
            onChange={(value) => this.handleDataChange('repeatedPasswordValue', value)}
            {...repeatedPasswordField.bind()}
            error={repeatedPasswordField.error}
            skin={InputSkin}
          />

          <p className={styles.passwordInstructions}>
            {intl.formatMessage(globalMessages.passwordInstructions)}
          </p>
        </div>

        {error ? <p className={styles.error}>{intl.formatMessage(error)}</p> : null}

      </Dialog>
    );
  }

}
