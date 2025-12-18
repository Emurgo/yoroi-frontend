import Dialog from '../../../../components/widgets/Dialog';
import { Typography, Box, Button } from '@mui/material';
import { useEffect, useState } from 'react';
import { getCollateralUtxos, getRedemptionTransaction } from '../../../../api/ada/midnight';
import { useStrings } from '../common/hooks/useStrings';
import LoadingSpinner from '../../../../components/widgets/LoadingSpinner';
import { formatNumberExactly } from '../../../../api/ada/midnightRedemption';

export default function Redeem(props: {
  address: string;
  wallet: any;
  onClose: () => void;
  onReorg: (signRequest: any) => void;
  onRedeem: (unsignedTxHex: string) => Promise<void>;
  endpoint: string;
}) {
  const strings = useStrings();
  const [getCollateralUtxosResult, setGetCollateralUtxosResult] = useState<any>(null);
  const [redemptionTxBuildingResponse, setRedemptionTxBuildingResponse] = useState<any>(null);
  const [isWaitingForReorgTxToConfirm, setIsWaitingForReorgTxToConfirm] = useState<boolean>(false);

  const updateCollateralUtxos = async () => {
    const result = await getCollateralUtxos(props.wallet);
    setGetCollateralUtxosResult(result);
    if (result.state === 'exist') {
      for (;;) {
        try {
          const resp = await getRedemptionTransaction(
            props.address,
            props.endpoint,
            result.fundingUtxoAddr,
            result.collateralUtxos,
            [result.fundingUtxo],
          );
          setRedemptionTxBuildingResponse(resp);
        } catch {
        }
        await new Promise(resolve => setTimeout(resolve, 10*1000));
      }
    }
  };

  useEffect(() => {
    updateCollateralUtxos();
  }, [props.address]);

  let content;
  const spinner = (
    <Box sx={{ height: '36px' /* to supress a bug in <Dialog> that shows the vertical scroll bar */}}>
      <LoadingSpinner />
    </Box>
  );
  if (getCollateralUtxosResult === null) {
    content = spinner;
  } else if (getCollateralUtxosResult.state === 'exist') {
    if (!redemptionTxBuildingResponse) {
      content = isWaitingForReorgTxToConfirm ? (
        <Box>
          <Typography sx={{ textAlign: 'center' }}>
            {strings.waitingForReorg}
          </Typography>
          <LoadingSpinner />
        </Box>
      ) : spinner;
    } else {
      content = (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Typography sx={{ textAlign: 'center' }}>
            {strings.redeemReady(formatNumberExactly(redemptionTxBuildingResponse.redeemedAmount))}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            sx={{ margin: '0 auto', display: 'block' }}
            onClick={async () => {
                await props.onRedeem(redemptionTxBuildingResponse.transaction);
                // todo: error handling
                props.onClose();
              }}
            >
              {strings.redeemButton}
          </Button>
        </Box>
      );
    }
  } else if (getCollateralUtxosResult.state === 'need-reorg') {
    content = (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Typography sx={{ textAlign: 'center' }}>{strings.redeemReorgMessage}</Typography>
        <Button
          variant="contained"
          color="primary"
          sx={{ margin: '0 auto', display: 'block' }}
          onClick={async () => {
            await props.onReorg(getCollateralUtxosResult.signRequest);
            setGetCollateralUtxosResult(null);
            setIsWaitingForReorgTxToConfirm(true);
            updateCollateralUtxos();
          }}
        >
          {strings.confirm}
        </Button>
      </Box>
    );
  } else if (getCollateralUtxosResult.state === 'not-enough') {
    content = (
      <Box sx={{ minHeight: '17px', textAlign: 'center' }}>
        {strings.redeemNotEnoughBalance}
      </Box>
    );
  } else {
    content = (
      <Box sx={{ minHeight: '17px', textAlign: 'center' }}>
        {strings.redeemErrorGettingCollaterals(getCollateralUtxosResult.message)}
      </Box>
    );
  }

  return (
    <Dialog withCloseButton onClose={props.onClose} title={strings.redeemDialogTitle}>
      {content}
    </Dialog>
  );
}
