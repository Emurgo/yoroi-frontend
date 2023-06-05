// @flow
import { Component } from 'react';
import { injectIntl, defineMessages } from 'react-intl';
import type { Node, ComponentType } from 'react';
import type { $npm$ReactIntl$IntlShape } from 'react-intl';
import { observer } from 'mobx-react';
import { Button, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { ReactComponent as NoDappIcon } from '../../../assets/images/dapp-connector/no-dapp.inline.svg';
import globalMessages from '../../../i18n/global-messages';
import type { SubmitDelegationMessage } from '../../../../chrome/extension/connector/types';
import ReactToolboxMobxForm from '../../../utils/ReactToolboxMobxForm';
import TextField from '../../../components/common/TextField';
import ErrorBlock from '../../../components/widgets/ErrorBlock';
import config from '../../../config';
import vjf from 'mobx-react-form/lib/validators/VJF';
import { WrongPassphraseError } from '../../../api/ada/lib/cardanoCrypto/cryptoErrors';
import type LocalizableError from '../../../i18n/LocalizableError';

const messages = defineMessages({
  title: {
    id: 'connector.catalyst.submit.delegation',
    defaultMessage: '!!!Submit delegation'
  },
  voteKey: {
    id: 'connector.catalyst.submit.delegation.vote.key',
    defaultMessage: '!!!Vote key'
  },
  weight: {
    id: 'connector.catalyst.submit.delegation.weight',
    defaultMessage: '!!!Weight'
  },
  ownVoteKey: {
    id: 'connector.catalyst.submit.delegation.own.vote.key',
    defaultMessage: '!!!own vote key'
  },

});
                                
type Props = {|
  favicon: ?string,
  onConfirm: (password?: ?string) => Promise<void>,
  onCancel: () => void,
  submitDelegationMessage: ?SubmitDelegationMessage,
  submitDelegationTxFee: ?string,
  submitDelegationError: ?LocalizableError,
  ownVoteKey: ?string,
  submitDelegationWalletType: ?string,
  isHwWalletErrorRecoverable: ?boolean,
|};

type State = {|
  isSubmitting: boolean,
|};

@observer
class SubmitDelegationPage extends Component<
  Props & {| intl: $npm$ReactIntl$IntlShape |}, State
> {
  form: ReactToolboxMobxForm = new ReactToolboxMobxForm(
    {
      fields: {
        walletPassword: {
          type: 'password',
          label: this.props.intl.formatMessage(globalMessages.walletPasswordLabel),
          placeholder: this.props.intl.formatMessage(
            globalMessages.walletPasswordFieldPlaceholder
          ),
          value: '',
          validators: [
            ({ field }) => {
              if (field.value === '') {
                return [false, this.props.intl.formatMessage(globalMessages.fieldIsRequired)];
              }
              return [true];
            },
          ],
        },
      },
    },
    {
      options: {
        validateOnChange: true,
        validateOnBlur: false,
        validationDebounceWait: config.forms.FORM_VALIDATION_DEBOUNCE_WAIT,
      },
      plugins: {
        vjf: vjf(),
      },
    }
  );

  state: State = {
    isSubmitting: false,
  };

  submit(): void {
    if (this.props.submitDelegationWalletType === 'web') {
      this.form.submit({
        onSuccess: form => {
          const { walletPassword } = form.values();
          this.setState({ isSubmitting: true });
          this.props
            .onConfirm(walletPassword)
            .finally(() => {
              this.setState({ isSubmitting: false });
            })
            .catch(error => {
              if (error instanceof WrongPassphraseError) {
                this.form
                  .$('walletPassword')
                  .invalidate(
                    this.props.intl.formatMessage(
                      globalMessages.incorrectWalletPasswordError
                    )
                  );
              } else {
                throw error;
              }
            });
        },
        onError: () => {},
      });
    } else {
      this.setState({ isSubmitting: true });
      this.props
        .onConfirm('')
        .finally(() => {
          this.setState({ isSubmitting: false });
        })
        .catch(error => {
          throw error;
        });
    }
  }

  render(): Node {
    const { isSubmitting } = this.state;

    const {
      favicon,
      intl,
      submitDelegationMessage,
      submitDelegationTxFee,
      submitDelegationError,
      ownVoteKey,
      submitDelegationWalletType,
      onCancel,
      isHwWalletErrorRecoverable,
    } = this.props;

    if (submitDelegationError && isHwWalletErrorRecoverable === false) {
      return (
        <ErrorBlock error={submitDelegationError} />
      );
    }

    if (submitDelegationMessage == null) {
      return null;
    }
    const url = submitDelegationMessage.requesterUrl;

    const walletPasswordField = this.form.$('walletPassword');

    let confirmButtonLabel;
    if (submitDelegationWalletType === 'ledger') {
      confirmButtonLabel = globalMessages.confirmOnLedger;
    } else if (submitDelegationWalletType === 'trezor') {
      confirmButtonLabel = globalMessages.confirmOnTrezor;
    } else {
      confirmButtonLabel = globalMessages.confirm;
    }

    return (
      <Box display="flex" alignItems="center" flexDirection="column">
        <Box sx={{ padding: '32px' }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography color="#242838" variant="h4" align="center" my="32px">
              {intl.formatMessage(messages.title)}
            </Typography>

            <Box
              sx={{
                marginRight: '8px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '40px',
                height: '40px',
                border: '1px solid #A7AFC0',
                borderRadius: '50%',
                img: { width: '30px' },
              }}
            >
              {favicon != null && favicon !== '' ? (
                <img src={favicon} alt={`${url} favicon`} />
              ) : (
                <NoDappIcon />
              )}
            </Box>
            <Typography variant="body1" fontWeight="400" color="#242838">
              {url}
            </Typography>
          </Box>

          {submitDelegationMessage && (
            submitDelegationMessage.delegation.delegations.map(({ voteKey, weight }) => (
              <>
                <Box>
                  <Typography component="span">
                    {intl.formatMessage(messages.voteKey)}:&nbsp;
                  </Typography>
                  <Typography component="span" sx={{ wordBreak: 'break-all' }}>
                    {voteKey}
                  </Typography>
                  {(ownVoteKey === voteKey) && (
                    <Typography component="span">
                      &nbsp;({intl.formatMessage(messages.ownVoteKey)})
                    </Typography>
                  )}
                </Box>
                <Box>
                  <Typography component="span">
                    {intl.formatMessage(messages.weight)}:&nbsp;
                  </Typography>
                  <Typography component="span">
                    {weight}
                  </Typography>
                </Box>
              </>
            ))          
          )}

        </Box>

        <Box
          sx={{
            padding: '32px',
            borderTop: '1px solid #DCE0E9',
            width: '100%',
            backgroundColor: '#fff',
            position: 'fixed',
            bottom: '0px',
          }}
        >
          {(submitDelegationWalletType === 'web') && (
            <TextField
              type="password"
              {...walletPasswordField.bind()}
              error={walletPasswordField.error}
            />
          )}
          
          {!isSubmitting && (
            <ErrorBlock error={submitDelegationError} />
          )}

          <Box sx={{ display: 'flex', gap: '15px' }}>
            <Button
              sx={{ minWidth: 0 }}
              fullWidth
              variant="outlined"
              color="primary"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              {intl.formatMessage(globalMessages.cancel)}
            </Button>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              disabled={
                (submitDelegationWalletType === 'web' && !walletPasswordField.isValid) ||
                  isSubmitting
              }
              onClick={this.submit.bind(this)}
              sx={{ minWidth: 0 }}
            >
              {intl.formatMessage(confirmButtonLabel)}
            </Button>
          </Box>
        </Box>

      </Box>
    );
  }
}

export default (injectIntl(SubmitDelegationPage): ComponentType<Props>);
