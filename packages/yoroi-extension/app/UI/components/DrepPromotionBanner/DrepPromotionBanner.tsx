import { Button, IconButton, Stack, Typography, styled } from '@mui/material';
import BigNumber from 'bignumber.js';
import { observer } from 'mobx-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { dRepNormalize } from '../../../api/ada/lib/cardanoCrypto/utils';
import LocalStorageApi from '../../../api/localStorage/index';
import { ROUTES } from '../../../routes-config';
import { YOROI_DREP_ID } from '../../features/governace/common/constants';
import { Icon } from '../icons';
import { Ilustration } from './Ilustration';

const Container = styled(Stack)(({ theme }: any) => ({
  backgroundImage: theme.palette.ds.bg_gradient_1,
  borderRadius: '8px',
  height: '154px',
  padding: '16px',
  marginBottom: '24px',
}));

const IconWrapper = styled(IconButton)(({ theme }: any) => ({
  border: '1px solid',
  borderColor: theme.palette.ds.gray_max,
  borderRadius: '50%',
  width: '24px',
  height: '24px',
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
  }, [balance]);

  const dismissBanner = useCallback(() => {
    localStorageApi.setDrepYoroiBanerTimestamp(Date.now());
    setIsVisible(false);
  }, [localStorageApi]);

  return { isVisible, dismissBanner };
};

const useGovernanceStatus = stores => {
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

  return governanceInfo;
};

export const DrepPromotionBanner = observer(({ stores }) => {
  const selectedWallet = stores.wallets.selectedOrFail;
  const balance = useMemo(() => new BigNumber(selectedWallet?.balance?.getDefaultEntry()?.amount || 0).shiftedBy(-6), [
    selectedWallet,
  ]);

  const { isVisible, dismissBanner } = useDrepBannerVisibility(balance);
  const governanceInfo = useGovernanceStatus(stores);

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
        <Stack sx={{ position: 'absolute', right: 20, top: 20 }}>
          <IconWrapper onClick={dismissBanner}>
            <Icon.CloseIcon />
          </IconWrapper>
        </Stack>
      )}

      <Stack direction="column">
        <Typography fontSize="16px" fontWeight={500} color="ds.gray_max">
          {!governanceInfo.isParticipatingToGovernance ? 'Delegate to Yoroi DRep' : 'Consider delegating to Yoroi?'}
        </Typography>
        <Typography variant="body1" mt="8px" mb="24px" color="ds.gray_max">
          Delegate to our DRep and help the Cardano network evolve in a way that benefits your wallet experience.
        </Typography>
        <Button
          //  @ts-ignore
          variant="secondary"
          sx={{ width: '161px', padding: '6px 16px', height: '40px' }}
          onClick={() => {
            stores.app.goToRoute({
              route: ROUTES.Governance.ROOT,
              delegateToYoroiDrep: true,
            });
          }}
        >
          <Typography fontSize="14px">Delegate now</Typography>
        </Button>
      </Stack>
      <Stack sx={{ width: '300px', marginRight: '40px' }}>
        <Ilustration />
      </Stack>
    </Container>
  );
});
