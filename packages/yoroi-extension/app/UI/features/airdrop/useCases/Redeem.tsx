import Dialog from '../../../../components/widgets/Dialog';
import { useIntl, defineMessages } from 'react-intl';
import { Typography, Box, Button } from '@mui/material';
import { useEffect, useState } from 'react';
import globalMessages from '../../../../i18n/global-messages';
import { getCollateralUtxos } from '../../../../api/ada/midnight';

export default function Redeem(
  props: { address: string; onClose: () => void; onReorg: (signRequest: any) => void }
) {
  const [getCollateralUtxosResult, setGetCollateralUtxosResult] = useState(null);

  const updateCollateralUtxos = async () => {
    const result = await getCollateralUtxos(props.wallet);
    setGetCollateralUtxosResult(result);
  };

  useEffect(() => {
    updateCollateralUtxos();
  }, [props.address]);


  let content;
  if (getCollateralUtxosResult === null) {
    content = '...';
  } else if (getCollateralUtxosResult.state === 'exist') {
    content = JSON.stringify(getCollateralUtxosResult, null, 2);
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
