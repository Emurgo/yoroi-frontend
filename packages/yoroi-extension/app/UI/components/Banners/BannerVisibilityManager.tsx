import { useBannerQueue } from '../../common/hooks/useBannersQueue';
import { useYoroiRemoteConfig } from '../../common/hooks/useYoroiRemoteConfig';
import { primaryTokenInfoMainnet } from '../../utils/network-config';
import { DrepPromotionBanner } from '../DrepPromotionBanner/DrepPromotionBanner';
import BuySellDialog from '../../../components/buySell/BuySellDialog';
import WalletEmptyBanner from '../../../containers/wallet/WalletEmptyBanner';
import { BannerType } from '../../common/constants';
import { BringBanner } from './BringBanner';
import { UsdaBanner } from './UsdaBanner';
import { MidnightPhase2Banner } from './MidnightPhase2Banner';
import { observer } from 'mobx-react';

import { useGovernanceStatusState } from '../../features/governace/common/hooks/useGovernanceStatusState';

export const BannerVisibilityManager = observer(({ stores, intl }) => {
  const selectedWallet = stores.wallets.selectedOrFail;
  const currentlyDelegating = stores.delegation.isCurrentlyDelegating(selectedWallet.publicDeriverId);
  const { governanceStatus } = useGovernanceStatusState();

  const { data } = useYoroiRemoteConfig();
  const { visible, dismiss } = useBannerQueue({
    walletBalance: Number(
      selectedWallet.balance.getDefaultEntry().amount.shiftedBy(-primaryTokenInfoMainnet.decimals).toString()
    ),
    bannersRemoteConfig: data?.banners,
    currentlyDelegating,
    walletId: selectedWallet.publicDeriverId,
    governanceStatus,
  });

  return (
    <>
      {visible === BannerType.MidnightPhase2 && <MidnightPhase2Banner onClose={() => dismiss(BannerType.MidnightPhase2)} />}
      {visible === BannerType.DRep && (
        <DrepPromotionBanner onClose={() => dismiss(BannerType.DRep)} stores={stores} intl={intl} />
      )}
      {visible === BannerType.BuyAda && (
        <WalletEmptyBanner
          onBuySellClick={() => stores.uiDialogs.open({ dialog: BuySellDialog })}
          isTestnet={selectedWallet.isTestnet}
        />
      )}
      {visible === BannerType.Bring && <BringBanner onClose={() => dismiss(BannerType.DRep)} />}
      {visible === BannerType.Usda && <UsdaBanner onClose={() => dismiss(BannerType.DRep)} />}
    </>
  );
});
