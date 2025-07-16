import { useMemo, useState } from 'react';
import { RegistrationStepper } from '../RegistrationStepper';
import {Button, Box, Typography, Stack, Link} from '@mui/material';
import { useStrings } from '../../hooks/useStrings';
import { PasswordInput } from '../../../../../components';
import { useVoting } from '../../hooks/useVoting';
import LocalizableError from '../../../../../../i18n/LocalizableError';
import { useIntl } from 'react-intl';
import globalMessages from '../../../../../../i18n/global-messages';

export const PasswordStep = () => {
  const [passwd, setPasswd] = useState('');
  const strings = useStrings();
  const intl = useIntl();
  const { votingNextStep, registrationState } = useVoting();
  const { error } = registrationState;

  const handleSetPasswd = e => setPasswd(e.target.value);

  const errorText = useMemo(() => {
    if (error instanceof LocalizableError) {
      return intl.formatMessage(error);
    }
    if (error) {

      const supportRequestLink = (
        <Link
          href="https://emurgohelpdesk.zendesk.com/hc/en-us/requests/new?ticket_form_id=360013330335"
          target="_blank"
          rel="noreferrer"
        >
          {intl.formatMessage(globalMessages.here)}
        </Link>
      );

      return intl.formatMessage(globalMessages.forMoreHelp, { supportRequestLink });
    }
    return '';
  }, [error]);

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
          helperText={errorText}
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
