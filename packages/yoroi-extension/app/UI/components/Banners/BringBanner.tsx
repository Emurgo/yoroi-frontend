import { Cashback } from '../ilustrations/Cashback';
import { useStrings } from '../../common/hooks/useStrings';
import { BaseBanner } from './BaseBanner';
interface BringBannerProps {
  onClose: () => void;
  onClick: () => void;
  displayIllustration?: boolean;
}

export const BringBanner = ({ onClose, onClick, displayIllustration = true }: BringBannerProps) => {
  const { bringBannerButton, bringBannerTitle, bringBannerDesc } = useStrings();

  const handleClose = () => {
    onClose();
  };

  const handleClick = () => {
    onClick();
  };

  return (
    <BaseBanner
      onClose={handleClose}
      title={bringBannerTitle}
      description={bringBannerDesc}
      buttonText={bringBannerButton}
      buttonProps={{
        onClick: handleClick,
        //  @ts-ignore
        variant: 'contained',
        sx: {
          width: 'fit-content',
          height: '40px',
          '&.MuiButton-sizeMedium': {
            p: '9px 20px',
          },
        },
      }}
      illustration={<Cashback />}
      displayIllustration={displayIllustration}
      illustrationProps={{
        sx: {
          position: 'relative',
          zIndex: 10,
          transform: 'scale(2)',
          marginTop: '25px',
          marginRight: '5px',
        },
      }}
    />
  );
};
