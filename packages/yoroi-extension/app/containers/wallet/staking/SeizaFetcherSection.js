import { Box, Stack, Typography } from '@mui/material';
import { toSvg } from 'jdenticon';
import { TransactionResult } from '../../../UI/features/transaction-review/common/types';
import { useTxReviewModal } from '../../../UI/features/transaction-review/module/ReviewTxProvider';
import SeizaFetcher from './SeizaFetcher';
import { useStrings } from '../../../UI/features/transaction-review/common/hooks/useStrings';
import BigNumber from 'bignumber.js';
import { StyledLink } from '../../../components/wallet/staking/dashboard-revamp/StakePool/StakePool.styles';
import { useGovernanceStatusState } from '../../../UI/features/governace/common/hooks/useGovernanceStatusState';
import { useModal } from '../../../UI/components/modals/ModalContext';
import { GovernanceRequiredForRewards } from '../../../UI/features/staking/common/modals/GovernanceRequiredForRewards';
import { useYoroiRemoteConfig } from '../../../UI/common/hooks/useYoroiRemoteConfig';
import { dRepToMaybeCredentialHex } from '../../../api/ada/lib/cardanoCrypto/utils';

export const SeizaFetcherSection = ({ urlTemplate, locale, bias, totalAda, poolList, setFirstPool, stores }) => {
  const { openTxReviewModal, startLoadingTxReview, networkId, showTxResultModal } = useTxReviewModal();
  const { governanceStatus } = useGovernanceStatusState();
  const { openModal } = useModal();
  const isTestnet = networkId !== 0;
  const { data } = useYoroiRemoteConfig();
  const dRepID = data?.banners?.earnRewardsWithYoroi?.drepId;

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
            component: (
              <OperationsDetails
                avatarGenerated={avatarGenerated}
                poolName={selectedPool?.info.name}
                website={selectedPool.info.homepage}
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

  const onDelegateAndStake = async poolId => {
    const delegatingDRepId = isTestnet ? '232285cccbf305ca26e6098be9a13b45e3911d881d84c3502f82320cca' : dRepID;
    const avatarSource = toSvg(poolId, 36, { padding: 0 });
    const avatarGenerated = `data:image/svg+xml;utf8,${encodeURIComponent(avatarSource)}`;

    const drepCredential = dRepToMaybeCredentialHex(delegatingDRepId);
    if (!drepCredential) {
      console.error('Cannot convert DRep ID to a valid credential', delegatingDRepId);
    }

    const { signTxRequest } = await stores.delegation.createPoolOrDrepDelegationTransaction({
      poolId,
      drepCredential,
    });
    const selectedPool = await stores.delegation.getLocalPoolInfo(networkId, poolId);

    openTxReviewModal({
      modalView: 'transactionReview',
      submitTx: passwordInput => submitTx(passwordInput),
      operations: {
        components: [
          {
            component: (
              <OperationsDetails
                avatarGenerated={avatarGenerated}
                poolName={selectedPool?.info?.name}
                website={selectedPool.info?.homepage}
                drepId={delegatingDRepId}
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
    } catch (error) {
      console.warn('Failed to sign transaction', error);
      showTxResultModal(TransactionResult.FAIL);
    }
  };

  return (
    <Box sx={{ iframe: { minHeight: '60vh' } }}>
      <SeizaFetcher
        urlTemplate={urlTemplate}
        locale={locale}
        bias={bias}
        totalAda={totalAda}
        poolList={poolList}
        setFirstPool={setFirstPool}
        stakepoolSelectedAction={async poolId => {
          if (governanceStatus.status === 'none') {
            openModal({
              modalId: 'governance',
              title: 'Governance updates',
              content: (
                <GovernanceRequiredForRewards
                  onStake={() => onDelegate(poolId)}
                  onDelegateToDrep={() => onDelegateAndStake(poolId)}
                />
              ),
              width: '612px',
              height: '628px',
            });
          } else onDelegate(poolId);
        }}
      />
    </Box>
  );
};

const OperationsDetails = ({ avatarGenerated, poolName, website, drepId }) => {
  const { isStakeRegistered, stakeKeyDeposit, primaryTokenInfo } = useTxReviewModal();
  const strings = useStrings();
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
      {drepId && (
        <Stack direction="row" justifyContent="space-between" gap={16}>
          <Typography color="ds.text_gray_low" sx={{ width: '151px' }}>
            {strings.delegateVoting}
          </Typography>
          <Typography color="ds.text_gray_medium" sx={{ maxWidth: '300px', wordBreak: 'break-all' }}>
            {drepId}
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
          <StyledLink href={website} target="_blank" rel="noreferrer noopener">
            <Typography color="ds.text_gray_medium">{poolName}</Typography>
          </StyledLink>
        </Stack>
      </Stack>
    </Stack>
  );
};
