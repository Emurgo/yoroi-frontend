import { Button, IconButton, Stack, Typography, styled } from '@mui/material';
import BigNumber from 'bignumber.js';
import { observer } from 'mobx-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { dRepNormalize } from '../../../api/ada/lib/cardanoCrypto/utils';
import LocalStorageApi from '../../../api/localStorage/index';
import globalMessages from '../../../i18n/global-messages';
import { ROUTES } from '../../../routes-config';
import { YOROI_DREP_ID } from '../../features/governace/common/constants';
import { Icon } from '../icons';
import { Ilustration } from './Ilustration';

const Container = styled(Stack)(({ theme }: any) => ({
  backgroundImage: theme.palette.ds.bg_gradient_1,
  borderRadius: '8px',
  height: '154px',
  marginBottom: '24px',
}));

const IconWrapper = styled(IconButton)(({ theme }: any) => ({
  borderColor: theme.palette.ds.el_gray_max,

  '& svg': {
    '& path': {
      fill: theme.palette.ds.el_gray_max,
    },
  },
}));

const HIDE_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 1 month in milliseconds
const MIN_BALANCE_ADA = 5;

const useDrepBannerVisibility = (balance: BigNumber) => {
  const localStorageApi = new LocalStorageApi();
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    try {
      const checkVisibility = async () => {
        const lastDismissed = await localStorageApi.getDrepYoroiBanerTimestamp();
        const now = Date.now();

        if (balance.isGreaterThanOrEqualTo(MIN_BALANCE_ADA)) {
          if (!lastDismissed || now - Number(lastDismissed) > HIDE_DURATION_MS) {
            setIsVisible(true);
          }
        }
      };

      checkVisibility();
    } catch (error) {
      console.error('Error checking DREP banner visibility', error);
    }
  }, [balance]);

  const dismissBanner = useCallback(() => {
    localStorageApi.setDrepYoroiBanerTimestamp(String(Date.now()));
    setIsVisible(false);
  }, [localStorageApi]);

  return { isVisible, dismissBanner };
};

export const DrepPromotionBanner = observer(({ stores, intl }) => {
  const selectedWallet = stores.wallets.selectedOrFail;
  const balance = useMemo(() => new BigNumber(selectedWallet?.balance?.getDefaultEntry()?.amount || 0).shiftedBy(-6), [
    selectedWallet,
  ]);

  const { isVisible, dismissBanner } = useDrepBannerVisibility(balance);

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
      {!governanceInfo.isDelegatingToYoroiDrep && governanceInfo.isParticipatingToGovernance && (
        <Stack sx={{ position: 'absolute', right: 10, top: 10 }}>
          <IconWrapper onClick={dismissBanner}>
            <Icon.CloseCircleIcon />
          </IconWrapper>
        </Stack>
      )}

      <Stack direction="column" p="16px">
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
          sx={{ width: '178px', padding: '6px 16px', height: '40px', fontWeight: 500 }}
          onClick={() => {
            stores.app.goToRoute({
              route: ROUTES.Governance.ROOT,
              delegateToYoroiDrep: true,
            });
          }}
        >
          {intl.formatMessage(globalMessages.delegateNow)}
        </Button>
      </Stack>
      <Stack sx={{ marginRight: '40px', marginTop: '20px' }}>
        <Ilustration />
      </Stack>
    </Container>
  );
});
// hmm, I thought we keep the buttons consistent across the app
