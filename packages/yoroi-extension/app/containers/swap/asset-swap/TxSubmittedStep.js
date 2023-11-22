//@flow
import { Box, Button, Typography } from '@mui/material';
import { ReactComponent as TxSuccessfulImage } from '../../../assets/images/revamp/tx-successful.inline.svg';
import { ReactComponent as TxFailureImage } from '../../../assets/images/revamp/tx-failure.inline.svg';

type Props = {|
  isSuccessful: boolean,
  onTryAgain: void => void,
|};

export default function TxSubmittedStep({
  isSuccessful,
  onTryAgain,
}: Props): React$Node {
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
        <Typography variant="h3" fontWeight={500} mb="4px">
          Transaction {isSuccessful ? 'submitted' : 'failed'}
        </Typography>
        <Typography variant="body1" color="grayscale.600">
          {isSuccessful
            ? 'Your transactions will be displayed both in the list of transaction and Open swap orders'
            : 'Your transaction has not been processed properly due to technical issues'}
        </Typography>
      </Box>
      <Box>
        <Button onClick={onTryAgain} variant="primary">
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
