import { useState, useEffect, useCallback } from 'react';
import LocalStorageApi, { createStorageFlag } from '../../../api/localStorage';
import { BannerType, DREP_BANNER_MIN_ADA } from '../constants';

const surveyDismissed = createStorageFlag('SURVEY_DISMISSED', false);

export function useBannerQueue({ bannersRemoteConfig, walletBalance }) {
  const localStorage = new LocalStorageApi();
  const [visible, setVisible] = useState<BannerType | null>(null);
  const [evaluationKey, setEvaluationKey] = useState(0);

  const resolveBanner = useCallback(async () => {
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
  }, [bannersRemoteConfig, walletBalance]);

  useEffect(() => {
    resolveBanner().then(setVisible);
  }, [bannersRemoteConfig, walletBalance, evaluationKey, resolveBanner]);

  const dismiss = async type => {
    switch (type) {
      case BannerType.MidnightPhase2:
        setVisible(null);
        await localStorage.setMidnightBannerPhase2Closed('true');
        setEvaluationKey(prev => prev + 1);
        break;
      case BannerType.Survey:
        surveyDismissed.set(true);
        setVisible(null);
        setEvaluationKey(prev => prev + 1);
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
