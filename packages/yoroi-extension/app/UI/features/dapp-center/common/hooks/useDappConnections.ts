import { useDappCenter } from '../../module/DappCenterContextProvider';
import { DappCenterActions, DappCenterState } from '../types';
import { hiddenAmount } from '../../../../../utils/strings';
import { splitAmount, truncateToken } from '../../../../../utils/formatters';
import { getTokenName } from '../../../../../stores/stateless/tokenHelpers';

export const useDappConnections = () => {
  const {
    whitelistEntries,
    wallets,
    shouldHideBalance,
    getTokenInfo,
    removeWalletFromWhitelist,
  }: DappCenterState & DappCenterActions = useDappCenter();

  const cardanoNodes = whitelistEntries
    ?.map(({ url, publicDeriverId, image }) => {
      const wallet = wallets.find(cacheEntry => cacheEntry.publicDeriverId === publicDeriverId);

      if (wallet == null) return null;

      let balance = shouldHideBalance ? hiddenAmount : '0';
      let tokenName = 'ADA';

      if (wallet.balance != null && !shouldHideBalance) {
        const defaultEntry = wallet.balance.getDefaultEntry();
        const tokenInfo = getTokenInfo(defaultEntry);
        const shiftedAmount = defaultEntry.amount.shiftedBy(-tokenInfo.Metadata.numberOfDecimals);
        const [beforeDecimalRewards, afterDecimalRewards] = splitAmount(shiftedAmount, tokenInfo.Metadata.numberOfDecimals);
        balance = `${beforeDecimalRewards}${afterDecimalRewards}`;
        tokenName = truncateToken(getTokenName(tokenInfo));
      }

      return {
        url,
        publicDeriverId,
        image,
        wallet,
        tokenName,
        balance,
      };
    })
    .filter(Boolean);

  return { cardanoNodes, removeWalletFromWhitelist };
};
