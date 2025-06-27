import { useState } from 'react';
import { RegistrationStepper } from '../RegistrationStepper';
import { Button, Box, Typography, Stack } from '@mui/material';
import { useStrings } from '../../hooks/useStrings';
import { PasswordInput } from '../../../../../components';
import { useVoting } from '../../hooks/useVoting';

export const PasswordStep = () => {
  const [passwd, setPasswd] = useState('');
  const strings = useStrings();
  const { votingNextStep, registrationState } = useVoting();
  const { error } = registrationState;

  const handleSetPasswd = e => setPasswd(e.target.value);

  return (
    <Stack direction="column" gap="24px" height="100%" pb="24px">
      <RegistrationStepper />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          justifyContent: 'space-evenly',
        }}
      >
        <Typography
          component="div"
          textAlign="center"
          pt="24px"
          pb="40px"
          variant="body1"
          color="ds.text_gray_medium"
          dangerouslySetInnerHTML={{ __html: strings.passwordStep }}
        />

        <PasswordInput
          label={strings.passwordLabel}
          value={passwd}
          onChange={handleSetPasswd}
          error={!!error}
          // TODO: add translation
          helperText={!!error ? 'Invalid password' : ''}
          id="confirm-passwd"
          variant="outlined"
        />
      </Box>
      <Box>
        <Button
          // @ts-ignore
          variant="primary"
          fullWidth
          onClick={() => votingNextStep(passwd)}
        >
          {strings.passwordStepButton}
        </Button>
      </Box>
    </Stack>
  );
};
