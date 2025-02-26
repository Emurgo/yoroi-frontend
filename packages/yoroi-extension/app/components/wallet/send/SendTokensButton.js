import { Button, styled } from '@mui/material';
import React from 'react';

export const SendTokensButton = ({ disabled, onNext, label, stores }) => {
  const handleSubmit = async () => {
    const signTxRequest = stores.transactionBuilderStore.updateTentativeTx();
    const txBodyjson = await signTxRequest.unsignedTx.build_tx().to_json();
    const parsedUnsignedTx = JSON.parse(txBodyjson);
    console.log('parsedUnsignedTx', parsedUnsignedTx);
  };
  return (
    <ActionButton
      key="amount-next"
      variant="primary"
      size="medium"
      onClick={handleSubmit}
      disabled={disabled}
      id="wallet:send:addAssetsStep-nextToConfirmTransaction-button"
    >
      {label} modal
    </ActionButton>
  );
};

const ActionButton = styled(Button)(() => ({
  minWidth: '128px',
  '&.MuiButton-sizeMedium': {
    padding: '13px 24px',
  },
}));
