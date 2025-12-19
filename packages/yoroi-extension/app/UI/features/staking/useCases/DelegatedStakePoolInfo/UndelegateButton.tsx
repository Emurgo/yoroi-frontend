import { Box, Button, Link, Stack, Typography, styled } from '@mui/material';
import BigNumber from 'bignumber.js';
import { toSvg } from 'jdenticon';

import { useTxReviewModal } from '../../../transaction-review/module/ReviewTxProvider';
import { asQuantity } from '../../../../utils/createCurrentWalletInfo';
import { useStrings } from '../../common/hooks/useStrings';
import { useStaking } from '../../module/StakingContextProvider';
import { TransactionResult } from '../../../transaction-review/common/types';
import { useGovernanceStatusState } from '../../../governace/common/hooks/useGovernanceStatusState';
import { useModal } from '../../../../components/modals/ModalContext';
import { StakeWithdrawUpdates } from '../../common/modals/StakeWithdrawUpdates';

export const UndelegateButton = ({ poolTransition, delegateToSpecificPool, poolId, poolName, socialMediaInfo }) => {
  const { openTxReviewModal, startLoadingTxReview, stakeKeyDeposit, primaryTokenInfo, showTxResultModal, stakingRewards } =
    useTxReviewModal();
  const { selectedWallet, stores } = useStaking();
  const { governanceStatus } = useGovernanceStatusState();
  const { openModal } = useModal();
  const strings = useStrings();
  const avatarSource = toSvg(poolId, 36, { padding: 0 });
  const avatarGenerated = `data:image/svg+xml;utf8,${encodeURIComponent(avatarSource)}`;

  if (poolTransition?.shouldShowTransitionFunnel) {
    return (
      // @ts-ignore
      <UpdatePoolButton variant="danger" onClick={() => delegateToSpecificPool(poolTransition.suggestedPool?.hash ?? '')}>
        {strings.updatePoolLabel}
      </UpdatePoolButton>
    );
  }

  const handleUndelegate = async () => {
    if (governanceStatus.status === 'none') {
      openModal({
        modalId: 'governance',
        title: 'Governance updates',
        content: <StakeWithdrawUpdates titlte={strings.participationInGovUndelegate} description={strings.undelegateInfo} />,
        width: '612px',
        height: '628px',
      });
    } else {
      stores.substores.ada.delegationTransaction.setShouldDeregister(true);
      const unsignedTx = await stores.substores.ada.delegationTransaction.createWithdrawalTxForWallet({
        wallet: selectedWallet,
      });

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
                  stakeKeyDeposit={`${new BigNumber(stakeKeyDeposit).shiftedBy(-primaryTokenInfo.decimals).toString()} ${
                    primaryTokenInfo.name
                  }`}
                  stakingRewards={`${asQuantity(stakingRewards)} ${primaryTokenInfo.name}`}
                  socialMediaInfo={socialMediaInfo}
                />
              ),
              duplicated: false,
            },
          ],
          kind: 'undelegate',
        },
        unsignedTx: unsignedTx.unsignedTx,
      });
    }
  };

  const submitTx = async password => {
    const signRequest = stores.substores.ada.delegationTransaction.createWithdrawalTx.result;
    if (signRequest == null) return;

    try {
      startLoadingTxReview();

      await stores.transactionProcessingStore.adaSendAndRefresh({
        wallet: stores.wallets.selected,
        signRequest,
        password,
        callback: async () => {},
      });

      showTxResultModal(TransactionResult.SUCCESS);
    } catch (_error) {
      showTxResultModal(TransactionResult.FAIL);
    }
  };

  return (
    <UndelegateBtn
      // @ts-ignore
      variant="tertiary"
      color="primary"
      onClick={handleUndelegate}
      disabled={!handleUndelegate}
      sx={{
        lineHeight: '22px',
        '&.MuiButton-sizeMedium': {
          fontSize: '14px',
          height: 'unset',
          p: '9px 20px',
        },
      }}
    >
      {strings.undelegateLabel}
    </UndelegateBtn>
  );
};

const OperationsDetails = ({ stakeKeyDeposit, avatarGenerated, poolName, socialMediaInfo, stakingRewards }) => {
  const { socialLinks, websiteUrl } = socialMediaInfo ?? {};
  const urls = getSocialMediaLinks(socialLinks, websiteUrl);
  const strings = useStrings();
  const link = websiteUrl ?? urls[0];

  return (
    <Stack gap="8px">
      <Stack direction="row" justifyContent="space-between">
        <Typography color="ds.text_gray_low">{strings.undelegatePool}</Typography>

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

          {link && (
            <StyledLink href={link} target="_blank" rel="noreferrer noopener">
              <Typography color="ds.text_gray_medium">{poolName}</Typography>
            </StyledLink>
          )}
        </Stack>
      </Stack>

      <Stack direction="row" justifyContent="space-between">
        <Typography color="ds.text_gray_low">{strings.deregisteringStakingKey}</Typography>
        <Typography color="ds.text_gray_medium">{stakeKeyDeposit}</Typography>
      </Stack>
      <Stack direction="row" justifyContent="space-between">
        <Typography color="ds.text_gray_low">{strings.totalRewardsLabel}</Typography>
        <Typography color="ds.text_gray_medium">{stakingRewards}</Typography>
      </Stack>
    </Stack>
  );
};

export const getSocialMediaLink = (platform, handle) => {
  const baseUrls = {
    twitter: 'https://twitter.com/',
    telegram: 'https://t.me/',
    facebook: 'https://fb.me/',
    youtube: 'https://youtube.com/',
    twitch: 'https://twitch.com/',
    discord: 'https://discord.gg/',
    github: 'https://github.com/',
  };

  const baseUrl = baseUrls[platform];
  return baseUrl ? `${baseUrl}${handle}` : '';
};

export const getSocialMediaLinks = (socialLinks, websiteUrl) => {
  const urls: string[] = [];

  if (socialLinks?.tw) urls.push(getSocialMediaLink('twitter', socialLinks.tw));
  if (socialLinks?.tg) urls.push(getSocialMediaLink('telegram', socialLinks.tg));
  if (socialLinks?.fb) urls.push(getSocialMediaLink('facebook', socialLinks.fb));
  if (socialLinks?.yt) urls.push(getSocialMediaLink('youtube', socialLinks.yt));
  if (socialLinks?.tc) urls.push(getSocialMediaLink('twitch', socialLinks.tc));
  if (socialLinks?.di) urls.push(getSocialMediaLink('discord', socialLinks.di));
  if (socialLinks?.gh) urls.push(getSocialMediaLink('github', socialLinks.gh));

  if (websiteUrl) urls.push(websiteUrl);

  return urls;
};

const UpdatePoolButton = styled(Button)(({ theme }: any) => ({
  minWidth: 'auto',
  width: '140px',
  marginLeft: 'auto',
  background: theme.palette.ds.sys_magenta_500,
  color: 'white',
  height: '40px',
  padding: '0px !important',
  fontSize: '14px',
  '&:hover': {
    backgroundColor: theme.palette.ds.sys_magenta_500,
    color: 'white',
  },
}));

const UndelegateBtn = styled(Button)({
  minWidth: 'auto',
  width: 'unset',
  marginLeft: 'auto',
});

const StyledLink: any = styled(Link)(({ theme }: any) => ({
  marginRight: '5px',
  color: 'inherit',
  '& svg': {
    '& path': {
      fill: theme.palette.ds.el_gray_medium,
    },
  },
}));
