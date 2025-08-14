import { useStrings } from '../../common/hooks/useStrings';
import { BaseBanner } from './BaseBanner';
import { MidnightBannerIllustration } from '../Dialogs/MidnightBannerIllustration';
import { useNavigateTo } from '../../common/hooks/useNavigateTo';
import { ampli } from '../../../../ampli.ts';

export const MidnightBanner = ({ onClose }) => {
  const { checkEligibility, claimAnnouncement, yoroiSupport } = useStrings();
  const routes = useNavigateTo();

  const handleClose = async () => {
    onClose();
    ampli.midnightAirdropBannerClosed();
  };

  const handleClick = () => {
    routes.midnightAirdropClaim();
    onClose();
    ampli.midnightAirdropBannerCheckEligibility();
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
      illustration={<MidnightBannerIllustration />}
      illustrationProps={{
        sx: {
          position: 'relative',
          zIndex: 20,
          top: '16px',
          marginRight: '76.72px',
          height: '138px',
        },
      }}
    />
  );
};
