import React from 'react';
import { Box, Button, Link, Stack, styled, Typography } from '@mui/material';
import BigNumber from 'bignumber.js';
import { toSvg } from 'jdenticon';
import { getSocialMediaLinks } from './UndelegateButton';
import { TransactionResult } from '../../../transaction-review/common/types';
import { useTxReviewModal } from '../../../transaction-review/module/ReviewTxProvider';
import { useStrings } from '../../../transaction-review/common/hooks/useStrings';
import { SocialLinks } from '../../common/types';
import { useGovernanceStatusState } from '../../../governace/common/hooks/useGovernanceStatusState';
import { useModal } from '../../../../components/modals/ModalContext';
import { GovernanceRequiredForRewards } from '../../common/modals/GovernanceRequiredForRewards';
import { dRepToMaybeCredentialHex } from '../../../../../api/ada/lib/cardanoCrypto/utils';
import { useYoroiRemoteConfig } from '../../../../common/hooks/useYoroiRemoteConfig';

type SocialMediaInfo = {
  socialLinks?: SocialLinks;
  websiteUrl?: string;
};

type DelegateButtonProps = {
  stores: any;
  label: React.ReactNode;
  disabled?: boolean;
  poolID: string;
  poolName: string;
  dRepID?: string;
  socialMediaInfo?: SocialMediaInfo;
  btnVariant?: 'primary' | 'secondary';
  delegateAndStake?: boolean;
};

const StyledLink: any = styled(Link)(({ theme }: any) => ({
  marginRight: '5px',
  color: 'inherit',
  '& svg': {
    '& path': {
      fill: theme.palette.ds.el_gray_medium,
    },
  },
}));

export const DelegateButton: React.FC<DelegateButtonProps> = ({
  stores,
  label,
  disabled = false,
  poolID,
  poolName,
  delegateAndStake,
  socialMediaInfo,
  btnVariant = 'primary',
}) => {
  const { openTxReviewModal, startLoadingTxReview, stakeKeyDeposit, primaryTokenInfo, showTxResultModal, networkId } =
    useTxReviewModal();
  const { governanceStatus } = useGovernanceStatusState();
  const { data } = useYoroiRemoteConfig();
  const dRepID = data?.banners?.earnRewardsWithYoroi?.drepId;

  const { openModal } = useModal();

  const isTestnet = networkId !== 0;

  const avatarSource = toSvg(poolID, 36, { padding: 0 });
  const avatarGenerated = `data:image/svg+xml;utf8,${encodeURIComponent(avatarSource)}`;

  const submitTx = async (passwordInput: string): Promise<void> => {
    const selectedWallet = stores.wallets.selected;
    try {
      startLoadingTxReview();
      await stores.substores.ada.delegationTransaction.signTransaction({
        password: passwordInput,
        wallet: selectedWallet,
        dialog: null,
      });
      showTxResultModal(TransactionResult.SUCCESS);
    } catch (error) {
      console.warn('Delegation error', error);
      showTxResultModal(TransactionResult.FAIL);
    }
  };

  const onDelegateToStakePool = async () => {
    const id = isTestnet ? (poolID ?? '7facad662e180ce45e5c504957cd1341940c72a708728f7ecfc6e349') : poolID;
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
                stakeKeyDeposit={`${new BigNumber(stakeKeyDeposit).shiftedBy(-primaryTokenInfo.decimals)} ${
                  primaryTokenInfo.name
                }`}
                socialMediaInfo={socialMediaInfo}
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

  const handleOnDelegate = async () => {
    if (delegateAndStake) {
      await onDelegateAndStake();
      return;
    }
    if (governanceStatus.status === 'none') {
      openModal({
        modalId: 'governance',
        title: 'Governance updates',
        content: <GovernanceRequiredForRewards onStake={onDelegateToStakePool} onDelegateToDrep={onDelegateAndStake} />,
        width: '612px',
        height: '628px',
      });
    } else {
      await onDelegateToStakePool();
    }
  };

  const onDelegateAndStake = async (): Promise<void> => {
    const delegatingPoolId = isTestnet ? '7facad662e180ce45e5c504957cd1341940c72a708728f7ecfc6e349' : poolID;
    const delegatingDRepId = isTestnet ? '232285cccbf305ca26e6098be9a13b45e3911d881d84c3502f82320cca' : dRepID;

    const drepCredential = dRepToMaybeCredentialHex(delegatingDRepId);
    if (!drepCredential) {
      console.error('Cannot convert DRep ID to a valid credential', delegatingDRepId);
    }

    const { signTxRequest } = await stores.delegation.createPoolOrDrepDelegationTransaction({
      poolId: delegatingPoolId,
      drepCredential,
    });

    openTxReviewModal({
      modalView: 'transactionReview',
      submitTx: (passwordInput: string) => submitTx(passwordInput),
      operations: {
        components: [
          {
            component: (
              <OperationsDetails
                avatarGenerated={avatarGenerated}
                poolName={poolName}
                stakeKeyDeposit={`${new BigNumber(stakeKeyDeposit)
                  .shiftedBy(-primaryTokenInfo.decimals)
                  .toString()} ${primaryTokenInfo.name}`}
                socialMediaInfo={socialMediaInfo}
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

  return (
    <Button
      // @ts-ignore
      variant={btnVariant}
      sx={{
        '&.MuiButton-sizeMedium': {
          padding: '9px 20px',
        },
      }}
      onClick={handleOnDelegate}
      disabled={disabled}
    >
      {label}
    </Button>
  );
};

type OperationsDetailsProps = {
  avatarGenerated: string;
  poolName: string;
  stakeKeyDeposit: string;
  socialMediaInfo?: SocialMediaInfo;
  drepId?: string;
};

const OperationsDetails: React.FC<OperationsDetailsProps> = ({
  avatarGenerated,
  poolName,
  stakeKeyDeposit,
  socialMediaInfo,
  drepId,
}) => {
  const strings = useStrings();

  const { socialLinks, websiteUrl } = socialMediaInfo ?? {};
  const urls = getSocialMediaLinks(socialLinks, websiteUrl);
  const link = websiteUrl ?? urls[0];

  return (
    <Stack direction="column" spacing={16}>
      <Stack direction="row" justifyContent="space-between">
        <Typography color="ds.text_gray_low">{strings.registerStakingKey}</Typography>
        <Typography color="ds.text_gray_medium">{stakeKeyDeposit}</Typography>
      </Stack>
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
          {link ? (
            <StyledLink href={link} target="_blank" rel="noreferrer noopener">
              <Typography color="ds.text_gray_medium">{poolName}</Typography>
            </StyledLink>
          ) : (
            <Typography color="ds.text_gray_medium">{poolName}</Typography>
          )}
        </Stack>
      </Stack>
    </Stack>
  );
};
