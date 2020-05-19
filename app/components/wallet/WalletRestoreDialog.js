// @flow
import type { Node } from 'react';
import React, { Component } from 'react';
import { join } from 'lodash';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { Input } from 'react-polymorph/lib/components/Input';
import { Autocomplete } from 'react-polymorph/lib/components/Autocomplete';
import { defineMessages, intlShape } from 'react-intl';
import ReactToolboxMobxForm from '../../utils/ReactToolboxMobxForm';
import vjf from 'mobx-react-form/lib/validators/VJF';
import DialogCloseButton from '../widgets/DialogCloseButton';
import DialogTextBlock from '../widgets/DialogTextBlock';
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
import { AutocompleteOwnSkin } from '../../themes/skins/AutocompleteOwnSkin';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

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
  importButtonLabel: {
    id: 'wallet.restore.dialog.restore.wallet.button.label',
    defaultMessage: '!!!Restore wallet',
  },
  verifyButtonLabel: {
    id: 'wallet.restore.dialog.verify.wallet.button.label',
    defaultMessage: '!!!Verify wallet',
  },
});

export type WalletRestoreDialogValues = {|
  recoveryPhrase: string,
  walletName: string,
  walletPassword: string,
  paperPassword: string,
|};

type Props = {|
  +onSubmit: WalletRestoreDialogValues => PossiblyAsync<void>,
  +onCancel: void => PossiblyAsync<void>,
  +onBack?: void => PossiblyAsync<void>,
  +mnemonicValidator: string => boolean,
  +paperPasswordValidator?: string => boolean,
  +numberOfMnemonics: number,
  +error?: ?LocalizableError,
  +validWords: Array<string>,
  +isPaper?: boolean,
  +isVerificationMode?: boolean,
  +showPaperPassword?: boolean,
  +classicTheme: boolean,
  +initValues?: ?WalletRestoreDialogValues,
  +introMessage?: string,
|};

@observer
export default class WalletRestoreDialog extends Component<Props> {
  static defaultProps: {|
    error: void,
    initValues: void,
    introMessage: string,
    isPaper: void,
    isVerificationMode: void,
    onBack: void,
    paperPasswordValidator: void,
    showPaperPassword: void,
  |} = {
    error: undefined,
    onBack: undefined,
    paperPasswordValidator: undefined,
    isPaper: undefined,
    isVerificationMode: undefined,
    showPaperPassword: undefined,
    initValues: undefined,
    introMessage: '',
  };

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired
  };

  getInitRecoveryPhrase: void => Array<string> = () => {
    if (this.props.initValues) {
      const str: string = (this.props.initValues.recoveryPhrase || '').trim();
      if (str) {
        return str.split(' ');
      }
    }
    return [];
  };

  form: ReactToolboxMobxForm = new ReactToolboxMobxForm({
    fields: {
      walletName: this.props.isVerificationMode === true ? undefined : {
        label: this.context.intl.formatMessage(messages.walletNameInputLabel),
        placeholder: this.props.classicTheme ?
          this.context.intl.formatMessage(messages.walletNameInputHint) : '',
        value: (this.props.initValues && this.props.initValues.walletName) || '',
        validators: [({ field }) => (
          [
            isValidWalletName(field.value),
            this.context.intl.formatMessage(globalMessages.invalidWalletName)
          ]
        )],
      },
      recoveryPhrase: {
        label: this.context.intl.formatMessage(globalMessages.recoveryPhraseInputLabel),
        placeholder: this.props.classicTheme ?
          this.context.intl.formatMessage(globalMessages.recoveryPhraseInputHint) : '',
        value: this.getInitRecoveryPhrase(),
        validators: [({ field }) => {
          const value = join(field.value, ' ');
          const wordsLeft = this.props.numberOfMnemonics - field.value.length;
          if (value === '') return [false, this.context.intl.formatMessage(globalMessages.fieldIsRequired)];
          if (wordsLeft > 0) {
            return [
              false,
              this.context.intl.formatMessage(globalMessages.shortRecoveryPhrase,
                { number: wordsLeft })
            ];
          }
          return [
            this.props.mnemonicValidator(value),
            this.context.intl.formatMessage(globalMessages.invalidRecoveryPhrase)
          ];
        }],
      },
      paperPassword: this.props.showPaperPassword === true ? {
        type: 'password',
        label: this.context.intl.formatMessage(globalMessages.paperPasswordLabel),
        placeholder: this.props.classicTheme ?
          this.context.intl.formatMessage(globalMessages.paperPasswordLabel) : '',
        value: (this.props.initValues && this.props.initValues.paperPassword) || '',
        validators: [({ field }) => {
          const validatePassword = p => (
            !this.props.paperPasswordValidator || this.props.paperPasswordValidator(p)
          );
          return [
            validatePassword(field.value),
            this.context.intl.formatMessage(globalMessages.invalidRepeatPassword)
          ];
        },
        ({ field }) => ([
          // TODO: Should we allow 0-length paper wallet passwords?
          // Disable for now to avoid user accidentally forgetting
          // to enter his password and pressing restore
          field.value.length > 0,
          this.context.intl.formatMessage(globalMessages.invalidPaperPassword)
        ]),
        ],
      } : undefined,
      walletPassword: this.props.isVerificationMode === true ? undefined : {
        type: 'password',
        label: this.context.intl.formatMessage(globalMessages.newPasswordLabel),
        placeholder: this.props.classicTheme ?
          this.context.intl.formatMessage(globalMessages.newPasswordFieldPlaceholder) : '',
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
      repeatPassword: this.props.isVerificationMode === true ? undefined : {
        type: 'password',
        label: this.context.intl.formatMessage(globalMessages.repeatPasswordLabel),
        placeholder: this.props.classicTheme ?
          this.context.intl.formatMessage(globalMessages.repeatPasswordFieldPlaceholder) : '',
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
      showErrorsOnInit: (() => {
        if (this.props.initValues == null) {
          return false;
        }
        const { initValues } = this.props;
        return Object.keys(initValues)
          .map(key => initValues[key])
          .filter(val => val !== '' && val != null)
          .length > 0;
      })(),
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
        const { recoveryPhrase, walletName, walletPassword, paperPassword } = form.values();
        const walletData: WalletRestoreDialogValues = {
          recoveryPhrase: join(recoveryPhrase, ' '),
          walletName,
          walletPassword,
          paperPassword,
        };
        await this.props.onSubmit(walletData);
      },
      onError: () => {}
    });
  };

  componentDidMount(): void {
    setTimeout(() => {
      if (this.props.isVerificationMode === true) {
        // Refer: https://github.com/Emurgo/yoroi-frontend/pull/1009
        // this.recoveryPhraseInput.focus();
      } else if (this.walletNameInput != null) {
        this.walletNameInput.focus();
      }
    });
  }

  walletNameInput: Input;
  // Refer: https://github.com/Emurgo/yoroi-frontend/pull/1009
  // recoveryPhraseInput: Autocomplete;

  render(): Node {
    const { intl } = this.context;
    const { form } = this;
    const {
      validWords,
      error,
      onCancel,
      onBack,
      isPaper,
      isVerificationMode,
      showPaperPassword,
      classicTheme,
      mnemonicValidator,
      paperPasswordValidator,
      introMessage
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

    const paperPasswordFieldClasses = classnames([
      'paperPassword',
      styles.paperPassword,
    ]);

    const walletPasswordFieldsClasses = classnames([
      styles.walletPasswordFields,
      styles.show,
    ]);

    const validatePaperPassword = () => {
      let condition = isValidWalletPassword(paperPassword);
      if (paperPasswordValidator) {
        condition = condition && paperPasswordValidator(paperPassword);
      }
      return condition;
    };

    const disabledCondition = () => {
      let condition = mnemonicValidator(join(recoveryPhrase, ' '));
      if (isVerificationMode !== true) {
        condition = condition &&
          isValidWalletName(walletName) &&
          isValidWalletPassword(walletPassword) &&
          isValidRepeatPassword(walletPassword, repeatPassword);
      }
      if (this.props.paperPasswordValidator != null) {
        condition = condition && validatePaperPassword();
      }

      // Although we require 10 characters for creation
      // We allow any password to be used for restoration
      // This is to ensure compatibility with any other apps that use our paper wallet construction

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
        className: null,
        label: intl.formatMessage(
          isVerificationMode === true ? messages.verifyButtonLabel : messages.importButtonLabel
        ),
        primary: true,
        disabled: disabledCondition(),
        onClick: this.submit,
      },
    ];

    const dialogTitle = () => {
      if (isPaper === true) {
        return isVerificationMode === true ? messages.titleVerifyPaper : messages.titlePaper;
      }
      return isVerificationMode === true ? messages.titleVerify : messages.title;
    };

    const introMessageBlock = (introMessage != null && introMessage !== '')
      ? (<DialogTextBlock message={introMessage} subclass="component-input" />)
      : null;
    return (
      <Dialog
        className={dialogClasses}
        title={intl.formatMessage(dialogTitle())}
        actions={actions}
        closeOnOverlayClick={false}
        onClose={onCancel}
        backButton={onBack && <DialogBackButton onBack={onBack} />}
        closeButton={<DialogCloseButton onClose={onCancel} />}
      >

        {isVerificationMode === true
          ? introMessageBlock
          : (
            <Input
              className={styles.walletName}
              inputRef={(input) => { this.walletNameInput = input; }}
              {...walletNameField.bind()}
              done={isValidWalletName(walletName)}
              error={walletNameField.error}
              skin={InputOwnSkin}
            />
          )
        }

        <Autocomplete
          options={validWords}
          maxSelections={this.props.numberOfMnemonics}
          // Refer: https://github.com/Emurgo/yoroi-frontend/pull/1009
          // inputRef={(input) => { this.recoveryPhraseInput = input; }}
          {...recoveryPhraseField.bind()}
          done={mnemonicValidator(join(recoveryPhrase, ' '))}
          error={recoveryPhraseField.error}
          maxVisibleOptions={5}
          noResultsMessage={intl.formatMessage(globalMessages.recoveryPhraseNoResults)}
          skin={AutocompleteOwnSkin}
          preselectedOptions={recoveryPhraseField.value}
        />

        {showPaperPassword === true ? (
          <div className={styles.walletPassword}>
            <div className={paperPasswordFieldClasses}>
              {isVerificationMode === true ? '' : (
                <div className={headerBlockClasses}>
                  {intl.formatMessage(globalMessages.passwordDisclaimer)}
                </div>
              )}
              <Input
                className="paperPassword"
                {...paperPasswordField.bind()}
                done={validatePaperPassword()}
                error={paperPasswordField.error}
                skin={InputOwnSkin}
              />
            </div>
          </div>
        ) : ''}

        {isVerificationMode === true ? '' : (
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
            </div>
          </div>
        )}

        {error && <p className={styles.error}>{intl.formatMessage(error)}</p>}

      </Dialog>
    );
  }

}
