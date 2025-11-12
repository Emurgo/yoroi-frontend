import { MIDNIGHT_PHASE2_URL } from '../../common/constants';
import { useStrings } from '../../common/hooks/useStrings';
import { BaseBanner } from './BaseBanner';
import { MidnightPhase2Ilustration } from './MidnightPhase2Ilustration';

export const MidnightPhase2Banner = ({ onClose }) => {
  const { goToMidnight, claimAnnouncementPhase2, midnightDappConnect } = useStrings();

  const handleClose = async () => {
    onClose();
  };

  const handleClick = () => {
    window.open(MIDNIGHT_PHASE2_URL, '_blank', 'noopener,noreferrer');
    onClose();
  };

  return (
    <BaseBanner
      onClose={handleClose}
      title={claimAnnouncementPhase2}
      description={midnightDappConnect}
      buttonText={goToMidnight}
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
      illustration={<MidnightPhase2Ilustration />}
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
