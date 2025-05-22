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
  const { votingNextStep, registrationState, votingRegTx, walletType } = useVoting();
  const { error } = registrationState;
  const { intl } = useIntl();

  const handleSetPasswd = e => setPasswd(e.target.value);

  const renderInfoBlock = () => {
    if (walletType === 'mnemonic') {
      return (
        <Typography component="div" textAlign="center" pt="24px" pb="40px" variant="body1" color="ds.text_gray_medium">
          {strings.txStep}
        </Typography>
      );
    }

    return (
      <Box
        sx={{
          pt: '24px',
          pb: '40px',
          backgroundColor: 'ds.gray_50',
          padding: '10px',
          marginBottom: '30px',
          lineHeight: 1.38,
          fontSize: '14px',
          opacity: 0.7,
          letterSpacing: '0.5px',
          borderRadius: '10px',
        }}
      >
        <Typography component="div" textAlign="center" variant="body1" color="ds.text_gray_medium">
          <ul style={{ listStyle: 'disc', padding: 0, margin: 0, textAlign: 'left' }}>
            <li style={{ marginLeft: '18px', marginBottom: '8px' }}>
              {walletType === 'trezor' ? strings.txStepTrezor : strings.txStepLedger}
            </li>
            <li style={{ marginLeft: '18px' }}>{walletType === 'trezor' ? strings.txStepTrezor2 : strings.txStepLedger2}</li>
          </ul>
        </Typography>
      </Box>
    );
  };

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
        {renderInfoBlock()}

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

        {walletType === 'mnemonic' && (
          <PasswordInput
            label={strings.passwordLabel}
            value={passwd}
            onChange={handleSetPasswd}
            id="confirm-passwd"
            error={!!error}
            helperText={!!error ? intl.formatMessage(error) : ''}
            variant="outlined"
          />
        )}
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
