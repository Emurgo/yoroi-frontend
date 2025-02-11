import { Button, Stack, Typography } from '@mui/material';
import { observer } from 'mobx-react';
import React, { useEffect } from 'react';
import { GovernanceParticipateDialog } from '../../../../containers/wallet/dialogs/GovernanceParticipateDialog';
import { useTxReviewModal } from '../../../../UI/features/transaction-review/module/ReviewTxProvider';

export const WithdrawButton = observer(({ label, govStatusFetched, stores }) => {
  const { openTxReviewModal } = useTxReviewModal();

  const isParticipatingToGovernance = stores.delegation.governanceStatus?.drepDelegation !== null;
  const wallet = stores.wallets.selected;
  const isStakeRegistered = stores.delegation.isStakeRegistered(wallet.publicDeriverId);

  useEffect(() => {
    // const unsigned = stores.substores.ada.delegationTransaction.createWithdrawalTxForWallet({ wallet });
    // console.log('useEffect unsigned', unsigned);
  }, []);

  const handleRewardsWithdrawal = async () => {
    if (!isParticipatingToGovernance) {
      stores.uiDialogs.open({
        dialog: GovernanceParticipateDialog,
      });
      return;
    }
    console.log('TESTSTSTTST handleRewardsWithdrawal');
    createWithdrawalTx();
    // ampli.claimAdaPageViewed();
  };

  const createWithdrawalTx = async () => {
    const wallet = stores.wallets.selectedOrFail;
    stores.substores.ada.delegationTransaction.setShouldDeregister(false);
    const unsignedTx = await stores.substores.ada.delegationTransaction.createWithdrawalTxForWallet({ wallet });
    // stores.uiDialogs.open({
    //   dialog: WithdrawRewardsDialog,
    // });
    // const signRequest = await stores.substores.ada.delegationTransaction.createWithdrawalTx.result;
    // const tentativeTx = await stores.substores.ada.delegationTransaction.createWithdrawalTx.result;

    const txBodyjson = await unsignedTx.unsignedTx.build_tx().to_json();
    const parsedUnsignedTx = JSON.parse(txBodyjson);
    console.log('parsedUnsignedTx', parsedUnsignedTx);

    openTxReviewModal({
      title: 'Transaction review',
      modalView: 'transactionReview',
      submitTx: pasword => {},
      operationFee: {
        total: 2222222,
      },
      operations: {
        components: [{ component: <OperationsDetails />, duplicated: false }],
      },
      unsignedTx: parsedUnsignedTx, // Ensure it stays in sync with the store
    });
  };

  return (
    <Button
      variant="primary"
      sx={{
        '&.MuiButton-sizeMedium': {
          height: 'unset',
          p: '9px 20px',
        },
      }}
      onClick={isStakeRegistered && govStatusFetched ? handleRewardsWithdrawal : undefined}
      disabled={!handleRewardsWithdrawal}
    >
      {label}
    </Button>
  );
});

const OperationsDetails = () => {
  return (
    <Stack direction="row" justifyContent="space-between">
      <Typography color="ds.text_gray_low">Staking</Typography>
      <Typography color="ds.text_gray_medium">Rewards withdrawal</Typography>
    </Stack>
  );
};
