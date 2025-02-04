//@flow
import type { State } from '../context/swap-form/types';
import { Box, Button, Typography } from '@mui/material';
import { ReactComponent as TxFailureImage } from '../../../assets/images/revamp/tx-failure.inline.svg';
import { ReactComponent as TxSuccessfulImage } from '../../../assets/images/revamp/tx-submitted.inline.svg';
import { useStrings } from '../common/useStrings';

type Props = {|
  txSubmitErrorState: State<?Error>,
  onTryAgain: void => void,
  onSuccess: void => void,
  onDownloadLogs: void => void,
|};

export default function TxSubmittedStep({ txSubmitErrorState, onTryAgain, onSuccess, onDownloadLogs }: Props): React$Node {
  const strings = useStrings();
  const isSuccessful = txSubmitErrorState.value == null;
  return (
    <Box display="flex" flexDirection="column" gap="16px" alignItems="center" width="404px" mx="auto" mt="131px">
      <Box>{isSuccessful ? <TxSuccessfulImage /> : <TxFailureImage />}</Box>
      <Box textAlign="center">
        <Typography component="div" variant="h3" fontWeight={500} mb="4px" color="ds.text_gray_medium">
          {isSuccessful ? strings.txSubmitted : strings.txFailed}
        </Typography>
        <Typography component="div" variant="body1" color="ds.text_gray_medium">
          {isSuccessful ? strings.checkTx : strings.txNotProcessed}
        </Typography>
      </Box>
      <Box>
        <Button onClick={isSuccessful ? onSuccess : onTryAgain} variant="primary">
          {isSuccessful ? strings.goToTxs : strings.tryAgain}
        </Button>
      </Box>
      {!isSuccessful && (
        <Box>
          <Button variant="tertiary" color="primary" onClick={onDownloadLogs}>
            {strings.downloadLogFile}
          </Button>
        </Box>
      )}
    </Box>
  );
}
