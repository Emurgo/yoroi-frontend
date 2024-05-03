//@flow
import { Box, Button, Typography } from '@mui/material';
import { ReactComponent as TxSuccessfulImage } from '../../../assets/images/revamp/tx-successful.inline.svg';
import { ReactComponent as TxFailureImage } from '../../../assets/images/revamp/tx-failure.inline.svg';
import type { State } from '../context/swap-form/types';

type Props = {|
  txSubmitErrorState: State<?Error>,
  onTryAgain: void => void,
  onSuccess: void => void,
|};

export default function TxSubmittedStep({
  txSubmitErrorState,
  onTryAgain,
  onSuccess,
}: Props): React$Node {
  const isSuccessful = txSubmitErrorState.value == null;
  return (
    <Box
      display="flex"
      flexDirection="column"
      gap="16px"
      alignItems="center"
      width="400px"
      mx="auto"
      mt="80px"
    >
      <Box>{isSuccessful ? <TxSuccessfulImage /> : <TxFailureImage />}</Box>
      <Box textAlign="center">
        <Typography component="div" variant="h3" fontWeight={500} mb="4px">
          Transaction {isSuccessful ? 'submitted' : 'failed'}
        </Typography>
        <Typography component="div" variant="body1" color="ds.gray_c600">
          {isSuccessful
            ? 'Your transactions will be displayed both in the list of transaction and Open swap orders'
            : 'Your transaction has not been processed properly due to technical issues'}
        </Typography>
      </Box>
      <Box>
        <Button onClick={isSuccessful ? onSuccess : onTryAgain} variant="primary">
          {isSuccessful ? 'Go to orders' : 'Try again'}
        </Button>
      </Box>
      {!isSuccessful && (
        <Box>
          <Button variant="tertiary" color="primary">
            Download log file
          </Button>
        </Box>
      )}
    </Box>
  );
}
