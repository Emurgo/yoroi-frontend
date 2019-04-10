// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { Input } from 'react-polymorph/lib/components/Input';
import { InputSkin } from 'react-polymorph/lib/skins/simple/InputSkin';
import { defineMessages, intlShape } from 'react-intl';
import ReactToolboxMobxForm from '../../../../utils/ReactToolboxMobxForm';
import DialogCloseButton from '../../../widgets/DialogCloseButton';
import Dialog from '../../../widgets/Dialog';
import { isValidRepeatPassword, isValidPaperPassword } from '../../../../utils/validations';
import globalMessages from '../../../../i18n/global-messages';
import styles from './UserPasswordDialog.scss';
import config from '../../../../config';

const messages = defineMessages({
  dialogTitleUserPaperPassword: {
    id: 'settings.paperWallet.dialog.userPassword.title',
    defaultMessage: '!!!Set custom paper wallet password',
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
  paperPasswordIntroLine1: {
    id: 'settings.paperWallet.dialog.password.intro.line1',
    defaultMessage: '!!!You have selected a password-protected type of paper wallet.',
  },
  paperPasswordIntroLine2: {
    id: 'settings.paperWallet.dialog.password.intro.line2',
    defaultMessage: '!!!Your own custom password will be used to encrypt the printed secret words.',
  },
  paperPasswordIntroLine3: {
    id: 'settings.paperWallet.dialog.password.intro.line3',
    defaultMessage: '!!!Secret words without the password WILL NOT give access to funds!',
  },
  paperPasswordIntroLine4: {
    id: 'settings.paperWallet.dialog.password.intro.line4',
    defaultMessage: '!!!It is YOUR OWN responsibility to make sure you securely remember the password.',
  },
});

type Props = {
  passwordValue: string,
  repeatedPasswordValue: string,
  onNext: Function,
  onCancel: Function,
  onDataChange: Function,
};

@observer
export default class UserPasswordDialog extends Component<Props> {
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
        this.props.onNext({ userPassword: paperPassword });
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
      passwordValue,
      repeatedPasswordValue,
    } = this.props;

    const dialogClasses = classnames(['changePasswordDialog', styles.dialog]);
    const confirmButtonClasses = classnames(['confirmButton']);
    const paperPasswordClasses = classnames([styles.paperPassword]);
    const repeatedPasswordClasses = classnames([styles.repeatedPassword]);

    const actions = [
      {
        label: intl.formatMessage(globalMessages.nextButtonLabel),
        onClick: this.submit,
        primary: true,
        className: confirmButtonClasses,
      },
    ];

    const paperPasswordField = form.$('paperPassword');
    const repeatedPasswordField = form.$('repeatPassword');

    return (
      <Dialog
        title={intl.formatMessage(messages.dialogTitleUserPaperPassword)}
        actions={actions}
        closeOnOverlayClick
        onClose={onCancel}
        className={dialogClasses}
        closeButton={<DialogCloseButton onClose={onCancel} />}
      >

        <div className={styles.headerBlock}>
          <span>{intl.formatMessage(messages.paperPasswordIntroLine1)}</span><br />
          <span>{intl.formatMessage(messages.paperPasswordIntroLine2)}</span><br />
          <span>{intl.formatMessage(messages.paperPasswordIntroLine3)}</span><br />
          <span>{intl.formatMessage(messages.paperPasswordIntroLine4)}</span><br />
        </div>

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
        </div>
        <div className={repeatedPasswordClasses}>
          <Input
            type="password"
            className={repeatedPasswordClasses}
            value={repeatedPasswordValue}
            onChange={(value) => this.handleDataChange('repeatedPasswordValue', value)}
            {...repeatedPasswordField.bind()}
            error={repeatedPasswordField.error}
            skin={InputSkin}
          />
        </div>
        <div className={styles.passwordInstructions}>
          <p className={styles.passwordInstructions}>
            {intl.formatMessage(globalMessages.passwordInstructions)}
          </p>
        </div>

      </Dialog>
    );
  }

}
