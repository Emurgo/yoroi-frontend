// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { join } from 'lodash';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import TextField from '../common/TextField';
import Autocomplete from '../common/Autocomplete';
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
import config from '../../config';
import DialogBackButton from '../widgets/DialogBackButton';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

const messages = defineMessages({
  title: {
    id: 'wallet.restore.dialog.title.label',
    defaultMessage: '!!!Restore wallet',
  },
  titleVerify: {
    id: 'wallet.restore.dialog.title.verify.label',
    defaultMessage: '!!!Verify Yoroi wallet',
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
|};

type Props = {|
  +onSubmit: WalletRestoreDialogValues => PossiblyAsync<void>,
  +onCancel: void => PossiblyAsync<void>,
  +onBack?: void => PossiblyAsync<void>,
  +mnemonicValidator: string => boolean,
  +numberOfMnemonics: number,
  +error?: ?LocalizableError,
  +validWords: Array<string>,
  +isVerificationMode?: boolean,
  +initValues?: ?WalletRestoreDialogValues,
  +introMessage?: string,
|};

@observer
export default class WalletRestoreDialog extends Component<Props> {
  static defaultProps: {|
    error: void,
    initValues: void,
    introMessage: string,
    isVerificationMode: void,
    onBack: void,
  |} = {
    error: undefined,
    onBack: undefined,
    isVerificationMode: undefined,
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
        placeholder: '',
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
        placeholder: '',
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
      walletPassword: this.props.isVerificationMode === true ? undefined : {
        type: 'password',
        label: this.context.intl.formatMessage(globalMessages.newPasswordLabel),
        placeholder: '',
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
        placeholder: '',
        value: (this.props.initValues && this.props.initValues.walletPassword) || '',
        validators: [({ field, form }) => {
          const walletPassword = form.$('walletPassword').value;
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
        const { recoveryPhrase, walletName, walletPassword } = form.values();
        const walletData: WalletRestoreDialogValues = {
          recoveryPhrase: join(recoveryPhrase, ' '),
          walletName,
          walletPassword,
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

  // $FlowFixMe[value-as-type]
  walletNameInput: TextField;
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
      isVerificationMode,
      mnemonicValidator,
      introMessage
    } = this.props;
    const {
      walletName,
      walletPassword,
      repeatPassword,
      recoveryPhrase
    } = form.values();

    const dialogClasses = classnames([
      styles.component,
      'WalletRestoreDialog',
    ]);

    const walletPasswordFieldsClasses = classnames([
      styles.walletPasswordFields,
      styles.show,
    ]);

    const disabledCondition = () => {
      let condition = mnemonicValidator(join(recoveryPhrase, ' '));
      if (isVerificationMode !== true) {
        condition = condition &&
          isValidWalletName(walletName) &&
          isValidWalletPassword(walletPassword) &&
          isValidRepeatPassword(walletPassword, repeatPassword);
      }
      return !condition;
    };

    const walletNameField = form.$('walletName');
    const recoveryPhraseField = form.$('recoveryPhrase');
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

    const dialogTitle = isVerificationMode === true ? messages.titleVerify : messages.title;

    const introMessageBlock = (introMessage != null && introMessage !== '')
      ? (<DialogTextBlock message={introMessage} subclass="component-input" />)
      : null;
    return (
      <Dialog
        className={dialogClasses}
        title={intl.formatMessage(dialogTitle)}
        dialogActions={actions}
        closeOnOverlayClick={false}
        onClose={onCancel}
        backButton={onBack && <DialogBackButton onBack={onBack} />}
        closeButton={<DialogCloseButton onClose={onCancel} />}
      >

        {isVerificationMode === true
          ? introMessageBlock
          : (
            <TextField
              className={styles.walletName}
              inputRef={(input) => { this.walletNameInput = input; }}
              {...walletNameField.bind()}
              done={walletNameField.isValid}
              error={walletNameField.error}
            />
          )
        }

        <Autocomplete
          options={validWords}
          maxSelections={this.props.numberOfMnemonics}
          maxVisibleOptions={5}
          noResultsMessage={intl.formatMessage(globalMessages.recoveryPhraseNoResults)}
          done={recoveryPhraseField.isValid}
          error={recoveryPhraseField.error}
          {...recoveryPhraseField.bind()}
        />

        {isVerificationMode === true ? '' : (
          <div className={styles.walletPassword}>
            <div className={walletPasswordFieldsClasses}>
              <TextField
                className="walletPassword"
                {...walletPasswordField.bind()}
                done={walletPasswordField.isValid}
                error={walletPasswordField.error}
              />
              <TextField
                className="repeatedPassword"
                {...repeatedPasswordField.bind()}
                done={repeatPassword && repeatedPasswordField.isValid}
                error={repeatedPasswordField.error}
              />
            </div>
          </div>
        )}

        {error && (
          <div className={styles.error}>
            {intl.formatMessage(error, error.values)}
          </div>
        )}

      </Dialog>
    );
  }

}
