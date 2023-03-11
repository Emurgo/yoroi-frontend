
// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { defineMessages, intlShape, FormattedHTMLMessage } from 'react-intl';
import ReactToolboxMobxForm from '../../../utils/ReactToolboxMobxForm';
import vjf from 'mobx-react-form/lib/validators/VJF';
import { isValidWalletName, isValidWalletPassword, isValidRepeatPassword } from '../../../utils/validations';
import { observer } from 'mobx-react';
import { Stack, Typography, Box } from '@mui/material'
import StepController from './StepController';
import globalMessages from '../../../i18n/global-messages';
import config from '../../../config';
import { CREATE_WALLET_SETPS } from './steps';
import { ReactComponent as InfoIcon }  from '../../../assets/images/info-icon-primary.inline.svg';
import WalletNameAndPasswordTipsDialog from './WalletNameAndPasswordTipsDialog';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import TextField from '../../common/TextField';

const messages: * = defineMessages({
  description: {
    id: 'wallet.create.forthStep.description',
    defaultMessage: '!!!<strong>Add</strong> your <strong>wallet name</strong> and <strong>password</strong> to complete the wallet creation.',
  },
  dialogTitle: {
    id: 'wallet.create.dialog.title',
    defaultMessage: '!!!Create wallet',
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
  setCurrentStep(step: string): void,
  recoveryPhrase: Array<string> | null,
|};

type State = {|
  isSubmitting: boolean,
|};

@observer
export default class AddWalletDetailsStep extends Component<Props, State> {
  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  state: State = {
    isSubmitting: false,
  };

  componentDidMount(): void {
    setTimeout(() => { this.walletNameInput.focus(); });
  }

  // $FlowFixMe[value-as-type]
  walletNameInput: TextField;

  form: ReactToolboxMobxForm = new ReactToolboxMobxForm({
    fields: {
      walletName: {
        label: this.context.intl.formatMessage(messages.walletName),
        placeholder: this.props.classicTheme ?
          this.context.intl.formatMessage(messages.walletNameHint) : '',
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
        label: this.context.intl.formatMessage(globalMessages.walletPasswordLabel),
        placeholder: this.props.classicTheme ?
          this.context.intl.formatMessage(globalMessages.walletPasswordLabel) : '',
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
        placeholder: this.props.classicTheme ?
          this.context.intl.formatMessage(messages.repeatPasswordFieldPlaceholder) : '',
        value: '',
        validators: [({ field, form }) => {
          const walletPassword = form.$('walletPassword').value;
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

  checkForEnterKey(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.submit();
    }
  }

  render(): Node {
    const { setCurrentStep, shouldShowDialog, showDialog, hideDialog } = this.props;
    const { form } = this;
    const { walletName, walletPassword, repeatPassword } = form.values();
    const { intl } = this.context;
    const { isSubmitting } = this.state;

    const walletNameField = form.$('walletName');
    const walletPasswordField = form.$('walletPassword');
    const repeatedPasswordField = form.$('repeatPassword');


    return (
      <Stack alignItems='center' justifyContent='center'>
        <Stack direction='column' alignItems='left' justifyContent='center' maxWidth='700px'>
          <Stack mb='8px' flexDirection='row' alignItems='center' gap='6px'>
            <Typography>
              <FormattedHTMLMessage {...messages.description} />
            </Typography>
            <Box sx={{ cursor: 'pointer' }} onClick={showDialog}>
              <InfoIcon />
            </Box>
          </Stack>
          <Box>
            <TextField
              className="walletName"
              onKeyPress={this.checkForEnterKey.bind(this)}
              inputRef={input => {
                  this.walletNameInput = input;
                }}
              {...walletNameField.bind()}
              done={walletNameField.isValid}
              error={walletNameField.error}
            />

            <div>
              <div>
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
          </Box>

          <StepController
            goBack={() => setCurrentStep(CREATE_WALLET_SETPS.LEARN_ABOUT_RECOVERY_PHRASE)}
          />
        </Stack>

        <WalletNameAndPasswordTipsDialog
          open={shouldShowDialog}
          onClose={hideDialog}
        />
      </Stack>
    );
  }
}
