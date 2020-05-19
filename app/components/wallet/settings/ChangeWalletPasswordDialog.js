// @flow
import type { Node } from 'react';
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { Input } from 'react-polymorph/lib/components/Input';
import { defineMessages, intlShape } from 'react-intl';
import ReactToolboxMobxForm from '../../../utils/ReactToolboxMobxForm';
import vjf from 'mobx-react-form/lib/validators/VJF';
import DialogCloseButton from '../../widgets/DialogCloseButton';
import Dialog from '../../widgets/Dialog';
import { isValidWalletPassword, isValidRepeatPassword } from '../../../utils/validations';
import globalMessages from '../../../i18n/global-messages';
import LocalizableError from '../../../i18n/LocalizableError';
import styles from './ChangeWalletPasswordDialog.scss';
import config from '../../../config';
import { InputOwnSkin } from '../../../themes/skins/InputOwnSkin';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

const messages = defineMessages({
  dialogTitleChangePassword: {
    id: 'wallet.settings.changePassword.dialog.title.changePassword',
    defaultMessage: '!!!Change spending password',
  },
  currentPasswordLabel: {
    id: 'wallet.settings.changePassword.dialog.currentPasswordLabel',
    defaultMessage: '!!!Current spending password',
  },
  currentPasswordFieldPlaceholder: {
    id: 'wallet.settings.changePassword.dialog.currentPasswordFieldPlaceholder',
    defaultMessage: '!!!Type current spending password',
  },
});

type Props = {|
  +dialogData: {|
    +currentPasswordValue: void | string,
    +newPasswordValue: void | string,
    +repeatedPasswordValue: void | string,
  |},
  +onSave: {| oldPassword: string, newPassword: string |} => PossiblyAsync<void>,
  +onCancel: void => void,
  +onDataChange: { [key: string]: any, ... } => void,
  +onPasswordSwitchToggle: void => void,
  +isSubmitting: boolean,
  +error: ?LocalizableError,
  +classicTheme: boolean,
|};

@observer
export default class ChangeWalletPasswordDialog extends Component<Props> {
  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  form: ReactToolboxMobxForm = new ReactToolboxMobxForm({
    fields: {
      currentPassword: {
        type: 'password',
        label: this.context.intl.formatMessage(messages.currentPasswordLabel),
        placeholder: this.props.classicTheme ?
          this.context.intl.formatMessage(messages.currentPasswordFieldPlaceholder) : '',
        value: this.props.dialogData.currentPasswordValue,
      },
      walletPassword: {
        type: 'password',
        label: this.context.intl.formatMessage(globalMessages.newPasswordLabel),
        placeholder: this.props.classicTheme ?
          this.context.intl.formatMessage(globalMessages.newPasswordFieldPlaceholder) : '',
        value: this.props.dialogData.newPasswordValue,
        validators: [({ field, form }) => {
          const repeatPasswordField = form.$('repeatPassword');
          if (repeatPasswordField.value.length > 0) {
            repeatPasswordField.validate({ showErrors: true });
          }
          return [
            isValidWalletPassword(field.value),
            this.context.intl.formatMessage(globalMessages.invalidWalletPassword)
          ];
        }],
      },
      repeatPassword: {
        type: 'password',
        label: this.context.intl.formatMessage(globalMessages.repeatPasswordLabel),
        placeholder: this.props.classicTheme ?
          this.context.intl.formatMessage(globalMessages.repeatPasswordFieldPlaceholder) : '',
        value: this.props.dialogData.repeatedPasswordValue,
        validators: [({ field, form }) => {
          const walletPassword = form.$('walletPassword').value;
          if (walletPassword.length === 0) return [true];
          return [
            isValidRepeatPassword(walletPassword, field.value),
            this.context.intl.formatMessage(globalMessages.invalidRepeatPassword)
          ];
        }],
      },
    }
  }, {
    options: {
      showErrorsOnInit: Object.keys(this.props.dialogData)
        .map(key => this.props.dialogData[key])
        .filter(val => val !== '' && val != null)
        .length > 0,
      validateOnChange: true,
      validationDebounceWait: config.forms.FORM_VALIDATION_DEBOUNCE_WAIT,
    },
    plugins: {
      vjf: vjf()
    },
  });

  submit: (() => void) = () => {
    this.form.submit({
      onSuccess: async (form) => {
        const { currentPassword, walletPassword } = form.values();
        const passwordData = {
          oldPassword: currentPassword || null,
          newPassword: walletPassword,
        };
        await this.props.onSave(passwordData);
      },
      onError: () => {},
    });
  };

  handleDataChange: ((key: string, value: string) => void) = (key, value) => {
    this.props.onDataChange({ [key]: value });
  };

  render(): Node {
    const { form } = this;
    const { intl } = this.context;
    const {
      onCancel,
      isSubmitting,
      dialogData,
      error,
      classicTheme,
    } = this.props;

    const dialogClasses = classnames(['changePasswordDialog', styles.dialog]);

    const walletPasswordFieldsClasses = classnames([
      styles.walletPasswordFields
    ]);

    const confirmButtonClasses = classnames([
      'confirmButton',
    ]);

    const newPasswordClasses = classnames([
      'newPassword',
      classicTheme ? styles.newPasswordClassic : '',
    ]);

    const currentPasswordField = form.$('currentPassword');
    const newPasswordField = form.$('walletPassword');
    const repeatedPasswordField = form.$('repeatPassword');

    const newPassword = newPasswordField.value;
    const repeatedPassword = repeatedPasswordField.value;

    const disabledCondition = isSubmitting || !(
      isValidWalletPassword(newPassword)
      && isValidRepeatPassword(newPassword, repeatedPassword)
    );

    const actions = [
      {
        label: intl.formatMessage(globalMessages.save),
        onClick: this.submit,
        primary: true,
        className: confirmButtonClasses,
        disabled: disabledCondition,
        isSubmitting: this.props.isSubmitting,
      },
    ];

    return (
      <Dialog
        title={intl.formatMessage(messages.dialogTitleChangePassword)}
        actions={actions}
        closeOnOverlayClick={false}
        onClose={onCancel}
        className={dialogClasses}
        closeButton={<DialogCloseButton onClose={onCancel} />}
      >

        <div className={styles.walletPassword}>
          <Input
            type="password"
            className="currentPassword"
            value={dialogData.currentPasswordValue}
            onChange={(value) => this.handleDataChange('currentPasswordValue', value)}
            {...currentPasswordField.bind()}
            error={currentPasswordField.error}
            skin={InputOwnSkin}
          />
        </div>

        <div className={walletPasswordFieldsClasses}>
          <Input
            type="password"
            className={newPasswordClasses}
            value={dialogData.newPasswordValue}
            onChange={(value) => this.handleDataChange('newPasswordValue', value)}
            {...newPasswordField.bind()}
            done={isValidWalletPassword(newPassword)}
            error={newPasswordField.error}
            skin={InputOwnSkin}
          />

          <Input
            type="password"
            className="repeatedPassword"
            value={dialogData.repeatedPasswordValue}
            onChange={(value) => this.handleDataChange('repeatedPasswordValue', value)}
            {...repeatedPasswordField.bind()}
            done={repeatedPassword && isValidRepeatPassword(newPassword, repeatedPassword)}
            error={repeatedPasswordField.error}
            skin={InputOwnSkin}
          />
        </div>

        {error ? <p className={styles.error}>{intl.formatMessage(error)}</p> : null}

      </Dialog>
    );
  }

}
