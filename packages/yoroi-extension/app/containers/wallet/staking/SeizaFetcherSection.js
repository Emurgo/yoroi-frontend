import { Box, Stack, Typography } from '@mui/material';
import { toSvg } from 'jdenticon';
import { TransactionResult } from '../../../UI/features/transaction-review/common/types';
import { useTxReviewModal } from '../../../UI/features/transaction-review/module/ReviewTxProvider';
import SeizaFetcher from './SeizaFetcher';
import { useStrings } from '../../../UI/features/transaction-review/common/hooks/useStrings';
import BigNumber from 'bignumber.js';

export const SeizaFetcherSection = ({ urlTemplate, locale, bias, totalAda, poolList, setFirstPool, stores }) => {
  const { openTxReviewModal, startLoadingTxReview, networkId, showTxResultModal } = useTxReviewModal();

  const onDelegate = async poolID => {
    const avatarSource = toSvg(poolID, 36, { padding: 0 });
    const avatarGenerated = `data:image/svg+xml;utf8,${encodeURIComponent(avatarSource)}`;
    const { signTxRequest } = await stores.delegation.createDelegationTransaction(poolID);
    const selectedPool = await stores.delegation.getLocalPoolInfo(networkId, poolID);

    openTxReviewModal({
      modalView: 'transactionReview',
      submitTx: passswordInput => submitTx(passswordInput),
      operations: {
        components: [
          {
            component: <OperationsDetails avatarGenerated={avatarGenerated} poolName={selectedPool?.info.name} />,
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

      // ampli.stakingCenterDelegationInitiated();
    } catch (error) {
      console.warn('Failed to sign transaction', error);
      showTxResultModal(TransactionResult.FAIL);
    }
  };

  return (
    <Box sx={{ iframe: { minHeight: '60vh' } }}>
      {/* {this.getDialog()} */}
      <SeizaFetcher
        urlTemplate={urlTemplate}
        locale={locale}
        bias={bias}
        totalAda={totalAda}
        poolList={poolList}
        setFirstPool={setFirstPool}
        stakepoolSelectedAction={async poolId => {
          onDelegate(poolId);
        }}
      />
    </Box>
  );
};

const OperationsDetails = ({ avatarGenerated, poolName }) => {
  const { isStakeRegistered, stakeKeyDeposit, primaryTokenInfo } = useTxReviewModal();
  const strings =  useStrings();
  return (
    <Stack direction="column" spacing={16}>
      {!isStakeRegistered && (
        <Stack direction="row" justifyContent="space-between">
          <Typography color="ds.text_gray_low">{strings.registerStakingKey}</Typography>
          <Typography color="ds.text_gray_medium">
            {`${new BigNumber(stakeKeyDeposit).shiftedBy(-primaryTokenInfo.decimals)} ${primaryTokenInfo.name}`}
          </Typography>
        </Stack>
      )}
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
