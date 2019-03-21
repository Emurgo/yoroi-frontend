// @flow
import React, { Component } from 'react';
import { join } from 'lodash';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { Input } from 'react-polymorph/lib/components/Input';
import { InputSkin } from 'react-polymorph/lib/skins/simple/InputSkin';
import { Autocomplete } from 'react-polymorph/lib/components/Autocomplete';
import { AutocompleteSkin } from 'react-polymorph/lib/skins/simple/AutocompleteSkin';
import { defineMessages, intlShape } from 'react-intl';
import SvgInline from 'react-svg-inline';
import ReactToolboxMobxForm from '../../utils/ReactToolboxMobxForm';
import DialogCloseButton from '../widgets/DialogCloseButton';
import Dialog from '../widgets/Dialog';
import { isValidWalletName, isValidWalletPassword, isValidRepeatPassword, walletPasswordConditions } from '../../utils/validations';
import globalMessages from '../../i18n/global-messages';
import LocalizableError from '../../i18n/LocalizableError';
import styles from './WalletRestoreDialog.scss';
import iconTickGreenSVG from '../../assets/images/widget/tick-green.inline.svg';
import config from '../../config';
import { InputOwnSkin } from '../../themes/skins/InputOwnSkin';

const messages = defineMessages({
  title: {
    id: 'wallet.restore.dialog.title.label',
    defaultMessage: '!!!Restore wallet',
    description: 'Label "Restore wallet" on the wallet restore dialog.'
  },
  walletNameInputLabel: {
    id: 'wallet.restore.dialog.wallet.name.input.label',
    defaultMessage: '!!!Wallet name',
    description: 'Label for the wallet name input on the wallet restore dialog.'
  },
  walletNameInputHint: {
    id: 'wallet.restore.dialog.wallet.name.input.hint',
    defaultMessage: '!!!Enter wallet name',
    description: 'Hint "Enter wallet name" for the wallet name input on the wallet restore dialog.'
  },
  recoveryPhraseInputLabel: {
    id: 'wallet.restore.dialog.recovery.phrase.input.label',
    defaultMessage: '!!!Recovery phrase',
    description: 'Label for the recovery phrase input on the wallet restore dialog.'
  },
  recoveryPhraseInputHint: {
    id: 'wallet.restore.dialog.recovery.phrase.input.hint',
    defaultMessage: '!!!Enter recovery phrase',
    description: 'Hint "Enter recovery phrase" for the recovery phrase input on the wallet restore dialog.'
  },
  recoveryPhraseNoResults: {
    id: 'wallet.restore.dialog.recovery.phrase.input.noResults',
    defaultMessage: '!!!No results',
    description: '"No results" message for the recovery phrase input search results.'
  },
  importButtonLabel: {
    id: 'wallet.restore.dialog.restore.wallet.button.label',
    defaultMessage: '!!!Restore wallet',
    description: 'Label for the "Restore wallet" button on the wallet restore dialog.'
  },
  invalidRecoveryPhrase: {
    id: 'wallet.restore.dialog.form.errors.invalidRecoveryPhrase',
    defaultMessage: '!!!Invalid recovery phrase',
    description: 'Error message shown when invalid recovery phrase was entered.'
  },
  walletPasswordLabel: {
    id: 'wallet.restore.dialog.walletPasswordLabel',
    defaultMessage: '!!!Wallet password',
    description: 'Label for the "Wallet password" input in the wallet restore dialog.',
  },
  repeatPasswordLabel: {
    id: 'wallet.restore.dialog.repeatPasswordLabel',
    defaultMessage: '!!!Repeat password',
    description: 'Label for the "Repeat password" input in the wallet restore dialog.',
  },
  passwordFieldPlaceholder: {
    id: 'wallet.restore.dialog.passwordFieldPlaceholder',
    defaultMessage: '!!!Password',
    description: 'Placeholder for the "Password" inputs in the wallet restore dialog.',
  },
});

messages.fieldIsRequired = globalMessages.fieldIsRequired;

type Props = {
  onSubmit: Function,
  onCancel: Function,
  isSubmitting: boolean,
  mnemonicValidator: Function,
  error?: ?LocalizableError,
  validWords: Array<string>,
  classicTheme: boolean
};

@observer
export default class WalletRestoreDialog extends Component<Props> {
  static defaultProps = {
    error: undefined
  };

  static contextTypes = {
    intl: intlShape.isRequired
  };

  form = new ReactToolboxMobxForm({
    fields: {
      walletName: {
        label: this.context.intl.formatMessage(messages.walletNameInputLabel),
        placeholder: this.context.intl.formatMessage(messages.walletNameInputHint),
        value: '',
        validators: [({ field }) => (
          [
            isValidWalletName(field.value),
            this.context.intl.formatMessage(globalMessages.invalidWalletName)
          ]
        )],
      },
      recoveryPhrase: {
        label: this.context.intl.formatMessage(messages.recoveryPhraseInputLabel),
        placeholder: this.context.intl.formatMessage(messages.recoveryPhraseInputHint),
        value: '',
        validators: [({ field }) => {
          const value = join(field.value, ' ');
          if (value === '') return [false, this.context.intl.formatMessage(messages.fieldIsRequired)];
          return [
            this.props.mnemonicValidator(value),
            this.context.intl.formatMessage(messages.invalidRecoveryPhrase)
          ];
        }],
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
    },
  }, {
    options: {
      validateOnChange: true,
      validationDebounceWait: config.forms.FORM_VALIDATION_DEBOUNCE_WAIT,
    },
  });

  submit = () => {
    this.form.submit({
      onSuccess: (form) => {
        const { recoveryPhrase, walletName, walletPassword } = form.values();
        const walletData = {
          recoveryPhrase: join(recoveryPhrase, ' '),
          walletName,
          walletPassword,
        };
        this.props.onSubmit(walletData);
      },
      onError: () => {}
    });
  };

  render() {
    const { intl } = this.context;
    const { form } = this;
    const { validWords, isSubmitting, error,
      onCancel, classicTheme, mnemonicValidator } = this.props;
    const { walletName, walletPassword, repeatPassword, recoveryPhrase } = form.values();
    const {
      condition1,
      condition2,
      condition3,
      condition4
    } = walletPasswordConditions(walletPassword);

    const dialogClasses = classnames([
      styles.component,
      'WalletRestoreDialog',
    ]);

    const walletNameFieldClasses = classnames([
      'walletName',
      classicTheme ? styles.walletNameClassic : styles.walletName,
    ]);
    const walletPasswordFieldsClasses = classnames([
      styles.walletPasswordFields,
      styles.show,
    ]);
    const walletPasswordClasses = classicTheme
      ? styles.walletPasswordClassic
      : styles.walletPassword;

    const disabledCondition = !(
      isValidWalletName(walletName)
      && mnemonicValidator(join(recoveryPhrase, ' '))
      && isValidWalletPassword(walletPassword)
      && isValidRepeatPassword(walletPassword, repeatPassword)
    );

    const walletNameField = form.$('walletName');
    const recoveryPhraseField = form.$('recoveryPhrase');
    const walletPasswordField = form.$('walletPassword');
    const repeatedPasswordField = form.$('repeatPassword');

    const actions = [
      {
        className: isSubmitting ? styles.isSubmitting : null,
        label: intl.formatMessage(messages.importButtonLabel),
        primary: true,
        disabled: isSubmitting || (!classicTheme && disabledCondition),
        onClick: this.submit,
      },
    ];

    return (
      <Dialog
        className={dialogClasses}
        title={intl.formatMessage(messages.title)}
        actions={actions}
        closeOnOverlayClick
        onClose={onCancel}
        closeButton={<DialogCloseButton />}
        classicTheme={classicTheme}
      >

        <Input
          className={walletNameFieldClasses}
          {...walletNameField.bind()}
          done={isValidWalletName(walletName)}
          error={walletNameField.error}
          skin={classicTheme ? InputSkin : InputOwnSkin}
        />

        <Autocomplete
          options={validWords}
          maxSelections={15}
          {...recoveryPhraseField.bind()}
          error={recoveryPhraseField.error}
          maxVisibleOptions={5}
          noResultsMessage={intl.formatMessage(messages.recoveryPhraseNoResults)}
          skin={AutocompleteSkin}
        />

        <div className={walletPasswordClasses}>
          <div className={walletPasswordFieldsClasses}>
            <Input
              className="walletPassword"
              {...walletPasswordField.bind()}
              done={isValidWalletPassword(walletPassword)}
              error={walletPasswordField.error}
              skin={classicTheme ? InputSkin : InputOwnSkin}
            />
            <Input
              className="repeatedPassword"
              {...repeatedPasswordField.bind()}
              done={repeatPassword && isValidRepeatPassword(walletPassword, repeatPassword)}
              error={repeatedPasswordField.error}
              skin={classicTheme ? InputSkin : InputOwnSkin}
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

        {error && <p className={styles.error}>{intl.formatMessage(error)}</p>}

      </Dialog>
    );
  }

}
