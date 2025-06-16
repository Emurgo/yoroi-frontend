import { useStrings } from '../../common/hooks/useStrings';
import { BaseBanner } from './BaseBanner';

interface UsdaBannerProps {
  onClose: () => void;
  onClick: () => void;
  displayIllustration?: boolean;
}

export const UsdaBanner = ({ onClose, onClick, displayIllustration = false }: UsdaBannerProps) => {
  const { usdaBannerButton, usdaBannerTitle, usdaBannerDesc } = useStrings();

  const handleClose = () => {
    onClose();
  };

  const handleClick = () => {
    onClick();
  };

  return (
    <BaseBanner
      onClose={handleClose}
      title={usdaBannerTitle}
      description={usdaBannerDesc}
      buttonText={usdaBannerButton}
      buttonProps={{
        onClick: handleClick,
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
    />
  );
};
