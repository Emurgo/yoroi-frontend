import { Box, Button, Stack, Typography } from '@mui/material';
import BigNumber from 'bignumber.js';
import { toSvg } from 'jdenticon';
import { TransactionResult } from '../../../../UI/features/transaction-review/common/types';
import { useTxReviewModal } from '../../../../UI/features/transaction-review/module/ReviewTxProvider';
import { observer } from 'mobx-react';
import { useStrings } from '../../../../UI/features/transaction-review/common/hooks/useStrings';

export const DelegateButton = observer(({ stores, label, disabled, poolName, poolID }) => {
  const {
    openTxReviewModal,
    startLoadingTxReview,
    stakeKeyDeposit,
    primaryTokenInfo,
    showTxResultModal,
    networkId,
  } = useTxReviewModal();
  const isTestnet = networkId !== 0;

  const avatarSource = toSvg(poolID, 36, { padding: 0 });
  const avatarGenerated = `data:image/svg+xml;utf8,${encodeURIComponent(avatarSource)}`;
  const onDelegate = async () => {
    const id = isTestnet ? poolID ?? '7facad662e180ce45e5c504957cd1341940c72a708728f7ecfc6e349' : poolID;
    const { signTxRequest } = await stores.delegation.createDelegationTransaction(id);

    openTxReviewModal({
      modalView: 'transactionReview',
      submitTx: passswordInput => submitTx(passswordInput),
      operations: {
        components: [
          {
            component: (
              <OperationsDetails
                avatarGenerated={avatarGenerated}
                poolName={poolName}
                stakeKeyDeposit={`${new BigNumber(stakeKeyDeposit).shiftedBy(-primaryTokenInfo.decimals)} ${primaryTokenInfo.name}`}
              />
            ),
            duplicated: false,
          },
        ],
        kind: 'delegate',
      },
      unsignedTx: signTxRequest.unsignedTx,
    });
  };

  const submitTx = async passswordInput => {
    const selectedWallet = stores.wallets.selected;
    try {
      startLoadingTxReview();
      await stores.substores.ada.delegationTransaction.signTransaction({
        password: passswordInput,
        wallet: selectedWallet,
        dialog: null,
      });
      showTxResultModal(TransactionResult.SUCCESS);
      // ampli.stakingCenterDelegationSubmitted({
      //   ada_amount: delegationTx.totalAmountToDelegate.getDefault().shiftedBy(-numberOfDecimals).toNumber(),
      //   staking_pool: selectedPoolId,
      // });
    } catch (error) {
      console.warn('Delegation error', error);
      showTxResultModal(TransactionResult.FAIL);
    }
  };

  return (
    <Button
      variant="primary"
      sx={{
        '&.MuiButton-sizeMedium': {
          padding: '9px 20px',
        },
      }}
      onClick={onDelegate}
      disabled={disabled}
    >
      {label}
    </Button>
  );
});

const OperationsDetails = ({ avatarGenerated, poolName, stakeKeyDeposit }) => {
  const strings =  useStrings();
  return (
    <Stack direction="column" spacing={16}>
      <Stack direction="row" justifyContent="space-between">
        <Typography color="ds.text_gray_low">{strings.registerStakingKey}</Typography>
        <Typography color="ds.text_gray_medium">{stakeKeyDeposit}</Typography>
      </Stack>
      <Stack direction="row" justifyContent="space-between">
        <Typography color="ds.text_gray_low">{strings.stakeWalletBalance}</Typography>
        <Stack direction="row" spacing={8} alignItems="center">
          <Box
            sx={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              display: 'inline-block',
            }}
            component="img"
            src={avatarGenerated}
          />
          <Typography color="ds.text_gray_medium">{poolName}</Typography>
        </Stack>
      </Stack>
    </Stack>
  );
};
