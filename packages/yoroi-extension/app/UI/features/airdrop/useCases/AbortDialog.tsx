import Dialog from '../../../../components/widgets/Dialog';
import { Box, Typography } from '@mui/material';
import { ReactComponent as Illustration } from '../../../../assets/images/transfer-success.inline.svg';
import { useStrings } from '../common/hooks/useStrings';

export default function AbortDialog(props: Readonly<{ onClose: () => void; onContinue: () => void }>) {
  const { onClose, onContinue } = props;
  const strings = useStrings();

  return (
    <Dialog
      title={strings.abortDialogTitle}
      dialogActions={[
        {
          label: strings.close,
          onClick: onClose,
        },
        {
          label: strings.continue,
          primary: true,
          onClick: onContinue,
        },
      ]}
    >
      <Box sx={{ display: 'flex' }}>
        <Illustration style={{ margin: 'auto' }} />
      </Box>
      <Typography variant="h5" color="ds.text_gray_medium" textAlign="center">
        {strings.abortDialogText1}
      </Typography>
      <Typography variant="body1" color="ds.text_gray_low" textAlign="center">
        {strings.abortDialogText2}
      </Typography>
    </Dialog>
  );
}
