import { Button, Stack, Typography } from '@mui/material';
import { NoTransactions } from '../../../../components/ilustrations/NoTransactions';
import links from '../../../../../links';
import { useStrings } from '../../common/hooks/useStrings';
import { useGovernance } from '../../module/GovernanceContextProvider';
import { networks } from '../../../../../api/ada/lib/storage/database/prepackaged/networks';

export const NotAllowedInGovernance = () => {
  const { walletAdaBalance, triggerBuySellAdaDialog, networkId } = useGovernance();
  const strings = useStrings();

  const isTestnet = networkId !== networks.CardanoMainnet.NetworkId;

  return (
    <Stack alignItems="center" margin="0 auto" mt="185px" maxWidth="500px">
      <NoTransactions />
      <Typography
        variant="h3"
        fontSize="20px"
        lineHeight="30px"
        fontWeight="500"
        mt="32px"
        textAlign="center"
        color="ds.text_gray_medium"
      >
        {strings.needAdaForParticipation}
      </Typography>

      <Button
        // @ts-ignore
        variant="primary"
        sx={{ marginTop: '16px' }}
        onClick={() => {
          if (isTestnet) {
            window.open(links.testnetFaucet, '_blank');
          } else {
            // @ts-ignore
            triggerBuySellAdaDialog();
          }
        }}
      >
        {isTestnet ? strings.goToFaucet : 'Buy Ada'}
      </Button>
    </Stack>
  );
};
