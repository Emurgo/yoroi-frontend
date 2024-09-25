import { Button, Stack, Typography } from '@mui/material';
import React from 'react';
import { useHistory } from 'react-router-dom';
import { SuccessIlustration } from './SuccessIlustration';
// @ts-ignore
import { ROUTES } from '../../../routes-config';
// @ts-ignore
import { FormattedMessage } from 'react-intl';
import globalMessages from '../../../i18n/global-messages';

export const TransactionSubmitted = ({
  title,
  subtitle,
  content,
  btnText,
  onPress,
}: {
  title?: string;
  subtitle?: string;
  content?: string;
  btnText?: string;
  onPress?: () => void;
}) => {
  const history = useHistory();
  return (
    <Stack width="100%" alignItems="center" pt="143px" sx={{ maxWidth: '500px', margin: '0 auto' }}>
      <SuccessIlustration />
      <Typography variant="h5" fontWeight="500" mt="8px">
        {title ? title : <FormattedMessage {...globalMessages.transactionSubmitted} />}
      </Typography>
      {subtitle && (
        <Typography variant="body1" color="ds.gray_gray_medium" mt="8px">
          {subtitle}
        </Typography>
      )}

      <Typography variant="body1" mt="8px" color="ds.text_gray_low" textAlign="center" mb="16px">
        {content ? content : <FormattedMessage {...globalMessages.transactionSubmittedInfo} />}
      </Typography>
      <Button
        //  @ts-ignore
        variant="primary"
        onClick={() => {
          onPress ? onPress() : history.push(ROUTES.WALLETS.TRANSACTIONS);
        }}
      >
        {btnText ? btnText : <FormattedMessage {...globalMessages.goToTransactions} />}
      </Button>
    </Stack>
  );
};
