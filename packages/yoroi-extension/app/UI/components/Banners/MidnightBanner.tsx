import { useEffect, useState } from 'react';
import { useStrings } from '../../common/hooks/useStrings';
import { BaseBanner } from './BaseBanner';
import LocalStorageApi from '../../../api/localStorage/index';
import { useYoroiRemoteConfig } from '../../common/hooks/useYoroiRemoteConfig';
import { MidnightIlustration } from '../Dialogs/MidnightIlustration';

export const MidnightBanner = () => {
  const { checkEligibility, claimAnnouncement, yoroiSupport } = useStrings();
  const [bannerVisible, setBannerVisible] = useState(false);
  const localStorage = new LocalStorageApi();
  const { data } = useYoroiRemoteConfig();

  const handleClose = async () => {
    setBannerVisible(false);
    await localStorage.setMidnightBannerAnnouncementClosed(true);
  };

  const handleClick = () => {
    // Redirect to Airdrop page https://emurgo.atlassian.net/browse/YOEXT-2100
  };

  useEffect(() => {
    const checkModalState = async () => {
      const wasClosed = await localStorage.getMidnightBannerAnnouncementClosed();
      if (data?.banners?.midnightAnnouncement?.display === true && (wasClosed === undefined || wasClosed === false)) {
        setBannerVisible(true);
      }
    };

    checkModalState();
  }, [data]);

  if (!bannerVisible) {
    return null;
  }

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
