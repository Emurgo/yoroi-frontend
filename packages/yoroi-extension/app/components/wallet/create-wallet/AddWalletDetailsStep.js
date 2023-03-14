
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
  enterWalletName: {
    id: 'wallet.create.forthStep.enterWalletNameInputLabel',
    defaultMessage: '!!!Enter wallet name',
  },
  enterPassword: {
    id: 'wallet.create.forthStep.enterPasswordInputLabel',
    defaultMessage: '!!!Enter password',
  },
  passwordHint: {
    id: 'wallet.create.forthStep.passwordHint',
    defaultMessage: '!!!Use a combination of letters, numbers and symbols to make your password stronger',
  },
  repeatPasswordLabel: {
    id: 'wallet.create.forthStep.repeatPasswordLabel',
    defaultMessage: '!!!Repeat password',
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

  form: ReactToolboxMobxForm = new ReactToolboxMobxForm({
    fields: {
      walletName: {
        label: this.context.intl.formatMessage(messages.enterWalletName),
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
        label: this.context.intl.formatMessage(messages.enterPassword),
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

  submit: (() => void) = () => {
    console.log('submitting...')
    this.form.submit({
      onSuccess: async (form) => {
        this.setState({ isSubmitting: true });
        const { walletName, walletPassword } = form.values();
        await this.props.onSubmit(walletName, walletPassword);
      },
      onError: () => {
        this.setState({ isSubmitting: false });
      },
    });
  };

  render(): Node {
    const { setCurrentStep, shouldShowDialog, showDialog, hideDialog } = this.props;
    const { form } = this;
    const { walletName, walletPassword, repeatPassword } = form.values();
    const { intl } = this.context;
    const { isSubmitting } = this.state;

    const walletNameField = form.$('walletName');
    const walletPasswordField = form.$('walletPassword');
    const repeatedPasswordField = form.$('repeatPassword');

    const goNextCallback = () => {
      const fields = [
        walletNameField,
        walletPasswordField,
        repeatedPasswordField,
      ];

      if (fields.some(field => !field.isValid)) return undefined
      return () => {
        this.props.onSubmit(walletName, walletPassword);
      }
    }

    return (
      <Stack alignItems='center' justifyContent='center'>
        <Stack direction='column' alignItems='left' justifyContent='center' maxWidth='555px'>
          <Stack mb='20px' flexDirection='row' alignItems='center' gap='6px'>
            <Typography variant='body1'>
              <FormattedHTMLMessage {...messages.description} />
            </Typography>
            <Box
              component='button'
              sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onClick={showDialog}
            >
              <InfoIcon />
            </Box>
          </Stack>
          <Box onSubmit={(e) => e.preventDefault()} component='form' autoComplete='off'>
            <TextField
              className="walletName"
              {...walletNameField.bind()}
              done={walletNameField.isValid}
              error={walletNameField.error}
              autocomplete="off"
            />

            <Box>
              <Box>
                <TextField
                  className="walletPassword"
                  {...walletPasswordField.bind()}
                  done={walletPasswordField.isValid}
                  error={walletPasswordField.error}
                  helperText={
                    walletPasswordField.error || intl.formatMessage(messages.passwordHint)
                  }
                />
                <TextField
                  className="repeatedPassword"
                  {...repeatedPasswordField.bind()}
                  done={repeatPassword && repeatedPasswordField.isValid}
                  error={repeatedPasswordField.error}
                />
              </Box>
            </Box>
          </Box>

          <StepController
            goNext={goNextCallback()}
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
};
