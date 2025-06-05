import { Button, Stack, Typography } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import globalMessages from '../../../i18n/global-messages';
import LocalizableError from '../../../i18n/LocalizableError';
import { FailedIlustration } from './FailedIlustration';

export const TransactionFailed = (props: { error: Error | null; onNext?: () => any }) => {
  const { error } = props;

  return (
    <Stack alignItems="center" mt="110px">
      <FailedIlustration />
      <Typography variant="h5" fontWeight="500" mt={4} mb={1}>
        <FormattedMessage {...globalMessages.transactionFailed} />
      </Typography>
      <Typography variant="body1" mb={2} color="ds.text_gray_low">
        <FormattedMessage {...(error instanceof LocalizableError ? error : globalMessages.transactionFailedInfo)} />
      </Typography>
      {/* @ts-ignore */}
      <Button variant="primary" onClick={props.onNext}>
        <FormattedMessage {...globalMessages.tryAgain} />
      </Button>
    </Stack>
  );
};
