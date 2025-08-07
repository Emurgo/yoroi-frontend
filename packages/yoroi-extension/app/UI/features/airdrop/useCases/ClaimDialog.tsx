import Dialog from '../../../../components/widgets/Dialog';
import { useIntl, defineMessages } from 'react-intl';
import { Typography } from '@mui/material';
import { useState } from 'react';
import { WrongPassphraseError } from '../../../../api/ada/lib/cardanoCrypto/cryptoErrors';
import TextField from '../../../../components/common/TextField';
import globalMessages from '../../../../i18n/global-messages';

const messages = defineMessages({
  claimDialogTitle: {
    id: 'airdrop.claimDialogTitle',
    defaultMessage: '!!!sign message',
  },
  messageLabel: {
    id: 'airdrop.messageLabel',
    defaultMessage: '!!!Message',
  },
  wrongPassword: {
    id: 'airdrop.wrongPassword',
    defaultMessage: '!!!Wrong password',
  },
  mnemonicClaimDialogText: {
    id: 'airdrop.mnemonicClaimDialogText',
    defaultMessage:
      '!!!Please sign message to prove ownership of your assets. Signing this message will not affect your wallet’s balance in any way and does not require you to pay any fees.',
  },
});

export default function ClaimDialog(
  props: Readonly<{ onClose: () => void; onClaim: (password: string) => Promise<void>; message: string }>
) {
  const intl = useIntl();
  const wrongPasswordErrorMessage = intl.formatMessage(messages.wrongPassword);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isClaiming, setIsClaiming] = useState(false);

  const onClaim = async () => {
    setIsClaiming(true);
    setError(null);
    try {
      await props.onClaim(password);
    } catch (error) {
      if (error instanceof WrongPassphraseError) {
        setPasswordError(wrongPasswordErrorMessage);
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(String(error));
      }
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <Dialog
      withCloseButton
      onClose={props.onClose}
      title={intl.formatMessage(messages.claimDialogTitle)}
      dialogActions={[
        {
          label: intl.formatMessage(messages.claimDialogTitle),
          primary: true,
          disabled: password.length === 0 || isClaiming,
          onClick: onClaim,
        },
      ]}
    >
      <Typography variant="body1" color="ds.text_gray_medium">
        {intl.formatMessage(messages.mnemonicClaimDialogText)}
      </Typography>
      <Typography variant="body1" color="ds.text_gray_low" sx={{ marginTop: '16px' }}>
        {intl.formatMessage(messages.messageLabel)}
      </Typography>
      <Typography variant="body1" color="ds.text_gray_medium" sx={{ marginBottom: '16px' }}>
        {props.message}
      </Typography>
      <TextField
        error={passwordError}
        type="password"
        className="walletPassword"
        value={password}
        label={intl.formatMessage(globalMessages.passwordLabel)}
        isLoading={isClaiming}
        onChange={e => {
          if (error === wrongPasswordErrorMessage) {
            setPasswordError(null);
          }
          setPassword(e.target.value);
        }}
        autoFocus
      />
      <Typography component="div" variant="body2" color="ds.text_error">
        {error}
      </Typography>
    </Dialog>
  );
}
