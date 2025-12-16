import Dialog from '../../../../components/widgets/Dialog';
//import { useIntl, defineMessages } from 'react-intl';
import { Typography, Box, Button } from '@mui/material';
import { useEffect, useState } from 'react';
//import globalMessages from '../../../../i18n/global-messages';
import { getCollateralUtxos, getRedemptionTransaction } from '../../../../api/ada/midnight';

export default function Redeem(
  props: {
    address: string;
    wallet: any,
    onClose: () => void;
    onReorg: (signRequest: any) => void;
    onRedeem: (unsignedTxHex: string) => Promise<void>;
  }
) {
  const [getCollateralUtxosResult, setGetCollateralUtxosResult] = useState<any>(null);
  const [redemptionTxBuildingResponse, setRedemptionTxBuildingResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  void(error);

  const updateCollateralUtxos = async () => {
    const result = await getCollateralUtxos(props.wallet);
    setGetCollateralUtxosResult(result);
    if (result.state === 'exist') {
      try {
        const resp = await getRedemptionTransaction();
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
    content = '...';
  } else if (getCollateralUtxosResult.state === 'exist') {
    if (!redemptionTxBuildingResponse) {
      content = '...';
    } else {
      content = (
        <>
          <Box>
            <Typography>
              {redemptionTxBuildingResponse.redeemedAmount}
            </Typography>
          </Box>
          <Button
            onClick={async () => {
              await props.onRedeem(redemptionTxBuildingResponse.transaction);
              // todo: error handling
              props.onClose();
            }}
          >
            Redeem
          </Button>
        </>
      );
    }
  } else if (getCollateralUtxosResult.state === 'need-reorg') {
    content = (
      <Box>
        <Typography>Please re-orgnize the wallet for collateral UTxOs for redeeming</Typography>
        <Button
          onClick={async () => {
            await props.onReorg(getCollateralUtxosResult.signRequest);
            setGetCollateralUtxosResult(null);
            updateCollateralUtxos();
          }}
        >
          Confirm
        </Button>
      </Box>
    );
  } else if (getCollateralUtxosResult.state === 'not-enough') {
    content = 'not enough balance to redeem';
  } else {
    content = `Error when getting collaterals ${getCollateralUtxosResult.message}`;
  }
  
  return (
    <Dialog
      withCloseButton
      onClose={props.onClose}
      title={'claim'}
    >
      {content}
    </Dialog>
  );
}
