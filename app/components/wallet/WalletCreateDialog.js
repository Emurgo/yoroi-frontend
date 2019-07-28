// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { Input } from 'react-polymorph/lib/components/Input';
import { defineMessages, intlShape } from 'react-intl';
import ReactToolboxMobxForm from '../../utils/ReactToolboxMobxForm';
import vjf from 'mobx-react-form/lib/validators/VJF';
import DialogCloseButton from '../widgets/DialogCloseButton';
import Dialog from '../widgets/Dialog';
import { isValidWalletName, isValidWalletPassword, isValidRepeatPassword } from '../../utils/validations';
import globalMessages from '../../i18n/global-messages';
import styles from './WalletCreateDialog.scss';
import config from '../../config';
import { InputOwnSkin } from '../../themes/skins/InputOwnSkin';
import PasswordInstructions from '../widgets/forms/PasswordInstructions';

const messages = defineMessages({
  dialogTitle: {
    id: 'wallet.create.dialog.title',
    defaultMessage: '!!!Create a new wallet',
  },
  walletName: {
    id: 'wallet.create.dialog.name.label',
    defaultMessage: '!!!Wallet name',
  },
  walletNameHint: {
    id: 'wallet.create.dialog.walletNameHint',
    defaultMessage: '!!!e.g: Shopping Wallet',
  },
  createPersonalWallet: {
    id: 'wallet.create.dialog.create.personal.wallet.button.label',
    defaultMessage: '!!!Create personal wallet',
  },
  walletPasswordLabel: {
    id: 'wallet.create.dialog.walletPasswordLabel',
    defaultMessage: '!!!Spending password',
  },
  passwordFieldPlaceholder: {
    id: 'wallet.create.dialog.passwordFieldPlaceholder',
    defaultMessage: '!!!Spending password',
  },
  repeatPasswordLabel: {
    id: 'wallet.create.dialog.repeatPasswordLabel',
    defaultMessage: '!!!Repeat spending password',
  },
  repeatPasswordFieldPlaceholder: {
    id: 'wallet.create.dialog.repeatPasswordFieldPlaceholder',
    defaultMessage: '!!!Repeat spending password',
  },
});

type Props = {|
  onSubmit: Function,
  onCancel: Function,
  classicTheme: boolean
|};

type State = {
  isSubmitting: boolean,
};

@observer
export default class WalletCreateDialog extends Component<Props, State> {
  static contextTypes = {
    intl: intlShape.isRequired,
  };

  state = {
    isSubmitting: false,
  };

  componentDidMount() {
    setTimeout(() => { this.walletNameInput.focus(); });
  }

  walletNameInput: Input;

  form = new ReactToolboxMobxForm({
    fields: {
      walletName: {
        label: this.context.intl.formatMessage(messages.walletName),
        //placeholder: this.context.intl.formatMessage(messages.walletNameHint),
        value: '',
        validators: [({ field }) => (
          [
            isValidWalletName(field.value),
            this.context.intl.formatMessage(globalMessages.invalidWalletName)
          ]
        )],
      },
      walletPassword: {
        type: 'password',
        label: this.context.intl.formatMessage(messages.walletPasswordLabel),
        //placeholder: this.context.intl.formatMessage(messages.passwordFieldPlaceholder),
        value: '',
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
        label: this.context.intl.formatMessage(messages.repeatPasswordLabel),
        //placeholder: this.context.intl.formatMessage(messages.repeatPasswordFieldPlaceholder),
        value: '',
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
      validateOnChange: true,
      validationDebounceWait: config.forms.FORM_VALIDATION_DEBOUNCE_WAIT,
    },
    plugins: {
      vjf: vjf()
    },
  });

  submit = () => {
    this.form.submit({
      onSuccess: (form) => {
        this.setState({ isSubmitting: true });
        const { walletName, walletPassword } = form.values();
        const walletData = {
          name: walletName,
          password: walletPassword,
        };
        this.props.onSubmit(walletData);
      },
      onError: () => {
        this.setState({ isSubmitting: false });
      },
    });
  };

  checkForEnterKey(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.submit();
    }
  }

  render() {
    const { form } = this;
    const { walletName, walletPassword, repeatPassword } = form.values();
    const { intl } = this.context;
    const { onCancel, classicTheme } = this.props;
    const { isSubmitting } = this.state;
    const dialogClasses = classnames([
      styles.component,
      'WalletCreateDialog',
    ]);
    const walletPasswordFieldsClasses = classnames([
      styles.walletPasswordFields,
      styles.show,
    ]);

    const disabledCondition = !(
      isValidWalletName(walletName)
      && isValidWalletPassword(walletPassword)
      && isValidRepeatPassword(walletPassword, repeatPassword)
    );

    const actions = [
      {
        className: isSubmitting ? styles.isSubmitting : null,
        label: this.context.intl.formatMessage(messages.createPersonalWallet),
        primary: true,
        onClick: this.submit,
        disabled: isSubmitting || (!classicTheme && disabledCondition)
      },
    ];

    const walletNameField = form.$('walletName');
    const walletPasswordField = form.$('walletPassword');
    const repeatedPasswordField = form.$('repeatPassword');

    return (
      <Dialog
        className={dialogClasses}
        title={intl.formatMessage(messages.dialogTitle)}
        actions={actions}
        closeOnOverlayClick={false}
        onClose={!isSubmitting ? onCancel : null}
        closeButton={<DialogCloseButton />}
        classicTheme={classicTheme}
      >
        <Input
          className="walletName"
          onKeyPress={this.checkForEnterKey.bind(this)}
          inputRef={(input) => { this.walletNameInput = input; }}
          {...walletNameField.bind()}
          done={isValidWalletName(walletName)}
          error={walletNameField.error}
          skin={InputOwnSkin}
        />

        <div className={styles.walletPassword}>
          <div className={walletPasswordFieldsClasses}>
            <Input
              className="walletPassword"
              {...walletPasswordField.bind()}
              done={isValidWalletPassword(walletPassword)}
              error={walletPasswordField.error}
              skin={InputOwnSkin}
            />
            <Input
              className="repeatedPassword"
              {...repeatedPasswordField.bind()}
              done={repeatPassword && isValidRepeatPassword(walletPassword, repeatPassword)}
              error={repeatedPasswordField.error}
              skin={InputOwnSkin}
            />

            <PasswordInstructions />
          </div>
        </div>

      </Dialog>
    );
  }
}
