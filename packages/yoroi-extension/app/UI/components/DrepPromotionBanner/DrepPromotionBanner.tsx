import { Button, Stack, Typography, styled, useTheme } from '@mui/material';
import BigNumber from 'bignumber.js';
import { observer } from 'mobx-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { dRepNormalize } from '../../../api/ada/lib/cardanoCrypto/utils';
import LocalStorageApi from '../../../api/localStorage/index';
import globalMessages from '../../../i18n/global-messages';
import { ROUTES } from '../../../routes-config';
import { YOROI_DREP_ID } from '../../features/governace/common/constants';
import { IconWrapper, Icons } from '../icons';
import { Ilustration } from './Ilustration';

const Container = styled(Stack)(({ theme }: any) => ({
  backgroundImage: theme.palette.ds.bg_gradient_1,
  borderRadius: '8px',
  height: '154px',
  marginBottom: '24px',
}));

const HIDE_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 1 month in milliseconds
const MIN_BALANCE_ADA = 5;

const useDrepBannerVisibility = (balance: BigNumber, selectedWalletId: number) => {
  const localStorageApi = new LocalStorageApi();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const checkVisibility = async () => {
      const drepBannerSettingsStr = await localStorageApi.getDrepYoroiBanerTimestamp();
      const bannerSettings = JSON.parse(drepBannerSettingsStr || '{}');

      const lastDismissed = bannerSettings[selectedWalletId];
      const now = Date.now();

      if (balance.isGreaterThanOrEqualTo(MIN_BALANCE_ADA)) {
        if (!lastDismissed || now - Number(lastDismissed) > HIDE_DURATION_MS) {
          setIsVisible(true);
        }
      }
    };

    checkVisibility();
  }, [balance]);

  const dismissBanner = useCallback(async () => {
    const drepBannerSettingsStr = await localStorageApi.getDrepYoroiBanerTimestamp();
    const bannerSettings = JSON.parse(drepBannerSettingsStr || '{}');

    localStorageApi.setDrepYoroiBanerTimestamp(JSON.stringify(Object.assign(bannerSettings, { [selectedWalletId]: Date.now() })));
    setIsVisible(false);
  }, [localStorageApi]);

  return { isVisible, dismissBanner };
};

export const DrepPromotionBanner = observer(({ stores, intl }) => {
  const selectedWallet = stores.wallets.selectedOrFail;
  const theme: any = useTheme();

  if (selectedWallet.isTestnet) {
    return null;
  }

  const balance = useMemo(() => new BigNumber(selectedWallet?.balance?.getDefaultEntry()?.amount || 0).shiftedBy(-6), [
    selectedWallet,
  ]);
  const selectedWalletId = selectedWallet.publicDeriverId;

  const { isVisible, dismissBanner } = useDrepBannerVisibility(balance, selectedWalletId);

  const [governanceInfo, setGovernanceInfo] = useState({
    isParticipatingToGovernance: false,
    isDelegatingToYoroiDrep: false,
  });

  useEffect(() => {
    const getGovStatus = () => {
      const govInfo = stores.delegation.governanceStatus?.drepDelegation;
      if (govInfo) {
        const isParticipatingToGovernance = govInfo !== null;
        const drepEncoded = dRepNormalize(govInfo?.drep, govInfo?.drepKind);
        const isDelegatingToYoroiDrep = isParticipatingToGovernance && drepEncoded === YOROI_DREP_ID;
        setGovernanceInfo({ isParticipatingToGovernance, isDelegatingToYoroiDrep });
      }
    };

    getGovStatus();
  }, [stores.delegation.governanceStatus]);

  if (
    !isVisible ||
    stores.delegation.governanceStatus === undefined ||
    (governanceInfo.isDelegatingToYoroiDrep && governanceInfo.isParticipatingToGovernance)
  ) {
    return null;
  }

  return (
    <Container direction="row" justifyContent="space-between" sx={{ position: 'relative' }}>
      <Stack sx={{ position: 'absolute', right: 10, top: 10 }}>
        <IconWrapper
          onClick={dismissBanner}
          icon={Icons.CloseCircleIcon}
          iconProps={{fill: theme.palette.ds.el_gray_max}}
          color="ds.el_gray_max"
          borderColor="ds.el_gray_max"
          asButton
        />
      </Stack>

      <Stack direction="column" p="16px" alignItems="flex-start">
        <Typography fontSize="16px" fontWeight={500} color="ds.gray_max">
          {!governanceInfo.isParticipatingToGovernance
            ? intl.formatMessage(globalMessages.delegateToYoroiDRep)
            : intl.formatMessage(globalMessages.considerDelegating)}
        </Typography>
        <Typography variant="body1" mt="8px" mb="24px" color="ds.gray_max">
          {intl.formatMessage(globalMessages.delegateToYoroi)}
        </Typography>
        <Button
          //  @ts-ignore
          variant="secondary"
          sx={{
            width: 'fit-content',
            height: '40px',
            '&.MuiButton-sizeMedium': {
              p: '9px 20px',
            },
          }}
          onClick={() => {
            stores.routing.goToRoute({
              route: ROUTES.Governance.ROOT,
              query: { delegateToYoroiDrep: true },
            });
          }}
        >
          {intl.formatMessage(globalMessages.delegateVote)}
        </Button>
      </Stack>
      <Stack sx={{ marginRight: '40px', marginTop: '20px' }}>
        <Ilustration />
      </Stack>
    </Container>
  );
});
