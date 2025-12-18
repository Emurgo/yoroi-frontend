import Dialog from '../../../../components/widgets/Dialog';
import { Typography } from '@mui/material';
import { useState } from 'react';
import { WrongPassphraseError } from '../../../../api/ada/lib/cardanoCrypto/cryptoErrors';
import TextField from '../../../../components/common/TextField';
import { useStrings } from '../common/hooks/useStrings';

export default function ClaimDialog(
  props: Readonly<{ onClose: () => void; onClaim: (password: string) => Promise<void>; message: string }>
) {
  const strings = useStrings();
  const wrongPasswordErrorMessage = strings.wrongPassword;
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
        if (error.message.startsWith('Error 403')) {
          setError(strings.error403);
        } else {
          setError(strings.errorNotResponding);
        }
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
      title={strings.claimDialogTitle}
      dialogActions={[
        {
          label: strings.claimDialogTitle,
          primary: true,
          disabled: password.length === 0 || isClaiming,
          onClick: onClaim,
        },
      ]}
    >
      <Typography variant="body1" color="ds.text_gray_medium">
        {strings.mnemonicClaimDialogText}
      </Typography>
      <Typography variant="body1" color="ds.text_gray_low" sx={{ marginTop: '16px' }}>
        {strings.messageLabel}
      </Typography>
      <Typography variant="body1" color="ds.text_gray_medium" sx={{ marginBottom: '16px' }}>
        {props.message}
      </Typography>
      <TextField
        error={passwordError}
        type="password"
        className="walletPassword"
        value={password}
        label={strings.passwordLabel}
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
