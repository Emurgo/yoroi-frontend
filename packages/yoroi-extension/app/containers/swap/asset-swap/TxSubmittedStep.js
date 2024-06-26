//@flow
import { Box, Button, Typography } from '@mui/material';
import { ReactComponent as TxFailureImage } from '../../../assets/images/revamp/tx-failure.inline.svg';
import { ReactComponent as TxSuccessfulImage } from '../../../assets/images/revamp/tx-submitted.inline.svg';

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
      width="404px"
      mx="auto"
      mt="131px"
    >
      <Box>{isSuccessful ? <TxSuccessfulImage /> : <TxFailureImage />}</Box>
      <Box textAlign="center">
        <Typography component="div" variant="h3" fontWeight={500} mb="4px">
          Transaction {isSuccessful ? 'submitted' : 'failed'}
        </Typography>
        <Typography component="div" variant="body1" color="grayscale.600">
          {isSuccessful
            ? 'Check this transaction in the list of wallet transactions'
            : 'Your transaction has not been processed properly due to technical issues'}
        </Typography>
      </Box>
      <Box>
        <Button onClick={isSuccessful ? onSuccess : onTryAgain} variant="primary">
          {isSuccessful ? 'Go to transactions' : 'Try again'}
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
