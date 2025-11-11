import { useState, useEffect } from 'react';
import LocalStorageApi, { createStorageFlag } from '../../../api/localStorage';
import { BannerType, DREP_BANNER_MIN_ADA } from '../constants';

const surveyDismissed = createStorageFlag('SURVEY_DISMISSED', false);

export function useBannerQueue({ bannersRemoteConfig, walletBalance }) {
  const localStorage = new LocalStorageApi();
  const [visible, setVisible] = useState<BannerType | null>(null);
  useEffect(() => {
    async function resolve() {
      if (
        (await localStorage.getMidnightBannerPhase2Closed()) === undefined &&
        bannersRemoteConfig?.midnightPhase2Announcement.display === true
      ) {
        return BannerType.MidnightPhase2;
      }
      if (!(await surveyDismissed.get())) {
        return BannerType.Survey;
      }
      if (walletBalance === 0) {
        return BannerType.BuyAda;
      }
      if (walletBalance > DREP_BANNER_MIN_ADA) {
        return BannerType.DRep;
      }

      return null;
    }
    resolve().then(setVisible);
  }, [bannersRemoteConfig, visible, walletBalance]);

  const dismiss = async type => {
    switch (type) {
      case BannerType.MidnightPhase2:
        setVisible(null);
        await localStorage.setMidnightBannerPhase2Closed('true');
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
