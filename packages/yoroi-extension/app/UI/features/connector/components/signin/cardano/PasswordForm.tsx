import React, { useState } from 'react';
import { TextField, Button, Stack } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { WrongPassphraseError } from '../../../../../../api/ada/lib/cardanoCrypto/cryptoErrors';

interface PasswordFormProps {
  onSubmit: (password: string) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export const PasswordForm: React.FC<PasswordFormProps> = ({
  onSubmit,
  onCancel,
  isSubmitting
}) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    try {
      await onSubmit(password);
    } catch (err) {
      if (err instanceof WrongPassphraseError) {
        setError('api.errors.IncorrectPasswordError');
      } else {
        throw err;
      }
    }
  };

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
    setError('');
  };

  return (
    <Stack spacing={2}>
      <TextField
        type="password"
        value={password}
        onChange={handlePasswordChange}
        error={!!error}
        helperText={error && <FormattedMessage id={error} />}
        fullWidth
        margin="normal"
        InputProps={{
          'aria-label': 'Password',
        }}
      />
      <Stack direction="row" spacing={2}>
        <Button
          variant="outlined"
          fullWidth
          onClick={onCancel}
          disabled={isSubmitting}
        >
          <FormattedMessage id="global.backButtonLabel" />
        </Button>
        <Button
          variant="contained"
          fullWidth
          onClick={handleSubmit}
          disabled={!password || isSubmitting}
        >
          <FormattedMessage id="global.confirm" />
        </Button>
      </Stack>
    </Stack>
  );
};

export default PasswordForm; 