import Dialog from '../../../../components/widgets/Dialog';
import { Box, Typography } from '@mui/material';
import { useState } from 'react';
import LoadingSpinner from '../../../../components/widgets/LoadingSpinner';
import { useStrings } from '../common/hooks/useStrings';

export default function LedgerClaimDialog(
  props: Readonly<{
    onClose: () => void;
    message: string;
    onClaim: (_password: string) => Promise<void>;
  }>
) {
  const strings = useStrings();

  const [error, setError] = useState<string | null>(null);
  const [isClaiming, setIsClaiming] = useState(false);

  const onClaim = async () => {
    setIsClaiming(true);
    setError(null);
    try {
      await props.onClaim('');
    } catch (error) {
      if (error instanceof Error) {
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
      title={strings.claimDialogTitle}
      dialogActions={[
        {
          label: strings.claimDialogTitle,
          primary: true,
          disabled: isClaiming,
          onClick: onClaim,
        },
      ]}
    >
      <Typography variant="body1" color="ds.text_gray_medium">
        {strings.ledgerClaimDialogText}
      </Typography>
      {isClaiming ? (
        <Box sx={{ marginTop: '16px', marginBottom: '16px' }}>
          <LoadingSpinner />
        </Box>
      ) : (
        <Box sx={{ height: '39px' }}></Box>
      )}
      <Typography variant="body1" color="ds.text_gray_low">
        {strings.messageLabel}
      </Typography>
      <Typography variant="body1" color="ds.text_gray_medium">
        {props.message}
      </Typography>
      <Typography component="div" variant="body2" color="ds.text_error">
        {error}
      </Typography>
    </Dialog>
  );
}
