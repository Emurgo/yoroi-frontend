import BigNumber from 'bignumber.js';
import React, { useState } from 'react';
import { RegistrationStepper } from '../RegistrationStepper';
import { Button, Box, Typography, Stack } from '@mui/material';
import { useStrings } from '../../hooks/useStrings';
import { PasswordInput } from '../../../../../components';
import { AmountInput } from '../../../../../../components/common/NumericInputRP';
import { useVoting } from '../../hooks/useVoting';
import { useIntl } from '../../../../../context/IntlProvider';

export const TxStep = () => {
  const strings = useStrings();
  const [passwd, setPasswd] = useState('');
  const { votingNextStep, registrationState, votingRegTx } = useVoting();
  const { error } = registrationState;
  const { intl } = useIntl();

  const handleSetPasswd = e => setPasswd(e.target.value);

  return (
    <Stack direction="column" gap="24px" height="100%" pb="24px">
      <RegistrationStepper />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
        }}
      >
        <Typography
          component="div"
          textAlign="center"
          pt="24px"
          pb="40px"
          variant="body1"
          color="ds.text_gray_medium"
          dangerouslySetInnerHTML={{ __html: strings.txStep }}
        />

        <AmountInput
          className="amount"
          label={'amount'}
          decimalPlaces={votingRegTx?.decimalPlaces}
          disabled
          currency={votingRegTx?.currency}
          fees={votingRegTx?.fees}
          // note: we purposely don't put "total" since it doesn't really make sense here
          // since the fee is unrelated to the amount you're about to register
          total=""
          value={new BigNumber(0)}
          allowSigns={false}
        />

        <PasswordInput
          label={strings.passwordLabel}
          value={passwd}
          onChange={handleSetPasswd}
          id="confirm-passwd"
          error={!!error}
          helperText={!!error ? intl.formatMessage(error) : ''}
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
          {strings.register}
        </Button>
      </Box>
    </Stack>
  );
};
