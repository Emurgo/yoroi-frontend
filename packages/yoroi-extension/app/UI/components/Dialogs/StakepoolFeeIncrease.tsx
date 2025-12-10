import { Typography, Button, Grid, Stack, Link } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useModal } from '../modals/ModalContext';
import { useEffect } from 'react';
import { StakePoolFeeIlustration } from './StakePoolFeeIlustration';
import LocalStorageApi from '../../../api/localStorage/index';
import { useStrings } from '../../common/hooks/useStrings';
import { STAKEPOOL_MARGIN_FEE_URL } from '../../common/constants';
import { useYoroiRemoteConfig } from '../../common/hooks/useYoroiRemoteConfig';
import { RustModule } from '../../../api/ada/lib/cardanoCrypto/rustLoader';

export const StakepoolFeeIncrease = ({ stores }) => {
  const strings = useStrings();
  const { openModal, closeModal } = useModal();
  const wallet = stores.wallets.selected;

  const delegationStore = stores.delegation;
  const currentlyDelegating = delegationStore.isCurrentlyDelegating(wallet.publicDeriverId);
  const currentPool = delegationStore.getDelegatedPoolId(wallet.publicDeriverId);

  const { data } = useYoroiRemoteConfig();

  useEffect(() => {
    if (!currentPool) return;
    const formatedPoolID = RustModule.WalletV4.Ed25519KeyHash.from_hex(currentPool).to_bech32('pool');

    const checkModalState = async () => {
      const localStorage = new LocalStorageApi();
      const wasClosed = await localStorage.getStakingPoolFeeIncreaseModalClosed();
      const isAffectedPool = data?.popups?.stakingUpdate?.affectedPools.includes(formatedPoolID);

      if (
        isAffectedPool &&
        currentlyDelegating &&
        data?.popups?.stakingUpdate?.display === true &&
        (wasClosed === undefined || wasClosed === 'false')
      ) {
        openModal({
          title: strings.stakingUpdates,
          height: '597px',
          width: '612px',
          content: (
            <CardanoCardContent
              onClose={() => {
                localStorage.setStakingPoolFeeIncreaseModalClosed('true');
                closeModal();
              }}
            />
          ),
          modalId: 'stakingPoolFeeIncreaseModal',
          onClose: () => {
            localStorage.setStakingPoolFeeIncreaseModalClosed('true');
          },
        });
      }
    };

    void checkModalState();
  }, [currentPool, currentlyDelegating, data, openModal, closeModal]);

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
        <Link href={STAKEPOOL_MARGIN_FEE_URL} target="_blank" rel="noopener noreferrer" onClick={onClose}>
          {/* @ts-ignore */}
          <CustomButton variant="primary" color="primary">
            {strings.learnMore}
          </CustomButton>
        </Link>
        <CustomButton variant="text" onClick={onClose} sx={{ marginTop: '8px' }}>
          {strings.skip}
        </CustomButton>
      </Grid>
    </Stack>
  );
};

const CustomButton = styled(Button)(() => ({
  width: '100%',
  fontSize: '14px',
}));
