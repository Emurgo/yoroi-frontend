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
import ReactToolboxMobxForm from '../../utils/ReactToolboxMobxForm';
import DialogCloseButton from '../widgets/DialogCloseButton';
import Dialog from '../widgets/Dialog';
import {
  isValidWalletName,
  isValidWalletPassword,
  isValidRepeatPassword,
} from '../../utils/validations';
import globalMessages from '../../i18n/global-messages';
import LocalizableError from '../../i18n/LocalizableError';
import styles from './WalletRestoreDialog.scss';
import headerMixin from '../mixins/HeaderBlock.scss';
import config from '../../config';
import DialogBackButton from '../widgets/DialogBackButton';
import { InputOwnSkin } from '../../themes/skins/InputOwnSkin';
import PasswordInstructions from '../widgets/forms/PasswordInstructions';
import { AutocompleteOwnSkin } from '../../themes/skins/AutocompleteOwnSkin';

const messages = defineMessages({
  title: {
    id: 'wallet.restore.dialog.title.label',
    defaultMessage: '!!!Restore wallet',
  },
  titlePaper: {
    id: 'wallet.restore.dialog.title.paper.label',
    defaultMessage: '!!!Restore Yoroi Paper wallet',
  },
  titleVerify: {
    id: 'wallet.restore.dialog.title.verify.label',
    defaultMessage: '!!!Verify Yoroi wallet',
  },
  titleVerifyPaper: {
    id: 'wallet.restore.dialog.title.verify.paper.label',
    defaultMessage: '!!!Verify Yoroi Paper wallet',
  },
  walletNameInputLabel: {
    id: 'wallet.restore.dialog.wallet.name.input.label',
    defaultMessage: '!!!Wallet name',
  },
  walletNameInputHint: {
    id: 'wallet.restore.dialog.wallet.name.input.hint',
    defaultMessage: '!!!Enter wallet name',
  },
  recoveryPhraseInputLabel: {
    id: 'wallet.restore.dialog.recovery.phrase.input.label',
    defaultMessage: '!!!Recovery phrase',
  },
  recoveryPhraseInputHint: {
    id: 'wallet.restore.dialog.recovery.phrase.input.hint',
    defaultMessage: '!!!Enter recovery phrase',
  },
  recoveryPhraseNoResults: {
    id: 'wallet.restore.dialog.recovery.phrase.input.noResults',
    defaultMessage: '!!!No results',
  },
  importButtonLabel: {
    id: 'wallet.restore.dialog.restore.wallet.button.label',
    defaultMessage: '!!!Restore wallet',
  },
  verifyButtonLabel: {
    id: 'wallet.restore.dialog.verify.wallet.button.label',
    defaultMessage: '!!!Verify wallet',
  },
  invalidRecoveryPhrase: {
    id: 'wallet.restore.dialog.form.errors.invalidRecoveryPhrase',
    defaultMessage: '!!!Invalid recovery phrase',
  },
  shortRecoveryPhrase: {
    id: 'wallet.restore.dialog.form.errors.shortRecoveryPhrase',
    defaultMessage: '!!!Short recovery phrase',
  },
  paperPasswordLabel: {
    id: 'wallet.restore.dialog.paperPasswordLabel',
    defaultMessage: '!!!Paper wallet password',
  },
  walletPasswordLabel: {
    id: 'wallet.restore.dialog.walletPasswordLabel',
    defaultMessage: '!!!Spending password',
  },
  passwordFieldPlaceholder: {
    id: 'wallet.restore.dialog.passwordFieldPlaceholder',
    defaultMessage: '!!!Spending Password',
  },
  repeatPasswordLabel: {
    id: 'wallet.restore.dialog.repeatPasswordLabel',
    defaultMessage: '!!!Repeat spending password',
  },
  repeatPasswordFieldPlaceholder: {
    id: 'wallet.restore.dialog.repeatPasswordFieldPlaceholder',
    defaultMessage: '!!!Repeat spending password',
  },
  passwordDisclaimer: {
    id: 'wallet.restore.dialog.passwordDisclaimer',
    defaultMessage: '!!!Typing the wrong wallet password will give you a different wallet. This allows for plausible deniability.',
  },
});

export type WalletRestoreDialogValues = {
  recoveryPhrase: string,
  walletName: string,
  walletPassword: string,
  paperPassword: string,
}

type Props = {
  onSubmit: Function,
  onCancel: Function,
  onBack?: Function,
  isSubmitting: boolean,
  mnemonicValidator: Function,
  passwordValidator?: Function,
  numberOfMnemonics: number,
  error?: ?LocalizableError,
  validWords: Array<string>,
  isPaper?: boolean,
  isVerificationMode?: boolean,
  showPaperPassword?: boolean,
  classicTheme: boolean,
  initValues?: WalletRestoreDialogValues,
};

@observer
export default class WalletRestoreDialog extends Component<Props> {
  static defaultProps = {
    error: undefined,
    onBack: undefined,
    passwordValidator: undefined,
    isPaper: undefined,
    isVerificationMode: undefined,
    showPaperPassword: undefined,
    initValues: undefined,
  };

  static contextTypes = {
    intl: intlShape.isRequired
  };

  getInitRecoveryPhrase = () => {
    if (this.props.initValues) {
      const str: string = (this.props.initValues.recoveryPhrase || '').trim();
      if (str) {
        return str.split(' ');
      }
    }
    return '';
  };

  form = new ReactToolboxMobxForm({
    fields: {
      walletName: this.props.isVerificationMode ? undefined : {
        label: this.context.intl.formatMessage(messages.walletNameInputLabel),
        placeholder: this.context.intl.formatMessage(messages.walletNameInputHint),
        value: (this.props.initValues && this.props.initValues.walletName) || '',
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
        value: this.getInitRecoveryPhrase(),
        validators: [({ field }) => {
          const value = join(field.value, ' ');
          const wordsLeft = this.props.numberOfMnemonics - field.value.length;
          if (value === '') return [false, this.context.intl.formatMessage(globalMessages.fieldIsRequired)];
          if (wordsLeft > 0) {
            return [
              false,
              this.context.intl.formatMessage(messages.shortRecoveryPhrase, { number: wordsLeft })
            ];
          }
          return [
            this.props.mnemonicValidator(value),
            this.context.intl.formatMessage(messages.invalidRecoveryPhrase)
          ];
        }],
      },
      paperPassword: this.props.showPaperPassword ? {
        type: 'password',
        label: this.context.intl.formatMessage(messages.paperPasswordLabel),
        placeholder: this.context.intl.formatMessage(messages.paperPasswordLabel),
        value: (this.props.initValues && this.props.initValues.paperPassword) || '',
        validators: [({ field }) => {
          const validatePassword = p => (
            !this.props.passwordValidator || this.props.passwordValidator(p)
          );
          return [
            field.value.length > 0 && validatePassword(field.value),
            this.context.intl.formatMessage(globalMessages.invalidRepeatPassword)
          ];
        }],
      } : undefined,
      walletPassword: this.props.isVerificationMode ? undefined : {
        type: 'password',
        label: this.context.intl.formatMessage(messages.walletPasswordLabel),
        placeholder: this.context.intl.formatMessage(messages.passwordFieldPlaceholder),
        value: (this.props.initValues && this.props.initValues.walletPassword) || '',
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
      repeatPassword: this.props.isVerificationMode ? undefined : {
        type: 'password',
        label: this.context.intl.formatMessage(messages.repeatPasswordLabel),
        placeholder: this.context.intl.formatMessage(messages.repeatPasswordFieldPlaceholder),
        value: (this.props.initValues && this.props.initValues.walletPassword) || '',
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
        const { recoveryPhrase, walletName, walletPassword, paperPassword } = form.values();
        const walletData: WalletRestoreDialogValues = {
          recoveryPhrase: join(recoveryPhrase, ' '),
          walletName,
          walletPassword,
          paperPassword,
        };
        this.props.onSubmit(walletData);
      },
      onError: () => {}
    });
  };

  render() {
    const { intl } = this.context;
    const { form } = this;
    const {
      validWords,
      isSubmitting,
      error,
      onCancel,
      onBack,
      isPaper,
      isVerificationMode,
      showPaperPassword,
      classicTheme,
      mnemonicValidator,
      passwordValidator,
    } = this.props;
    const {
      walletName,
      paperPassword,
      walletPassword,
      repeatPassword,
      recoveryPhrase
    } = form.values();

    const dialogClasses = classnames([
      styles.component,
      'WalletRestoreDialog',
    ]);

    const walletNameFieldClasses = classnames([
      'walletName',
      classicTheme ? styles.walletNameClassic : styles.walletName,
    ]);

    const paperPasswordFieldClasses = classnames([
      'paperPassword',
      styles.paperPassword,
    ]);

    const walletPasswordFieldsClasses = classnames([
      styles.walletPasswordFields,
      styles.show,
    ]);

    const walletPasswordClasses = classicTheme
      ? styles.walletPasswordClassic
      : styles.walletPassword;

    const validatePaperPassword = () => {
      let condition = isValidWalletPassword(paperPassword);
      if (passwordValidator) {
        condition = condition && passwordValidator(paperPassword);
      }
      return condition;
    };

    const disabledCondition = () => {
      let condition = mnemonicValidator(join(recoveryPhrase, ' '));
      if (!isVerificationMode) {
        condition = condition &&
          isValidWalletName(walletName) &&
          isValidWalletPassword(walletPassword) &&
          isValidRepeatPassword(walletPassword, repeatPassword);
      }

      // Although we require 12 words for creation
      // We allow any password to be used for restoration
      // This is to ensure compatiblity with any other apps that use our paper wallet construction

      return !condition;
    };

    const headerBlockClasses = classicTheme
      ? classnames([headerMixin.headerBlockClassic, styles.headerSaveBlockClassic])
      : headerMixin.headerBlock;

    const walletNameField = form.$('walletName');
    const recoveryPhraseField = form.$('recoveryPhrase');
    const paperPasswordField = form.$('paperPassword');
    const walletPasswordField = form.$('walletPassword');
    const repeatedPasswordField = form.$('repeatPassword');

    const actions = [
      {
        className: isSubmitting ? styles.isSubmitting : null,
        label: intl.formatMessage(
          isVerificationMode ? messages.verifyButtonLabel : messages.importButtonLabel
        ),
        primary: true,
        disabled: isSubmitting || (!classicTheme && disabledCondition()),
        onClick: this.submit,
      },
    ];

    const dialogTitle = () => {
      if (isPaper) {
        return isVerificationMode ? messages.titleVerifyPaper : messages.titlePaper;
      }
      return isVerificationMode ? messages.titleVerify : messages.title;
    };

    return (
      <Dialog
        className={dialogClasses}
        title={intl.formatMessage(dialogTitle())}
        actions={actions}
        closeOnOverlayClick={false}
        onClose={onCancel}
        backButton={onBack && <DialogBackButton onBack={onBack} />}
        closeButton={<DialogCloseButton onClose={onCancel} />}
        classicTheme={classicTheme}
      >

        {isVerificationMode ? '' : (
          <Input
            className={walletNameFieldClasses}
            {...walletNameField.bind()}
            done={isValidWalletName(walletName)}
            error={walletNameField.error}
            skin={classicTheme ? InputSkin : InputOwnSkin}
          />
        )}

        <Autocomplete
          options={validWords}
          maxSelections={this.props.numberOfMnemonics}
          {...recoveryPhraseField.bind()}
          done={mnemonicValidator(join(recoveryPhrase, ' '))}
          error={recoveryPhraseField.error}
          maxVisibleOptions={5}
          noResultsMessage={intl.formatMessage(messages.recoveryPhraseNoResults)}
          skin={classicTheme ? AutocompleteSkin : AutocompleteOwnSkin}
          preselectedOptions={recoveryPhraseField.value}
        />

        {showPaperPassword ? (
          <div className={walletPasswordClasses}>
            <div className={paperPasswordFieldClasses}>
              {isVerificationMode ? '' : (
                <div className={headerBlockClasses}>
                  {intl.formatMessage(messages.passwordDisclaimer)}
                </div>
              )}
              <Input
                className="paperPassword"
                {...paperPasswordField.bind()}
                done={validatePaperPassword()}
                error={paperPasswordField.error}
                skin={classicTheme ? InputSkin : InputOwnSkin}
              />
            </div>
          </div>
        ) : ''}

        {isVerificationMode ? '' : (
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
              <PasswordInstructions isClassicThemeActive={classicTheme} />
            </div>
          </div>
        )}

        {error && <p className={styles.error}>{intl.formatMessage(error)}</p>}

      </Dialog>
    );
  }

}
