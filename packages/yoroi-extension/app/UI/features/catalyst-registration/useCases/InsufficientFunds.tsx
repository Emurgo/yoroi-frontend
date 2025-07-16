import { Box, Typography } from '@mui/material';
import { useStrings } from '../common/hooks/useStrings';
import { useVoting } from '../common/hooks/useVoting';
import { InsufficientFunds } from '../../../components/ilustrations';

const InsufficientFundsPage = () => {
  const strings = useStrings();
  const { shouldHideBalance, balanceAmount, votingMinAmount, tokenName } = useVoting();

  return (
    <Box
      sx={{
        display: 'flex',
        height: '100%',
        width: '100%',
        flexDirection: 'column',
        gap: '16px',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <InsufficientFunds />
      <Typography component="div" variant="h5" fontWeight={500} color="ds.text_gray_medium">
        {strings.insufficientFundsTitle}
      </Typography>
      <Typography textAlign="center" component="div" variant="body1" color="ds.text_gray_low" maxWidth="480px">
        {shouldHideBalance
          ? strings.insufficientFundsSubtitleHidden(votingMinAmount.toString(), tokenName)
          : strings.insufficientFundsSubtitle(votingMinAmount.toString(), tokenName, balanceAmount.toString())}
      </Typography>
    </Box>
  );
};

export default InsufficientFundsPage;
