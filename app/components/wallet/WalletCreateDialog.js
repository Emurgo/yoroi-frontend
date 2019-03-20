// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { Input } from 'react-polymorph/lib/components/Input';
import { InputSkin } from 'react-polymorph/lib/skins/simple/InputSkin';
import { defineMessages, intlShape } from 'react-intl';
import SvgInline from 'react-svg-inline';
import ReactToolboxMobxForm from '../../utils/ReactToolboxMobxForm';
import DialogCloseButton from '../widgets/DialogCloseButton';
import Dialog from '../widgets/Dialog';
import { isValidWalletName, isValidWalletPassword, isValidRepeatPassword, walletPasswordConditions } from '../../utils/validations';
import globalMessages from '../../i18n/global-messages';
import styles from './WalletCreateDialog.scss';
import iconTickGreenSVG from '../../assets/images/widget/tick-green.inline.svg';
import config from '../../config';
// import InputOwnSkin from '../../themes/skins/InputOwnSkin';

const messages = defineMessages({
  dialogTitle: {
    id: 'wallet.create.dialog.title',
    defaultMessage: '!!!Create a new wallet',
    description: 'Title "Create a new wallet" in the wallet create form.'
  },
  walletName: {
    id: 'wallet.create.dialog.name.label',
    defaultMessage: '!!!Wallet Name',
    description: 'Label for the "Wallet Name" text input in the wallet create form.'
  },
  walletNameHint: {
    id: 'wallet.create.dialog.walletNameHint',
    defaultMessage: '!!!e.g: Shopping Wallet',
    description: 'Hint for the "Wallet Name" text input in the wallet create form.'
  },
  createPersonalWallet: {
    id: 'wallet.create.dialog.create.personal.wallet.button.label',
    defaultMessage: '!!!Create personal wallet',
    description: 'Label for the "Create personal wallet" button on create wallet dialog.'
  },
  walletPasswordLabel: {
    id: 'wallet.create.dialog.walletPasswordLabel',
    defaultMessage: '!!!Wallet password',
    description: 'Label for the "Wallet password" input in the create wallet dialog.',
  },
  repeatPasswordLabel: {
    id: 'wallet.create.dialog.repeatPasswordLabel',
    defaultMessage: '!!!Repeat password',
    description: 'Label for the "Repeat password" input in the create wallet dialog.',
  },
  passwordFieldPlaceholder: {
    id: 'wallet.create.dialog.passwordFieldPlaceholder',
    defaultMessage: '!!!Password',
    description: 'Placeholder for the "Password" inputs in the create wallet dialog.',
  },
});

type Props = {
  onSubmit: Function,
  onCancel: Function,
  classicTheme: boolean
};

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
    setTimeout(() => { this.walletNameInput.getRef().focus(); });
  }

  walletNameInput: Input;

  form = new ReactToolboxMobxForm({
    fields: {
      walletName: {
        label: this.context.intl.formatMessage(messages.walletName),
        placeholder: this.context.intl.formatMessage(messages.walletNameHint),
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
        placeholder: this.context.intl.formatMessage(messages.passwordFieldPlaceholder),
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
        placeholder: this.context.intl.formatMessage(messages.passwordFieldPlaceholder),
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
    const {
      condition1,
      condition2,
      condition3,
      condition4
    } = walletPasswordConditions(walletPassword);
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
        closeOnOverlayClick
        onClose={!isSubmitting ? onCancel : null}
        closeButton={<DialogCloseButton />}
        classicTheme={classicTheme}
      >
        <Input
          className="walletName"
          done={isValidWalletName(walletName)}
          onKeyPress={this.checkForEnterKey.bind(this)}
          ref={(input) => { this.walletNameInput = input; }}
          {...walletNameField.bind()}
          error={walletNameField.error}
          // skin={classicTheme ? <SimpleInputSkin /> : <InputOwnSkin />}
          skin={InputSkin}
        />

        <div className={styles.walletPassword}>
          <div className={walletPasswordFieldsClasses}>
            <Input
              className="walletPassword"
              done={isValidWalletPassword(walletPassword)}
              {...walletPasswordField.bind()}
              error={walletPasswordField.error}
              // skin={classicTheme ? <SimpleInputSkin /> : <InputOwnSkin />}
              skin={InputSkin}
            />
            <Input
              className="repeatedPassword"
              done={repeatPassword && isValidRepeatPassword(walletPassword, repeatPassword)}
              {...repeatedPasswordField.bind()}
              error={repeatedPasswordField.error}
              // skin={classicTheme ? <SimpleInputSkin /> : <InputOwnSkin />}
              skin={InputSkin}
            />
            {classicTheme ? (
              <p className={styles.passwordInstructions}>
                {intl.formatMessage(globalMessages.passwordInstructions)}
              </p>
            ) : (
              <div className={styles.passwordInstructions}>
                <p>{intl.formatMessage(globalMessages.passwordInstructionsHeader)}</p>

                <ul>
                  <li className={classnames({ [styles.successCondition]: condition1 })}>
                    {condition1 && <SvgInline svg={iconTickGreenSVG} cleanup={['title']} />}
                    {intl.formatMessage(globalMessages.passwordInstructionsCondition1)}
                  </li>
                  <li className={classnames({ [styles.successCondition]: condition2 })}>
                    {condition2 && <SvgInline svg={iconTickGreenSVG} cleanup={['title']} />}
                    {intl.formatMessage(globalMessages.passwordInstructionsCondition2)}
                  </li>
                  <li className={classnames({ [styles.successCondition]: condition3 })}>
                    {condition3 && <SvgInline svg={iconTickGreenSVG} cleanup={['title']} />}
                    {intl.formatMessage(globalMessages.passwordInstructionsCondition3)}
                  </li>
                  <li className={classnames({ [styles.successCondition]: condition4 })}>
                    {condition4 && <SvgInline svg={iconTickGreenSVG} cleanup={['title']} />}
                    {intl.formatMessage(globalMessages.passwordInstructionsCondition4)}
                  </li>
                </ul>
              </div>
            )}

          </div>
        </div>

      </Dialog>
    );
  }

}
