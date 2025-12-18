import { useStrings } from '../../common/hooks/useStrings';
import { DelegateButton } from '../../features/staking/useCases/DelegatedStakePoolInfo/DelegateButton';
import { BaseBanner } from './BaseBanner';
import type { StoresMap } from '../../../stores';

interface UsdaBannerProps {
  onClose?: () => void;
  onClick?: () => void;
  displayIllustration?: boolean;
  stores: StoresMap;
}

export const RewardsBanner = ({ onClose, stores, displayIllustration = false }: UsdaBannerProps) => {
  const { rewardsButton, earnRewards, delegateRewards } = useStrings();

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
          poolName="[EMUR7] Emurgo #7"
          socialMediaInfo={undefined}
          poolID="8efb053977341471256685b1069d67f4aca7166bc3f94e27ebad217f"
        />
      }
    />
  );
};
