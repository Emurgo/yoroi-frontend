import Dialog from '../../../../components/widgets/Dialog';
import { useIntl, defineMessages } from 'react-intl';
import { Typography, Box, Button } from '@mui/material';
import { useEffect, useState } from 'react';
import globalMessages from '../../../../i18n/global-messages';
import { getCollateralUtxos } from '../../../../api/ada/midnight';

export default function Redeem(
  props: {
    address: string;
    onClose: () => void;
    onReorg: (signRequest: any) => void;
    onRedeem: async (unsignedTxHex: string) => void;
  }
) {
  const [error, setError] = useState(null);
  const [getCollateralUtxosResult, setGetCollateralUtxosResult] = useState(null);
  const [redemptionTxBuildingResponse, setRedemptionTxBuildingResponse] = useState(null);

  const updateCollateralUtxos = async () => {
    const result = await getCollateralUtxos(props.wallet);
    setGetCollateralUtxosResult(result);
    if (result.state === 'exist') {
      try {
        const resp = await getRedemptionTransaction();
      } catch (error) {
        setError(error.message);
      }
      setRedemptionTxBuildingResponse(resp);
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
    }
    content = (
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
      />
        Redeem
      </Button>
    );
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
