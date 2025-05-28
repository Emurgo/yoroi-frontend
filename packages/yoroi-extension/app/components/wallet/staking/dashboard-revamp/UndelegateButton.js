import { Box, Button, Stack, Typography, styled } from '@mui/material';
import BigNumber from 'bignumber.js';
import { toSvg } from 'jdenticon';
import globalMessages from '../../../../i18n/global-messages';
import { TransactionResult } from '../../../../UI/features/transaction-review/common/types';
import { useTxReviewModal } from '../../../../UI/features/transaction-review/module/ReviewTxProvider';
import { StyledLink } from './StakePool/StakePool.styles';
import { asQuantity } from '../../../../UI/utils/createCurrentWalletInfo';

export const UndelegateButton = ({ poolTransition, intl, delegateToSpecificPool, poolId, poolName, stores, socialMediaInfo }) => {
  const {
    openTxReviewModal,
    startLoadingTxReview,
    walletType,
    isHardwareWallet,
    stakeKeyDeposit,
    primaryTokenInfo,
    showTxResultModal,
    stakingRewards,
  } = useTxReviewModal();
  const avatarSource = toSvg(poolId, 36, { padding: 0 });
  const avatarGenerated = `data:image/svg+xml;utf8,${encodeURIComponent(avatarSource)}`;

  if (poolTransition?.shouldShowTransitionFunnel) {
    return (
      <UpdatePoolButton variant="danger" onClick={() => delegateToSpecificPool(poolTransition.suggestedPool?.hash ?? '')}>
        {intl.formatMessage(globalMessages.updatePool)}
      </UpdatePoolButton>
    );
  }

  const handleUndelegate = async () => {
    const walletSelect = stores.wallets.selectedOrFail;
    stores.substores.ada.delegationTransaction.setShouldDeregister(true);
    const unsignedTx = await stores.substores.ada.delegationTransaction.createWithdrawalTxForWallet({ wallet: walletSelect });

    openTxReviewModal({
      modalView: 'transactionReview',
      submitTx: passswordInput => submitTx(passswordInput),
      operations: {
        components: [
          {
            component: (
              <OperationsDetails
                intl={intl}
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
  };

  const submitTx = async password => {
    const selected = stores.wallets.selected;
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

      // ampli.claimAdaTransactionSubmitted({
      //   reward_amount: signRequest.withdrawals()[0]?.amount.getDefaultEntry().amount.toNumber(),
      // });
    } catch (error) {
      showTxResultModal(TransactionResult.FAIL);
    }
  };

  return (
    <UndelegateBtn
      variant="tertiary"
      color="primary"
      onClick={handleUndelegate}
      disabled={!handleUndelegate}
      sx={{
        lineHeight: '21px',
        '&.MuiButton-sizeMedium': {
          height: 'unset',
          p: '9px 15px',
        },
      }}
    >
      {intl.formatMessage(globalMessages.undelegateLabel)}
    </UndelegateBtn>
  );
};

const OperationsDetails = ({ stakeKeyDeposit, avatarGenerated, poolName, intl, socialMediaInfo, stakingRewards }) => {
  const { socialLinks, websiteUrl } = socialMediaInfo ?? {};
  const urls = getSocialMediaLinks(socialLinks, websiteUrl);
  const link = websiteUrl ?? urls[0];

  return (
    <Stack gap="8px">
      <Stack direction="row" justifyContent="space-between">
        <Typography color="ds.text_gray_low">{intl.formatMessage(globalMessages.undelegatePool)}</Typography>

        <Stack direction="row" spacing={1} alignItems="center">
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
        <Typography color="ds.text_gray_low">{intl.formatMessage(globalMessages.deregisteringStakingKey)}</Typography>
        <Typography color="ds.text_gray_medium">{stakeKeyDeposit}</Typography>
      </Stack>
      <Stack direction="row" justifyContent="space-between">
        <Typography color="ds.text_gray_low">{intl.formatMessage(globalMessages.totalRewardsLabel)}</Typography>
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
  const urls = [];

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

const UpdatePoolButton = styled(Button)(({ theme }) => ({
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
