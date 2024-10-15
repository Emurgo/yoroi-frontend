// @flow
import { Component } from 'react';
import type { Node } from 'react';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import type { ManageDialogsProps } from './CreateWalletPage';
import type { NetworkRow } from '../../../api/ada/lib/storage/database/primitives/tables';
import { defineMessages, intlShape, FormattedHTMLMessage } from 'react-intl';
import ReactToolboxMobxForm from '../../../utils/ReactToolboxMobxForm';
import vjf from 'mobx-react-form/lib/validators/VJF';
import StepController from './StepController';
import globalMessages from '../../../i18n/global-messages';
import config from '../../../config';
import WalletNameAndPasswordTipsDialog from './WalletNameAndPasswordTipsDialog';
import TextField from '../../common/TextField';
import WalletPlate from './WalletPlate';
import {
  isValidWalletName,
  isValidWalletPassword,
  isValidRepeatPassword,
} from '../../../utils/validations';
import { observer } from 'mobx-react';
import { Stack, Typography, Box } from '@mui/material';
import { TIPS_DIALOGS, isDialogShownBefore } from './steps';
import { ReactComponent as InfoIcon } from '../../../assets/images/info-icon-primary.inline.svg';

const messages: * = defineMessages({
  createDesc: {
    id: 'wallet.create.forthStep.description',
    defaultMessage:
      '!!!<strong>Add</strong> your <strong>wallet name</strong> and <strong>password</strong> to complete the wallet creation.',
  },
  restoreDesc: {
    id: 'wallet.restore.fourthStep.description',
    defaultMessage:
      '!!!<strong>Add</strong> your <strong>wallet name</strong> and <strong>password</strong> to complete the wallet restoration process.',
  },
  enterWalletName: {
    id: 'wallet.create.forthStep.enterWalletNameInputLabel',
    defaultMessage: '!!!Wallet name',
  },
  enterPassword: {
    id: 'wallet.create.forthStep.enterPasswordInputLabel',
    defaultMessage: '!!!Password',
  },
  passwordHint: {
    id: 'wallet.create.forthStep.passwordHint',
    defaultMessage:
      '!!!Use a combination of letters, numbers and symbols to make your password stronger',
  },
  repeatPasswordLabel: {
    id: 'wallet.create.forthStep.repeatPasswordLabel',
    defaultMessage: '!!!Repeat password',
  },
});

type Props = {|
  prevStep: () => void,
  recoveryPhrase: Array<string> | null,
  selectedNetwork: $ReadOnly<NetworkRow>,
  isRecovery?: boolean,
  isRecoveryPhraseEntered?: boolean,
  onSubmit: (walletName: string, walletPassword: string) => void,
  ...ManageDialogsProps,
|};

@observer
export default class AddWalletDetailsStep extends Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  componentDidMount(): void {
    if (!isDialogShownBefore(TIPS_DIALOGS.WALLET_NAME_AND_PASSWORD)) {
      this.props.openDialog(WalletNameAndPasswordTipsDialog);
    }
  }

  form: ReactToolboxMobxForm = new ReactToolboxMobxForm(
    {
      fields: {
        walletName: {
          label: this.context.intl.formatMessage(messages.enterWalletName),
          value: '',
          validators: [
            ({ field }) => [
              isValidWalletName(field.value),
              this.context.intl.formatMessage(globalMessages.invalidWalletName),
            ],
          ],
        },
        walletPassword: {
          type: 'password',
          label: this.context.intl.formatMessage(messages.enterPassword),
          value: '',
          validators: [
            ({ field, form }) => {
              const repeatPasswordField = form.$('repeatPassword');
              if (repeatPasswordField.value.length > 0) {
                repeatPasswordField.validate({ showErrors: true });
              }
              return [
                isValidWalletPassword(field.value),
                this.context.intl.formatMessage(globalMessages.invalidWalletPassword),
              ];
            },
          ],
        },
        repeatPassword: {
          type: 'password',
          label: this.context.intl.formatMessage(messages.repeatPasswordLabel),
          value: '',
          validators: [
            ({ field, form }) => {
              const walletPassword = form.$('walletPassword').value;
              return [
                isValidRepeatPassword(walletPassword, field.value),
                this.context.intl.formatMessage(globalMessages.invalidRepeatPassword),
              ];
            },
          ],
        },
      },
    },
    {
      options: {
        validateOnChange: true,
        validationDebounceWait: config.forms.FORM_VALIDATION_DEBOUNCE_WAIT,
      },
      plugins: {
        vjf: vjf(),
      },
    }
  );

  render(): Node {
    const {
      prevStep,
      recoveryPhrase,
      isDialogOpen,
      openDialog,
      closeDialog,
      selectedNetwork,
      isRecovery,
    } = this.props;
    const { form } = this;
    const { walletName, walletPassword, repeatPassword } = form.values();
    const { intl } = this.context;

    const walletNameField = form.$('walletName');
    const walletPasswordField = form.$('walletPassword');
    const repeatedPasswordField = form.$('repeatPassword');

    const isValidFields =
      isValidWalletName(walletName) &&
      isValidWalletPassword(walletPassword) &&
      isValidRepeatPassword(walletPassword, repeatPassword);

    if (!recoveryPhrase)
      throw new Error(`Recovery phrase is required to render AddWalletDetails component`);

    const descriptionMessage = Boolean(isRecovery) ? messages.restoreDesc : messages.createDesc;

    return (
      <Stack alignItems="center" justifyContent="center" id="addWalletDetailsStepComponent">
        <Stack direction="column" alignItems="left" justifyContent="center" maxWidth="555px">
          <Stack mb="20px" flexDirection="row" alignItems="center" gap="6px">
            <Typography component="div" variant="body1">
              <FormattedHTMLMessage {...descriptionMessage} />
            </Typography>
            <Box
              component="button"
              sx={{
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onClick={() => openDialog(WalletNameAndPasswordTipsDialog)}
            >
              <InfoIcon />
            </Box>
          </Stack>
          <Box onSubmit={e => e.preventDefault()} component="form" autoComplete="off">
            <Box mb="8px">
              <TextField
                className="walletName"
                {...walletNameField.bind()}
                done={walletNameField.isValid}
                error={walletNameField.error}
                helperText=" "
                autocomplete="off"
                id="walletNameInput"
              />
            </Box>

            <Box>
              <Box mb="8px">
                <TextField
                  className="walletPassword"
                  {...walletPasswordField.bind()}
                  done={walletPasswordField.isValid}
                  error={walletPasswordField.error}
                  helperText={
                    walletPasswordField.error || intl.formatMessage(messages.passwordHint)
                  }
                  id="walletPasswordInput"
                />
              </Box>
              <Box mb="8px">
                <TextField
                  className="repeatedPassword"
                  {...repeatedPasswordField.bind()}
                  done={repeatPassword && repeatedPasswordField.isValid}
                  error={repeatedPasswordField.error}
                  id="repeatPasswordInput"
                />
              </Box>
            </Box>
          </Box>

          <WalletPlate
            recoveryPhrase={recoveryPhrase}
            selectedNetwork={selectedNetwork}
            openDialog={openDialog}
            closeDialog={closeDialog}
            isDialogOpen={isDialogOpen}
          />

          <StepController
            stepActions={[
              {
                label: intl.formatMessage(globalMessages.backButtonLabel),
                disabled: false,
                onClick: prevStep,
                type: 'secondary',
              },
              {
                label: intl.formatMessage(
                  Boolean(isRecovery) ? globalMessages.restore : globalMessages.create
                ),
                disabled: !isValidFields,
                onClick: () => {
                  this.props.onSubmit(walletName, walletPassword);
                },
                type: 'primary',
              },
            ]}
          />
        </Stack>

        <WalletNameAndPasswordTipsDialog
          open={isDialogOpen(WalletNameAndPasswordTipsDialog)}
          onClose={() => closeDialog(TIPS_DIALOGS.WALLET_NAME_AND_PASSWORD)}
        />
      </Stack>
    );
  }
}
