import { useState, useEffect } from 'react';
import LocalStorageApi, { createStorageFlag } from '../../../api/localStorage';
import { BannerType } from '../constants';

const surveyDismissed = createStorageFlag('SURVEY_DISMISSED', false);

export function useBannerQueue({ bannersRemoteConfig, walletBalance }) {
  const localStorage = new LocalStorageApi();
  const [visible, setVisible] = useState<BannerType | null>(null);
  useEffect(() => {
    async function resolve() {
      if (
        (await localStorage.getMidnightBannerAnnouncementClosed()) === undefined &&
        bannersRemoteConfig?.midnightAnnouncement.display === true
      ) {
        return BannerType.Midnight;
      }
      if (!(await surveyDismissed.get())) {
        return BannerType.Survey;
      }
      if (walletBalance === 0) {
        return BannerType.BuyAda;
      }
      if (walletBalance > 5) {
        return BannerType.DRep;
      }

      // Not used yet - TODO add condition for these banners
      //   if (false) {
      //     return BannerType.Bring;
      //   }
      //   if (false) {
      //     return BannerType.Usda;
      //   }
      return null;
    }
    resolve().then(setVisible);
  }, [bannersRemoteConfig, visible, walletBalance]);

  const dismiss = async type => {
    switch (type) {
      case BannerType.Midnight:
        setVisible(null);
        await localStorage.setMidnightBannerAnnouncementClosed('true');
        break;
      case BannerType.Survey:
        surveyDismissed.set(true);
        setVisible(null);
        break;
      case BannerType.BuyAda:
        setVisible(null);
        break;
      case BannerType.DRep:
        setVisible(null);
        break;
      case BannerType.Bring:
        setVisible(null);
        break;
      case BannerType.Usda:
        setVisible(null);
        break;
    }
  };

  return { visible, dismiss };
}
