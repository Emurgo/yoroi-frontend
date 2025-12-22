import { useStrings } from '../../common/hooks/useStrings';
import { DelegateButton } from '../../features/staking/useCases/DelegatedStakePoolInfo/DelegateButton';
import { BaseBanner } from './BaseBanner';
import type { StoresMap } from '../../../stores';
import { useYoroiRemoteConfig } from '../../common/hooks/useYoroiRemoteConfig';

interface UsdaBannerProps {
  onClose?: () => void;
  onClick?: () => void;
  displayIllustration?: boolean;
  stores: StoresMap;
}

export const RewardsBanner = ({ onClose, stores, displayIllustration = false }: UsdaBannerProps) => {
  const { rewardsButton, earnRewards, delegateRewards } = useStrings();
  const { data } = useYoroiRemoteConfig();
  const yoroiPoolID = data?.banners?.earnRewardsWithYoroi?.poolId;
  const yoroiPoolName = data?.banners?.earnRewardsWithYoroi?.poolName;
  // TODO: read from config when merged
  const yoroiDrepID = '220655f3a1c76788d839212adc459b188b84e680f30ae944c593fa18ae';

  const handleClose = () => {
    onClose && onClose();
  };

  return (
    <BaseBanner
      noClose
      onClose={handleClose}
      title={earnRewards}
      description={delegateRewards}
      buttonText={rewardsButton}
      buttonProps={{
        onClick: () => {},
        //  @ts-ignore
        variant: 'secondary',
        sx: {
          width: 'fit-content',
          height: '40px',
          '&.MuiButton-sizeMedium': {
            p: '9px 20px',
          },
        },
      }}
      displayIllustration={displayIllustration}
      customButton={
        <DelegateButton
          btnVariant="secondary"
          stores={stores}
          label={rewardsButton}
          disabled={false}
          poolID={yoroiPoolID || ''}
          poolName={yoroiPoolName || ''}
          dRepID={yoroiDrepID || ''}
          socialMediaInfo={undefined}
          delegateAndStake
        />
      }
    />
  );
};
