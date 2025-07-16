import { useStrings } from '../../common/hooks/useStrings';
import { BaseBanner } from './BaseBanner';
import { MidnightIlustration } from '../Dialogs/MidnightIlustration';

export const MidnightBanner = ({ onClose }) => {
  const { checkEligibility, claimAnnouncement, yoroiSupport } = useStrings();

  const handleClose = async () => {
    onClose();
  };

  const handleClick = () => {
    // Redirect to Airdrop page https://emurgo.atlassian.net/browse/YOEXT-2100
  };

  return (
    <BaseBanner
      onClose={handleClose}
      title={claimAnnouncement}
      description={yoroiSupport}
      buttonText={checkEligibility}
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
      displayIllustration={true}
      illustration={<MidnightIlustration />}
      illustrationProps={{
        sx: {
          position: 'relative',
          zIndex: 20,
          transform: 'scale(1.5)',
          top: '50px',
          marginRight: '100px',
        },
      }}
    />
  );
};
