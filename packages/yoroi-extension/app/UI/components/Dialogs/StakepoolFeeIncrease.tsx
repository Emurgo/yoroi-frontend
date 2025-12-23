import { Typography, Button, Grid, Stack, Link } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useModal } from '../modals/ModalContext';
import { useEffect, useMemo } from 'react';
import { StakePoolFeeIlustration } from './StakePoolFeeIlustration';
import LocalStorageApi from '../../../api/localStorage/index';
import { useStrings } from '../../common/hooks/useStrings';
import { STAKEPOOL_MARGIN_FEE_URL } from '../../common/constants';
import { useYoroiRemoteConfig } from '../../common/hooks/useYoroiRemoteConfig';
import { RustModule } from '../../../api/ada/lib/cardanoCrypto/rustLoader';

const MODAL_ID = 'stakingPoolFeeIncreaseModal';

export const StakepoolFeeIncrease = ({ stores }) => {
  const strings = useStrings();
  const { openModal, closeModal } = useModal();
  const wallet = stores.wallets.selected;
  const { data } = useYoroiRemoteConfig();

  const delegationStore = stores.delegation;
  const currentlyDelegating = delegationStore.isCurrentlyDelegating(wallet.publicDeriverId);
  const currentPool = delegationStore.getDelegatedPoolId(wallet.publicDeriverId);
  const localStorage = useMemo(() => new LocalStorageApi(), []);

  useEffect(() => {
    if (!currentPool) return;

    const checkModalState = async () => {
      const wasClosed = await localStorage.getStakingPoolFeeIncreaseModalClosed();

      if (wasClosed === 'true') return;
      const stakingUpdate = data?.popups?.stakingUpdate;

      if (!stakingUpdate || stakingUpdate.display !== true) return;

      const affectedPools = stakingUpdate.affectedPools;

      if (!affectedPools || affectedPools.length === 0) return;

      const formatedPoolID = RustModule.WalletV4.Ed25519KeyHash.from_hex(currentPool).to_bech32('pool');
      const isAffectedPool = affectedPools?.includes(formatedPoolID) ?? false;

      if (!isAffectedPool || !currentlyDelegating) return;

      const handleClose = async () => {
        await localStorage.setStakingPoolFeeIncreaseModalClosed('true');
        closeModal();
      };

      openModal({
        title: strings.stakingUpdates,
        height: '597px',
        width: '612px',
        content: <CardanoCardContent onClose={handleClose} />,
        modalId: MODAL_ID,
        onClose: handleClose,
      });
    };

    checkModalState();
  }, [currentPool]);

  return null;
};

const CardanoCardContent = ({ onClose }) => {
  const strings = useStrings();

  return (
    <Stack direction="column" justifyContent="space-between">
      <Stack direction="column" alignItems="center" justifyContent="center" pb="24px">
        <Stack>
          <StakePoolFeeIlustration />
        </Stack>

        <Typography variant="h5" color="ds.text_gray_medium" fontWeight={500} mb="8px">
          {strings.upcomingUpdate}
        </Typography>
        <Typography variant="body1" color="ds.text_gray_medium" textAlign="center" mx="24px">
          {strings.updateDetails}
        </Typography>
      </Stack>

      <Grid justifyContent="space-between" direction="column" style={{ marginTop: 28 }}>
        {/* @ts-ignore */}
        <CustomButton variant="primary" color="primary" onClick={onClose}>
          {strings.skip}
        </CustomButton>
        <Link href={STAKEPOOL_MARGIN_FEE_URL} target="_blank" rel="noopener noreferrer" onClick={onClose}>
          <CustomButton variant="text" sx={{ marginTop: '8px' }}>
            {strings.learnMore}
          </CustomButton>
        </Link>
      </Grid>
    </Stack>
  );
};

const CustomButton = styled(Button)(() => ({
  width: '100%',
  fontSize: '14px',
}));
