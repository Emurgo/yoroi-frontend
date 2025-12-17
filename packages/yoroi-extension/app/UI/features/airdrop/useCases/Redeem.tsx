import Dialog from '../../../../components/widgets/Dialog';
import { Typography, Box, Button } from '@mui/material';
import { useEffect, useState } from 'react';
import { getCollateralUtxos, getRedemptionTransaction } from '../../../../api/ada/midnight';
import { useStrings } from '../common/hooks/useStrings';

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
  const [error, setError] = useState<string | null>(null);
  void error;

  const updateCollateralUtxos = async () => {
    const result = await getCollateralUtxos(props.wallet);
    setGetCollateralUtxosResult(result);
    if (result.state === 'exist') {
      try {
        const resp = await getRedemptionTransaction(
          props.address,
          props.endpoint,
          result.fundingUtxoAddr,
          result.collateralUtxoIds,
          [result.fundingUtxoId],
        );
        setRedemptionTxBuildingResponse(resp);
      } catch (err: any) {
        setError(err.message);
      }
    }
  };

  useEffect(() => {
    updateCollateralUtxos();
  }, [props.address]);

  let content;
  if (getCollateralUtxosResult === null) {
    content = strings.redeemLoading;
  } else if (getCollateralUtxosResult.state === 'exist') {
    if (!redemptionTxBuildingResponse) {
      content = strings.redeemLoading;
    } else {
      content = (
        <>
          <Box>
            <Typography>{redemptionTxBuildingResponse.redeemedAmount}</Typography>
          </Box>
          <Button
            onClick={async () => {
              await props.onRedeem(redemptionTxBuildingResponse.transaction);
              // todo: error handling
              props.onClose();
            }}
          >
            {strings.redeemButton}
          </Button>
        </>
      );
    }
  } else if (getCollateralUtxosResult.state === 'need-reorg') {
    content = (
      <Box>
        <Typography>{strings.redeemReorgMessage}</Typography>
        <Button
          onClick={async () => {
            await props.onReorg(getCollateralUtxosResult.signRequest);
            setGetCollateralUtxosResult(null);
            updateCollateralUtxos();
          }}
        >
          {strings.redeemConfirmButton}
        </Button>
      </Box>
    );
  } else if (getCollateralUtxosResult.state === 'not-enough') {
    content = strings.redeemNotEnoughBalance;
  } else {
    content = strings.redeemErrorGettingCollaterals(getCollateralUtxosResult.message || '');
  }

  return (
    <Dialog withCloseButton onClose={props.onClose} title={strings.redeemDialogTitle}>
      {content}
    </Dialog>
  );
}
