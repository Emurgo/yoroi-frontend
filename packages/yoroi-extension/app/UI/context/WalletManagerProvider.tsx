import BigNumber from 'bignumber.js';
import * as React from 'react';
import { getNetworkById } from '../../api/ada/lib/storage/database/prepackaged/networks';
import { maybe } from '../../coreUtils';
import { genLookupOrFail, getTokenIdentifierIfExists, getTokenStrictName } from '../../stores/stateless/tokenHelpers';
import { splitAmount, truncateToken } from '../../utils/formatters.js';
import { calculateAndFormatValue } from '../../utils/unit-of-account';
import { cardanoAdaBase64Logo } from '../features/portfolio/common/helpers/constants';

// Define a context type for the wallet manager
interface WalletManagerContextType {
  currentWalletInfo: any | null;
}

// Create the context
const WalletManagerContext = React.createContext<WalletManagerContextType | undefined>(undefined);

export const WalletManagerProvider: React.FC<React.PropsWithChildren<{ stores: any }>> = ({ children, stores }) => {
  const [currentWalletInfo, setCurrentWalletInfo] = React.useState<any>(null);

  React.useEffect(() => {
    const generateCurrentWalletInfo = () => {
      const { wallets, delegation, tokenInfoStore, coinPriceStore, profile } = stores;

      try {
        const walletCurrentPoolInfo = getStakePoolMeta(stores);

        const selectedWallet = wallets.selected;
        if (selectedWallet == null) {
          throw new Error(`no selected Wallet. Should never happen`);
        }

        const currentWalletId = selectedWallet.publicDeriverId;
        const networkId = selectedWallet.networkId;

        // Backend services
        const { Backend } = getNetworkById(networkId);
        const { BackendService, BackendServiceZero } = Backend;

        // Total Ada balance calculation
        const rewards = delegation.getRewardBalanceOrZero(selectedWallet);
        const balance = selectedWallet.balance;
        const totalBalanceAmount = getTotalAmount(balance, rewards);

        const defaultEntry = totalBalanceAmount?.getDefaultEntry();
        const getTokenInfo = genLookupOrFail(tokenInfoStore?.tokenInfo);
        const tokenInfo = getTokenInfo(defaultEntry);
        const shiftedAmount = defaultEntry.amount.shiftedBy(-tokenInfo.Metadata.numberOfDecimals);
        const [beforeDecimalRewards, afterDecimalRewards] = splitAmount(shiftedAmount, tokenInfo.Metadata.numberOfDecimals);

        // Get Fiat price
        const ticker = tokenInfo.Metadata.ticker;
        const { currency } = profile.unitOfAccount;

        const getFiatCurrentPrice = coinPriceStore.getCurrentPrice;
        const fiatPrice = getFiatCurrentPrice(ticker, currency === null ? 'USD' : currency);
        const fiatDisplay = calculateAndFormatValue(shiftedAmount, fiatPrice);

        // Asset List
        const assetList = getAssetWalletAssetList(stores);

        setCurrentWalletInfo({
          currentPool: walletCurrentPoolInfo,
          networkId,
          walletId: currentWalletId,
          selectedWallet: selectedWallet,
          backendService: BackendService,
          backendServiceZero: BackendServiceZero,
          primaryTokenInfo: tokenInfo,
          walletBalance: {
            ada: `${beforeDecimalRewards}${afterDecimalRewards}`,
            fiatAmount: fiatDisplay || 0,
            currency: currency === null ? 'USD' : currency,
            percents: 0.0, //(Math.random()), NOT USED - will be deleted
            amount: 0.0, //(Math.random()), NOT USED - will be deleted
          },
          assetList: assetList,
          nftList: [],
        });
      } catch (error) {
        console.warn('ERROR trying to create wallet info', error);
      }
    };

    generateCurrentWalletInfo();
  }, [stores, stores.profile.unitOfAccount.currency, stores.coinPriceStore.currentPriceTickers?.length, stores.routes]);

  // Expose context value
  const contextValue = React.useMemo(() => ({ ...currentWalletInfo }), [currentWalletInfo]);

  return <WalletManagerContext.Provider value={contextValue}>{children}</WalletManagerContext.Provider>;
};

export const useWalletManager = () =>
  React.useContext(WalletManagerContext) ?? console.log('useWalletManager must be used within a WalletManagerProvider');

// Helper functions (same as your previous implementation)
const getStakePoolMeta = (stores: any) => {
  const publicDeriver = stores.wallets.selected;
  const delegationStore = stores.delegation;
  const currentPool = delegationStore.getDelegatedPoolId(publicDeriver);
  if (currentPool == null) return null;
  const networkInfo = publicDeriver.getParent().getNetworkInfo();
  const poolMeta = delegationStore.getLocalPoolInfo(networkInfo, currentPool);
  const poolInfo = delegationStore.getLocalRemotePoolInfo(networkInfo, currentPool) ?? {};
  if (poolMeta == null) {
    return null;
  }
  const name = poolMeta.info?.name ?? 'unknown';
  const delegatedPool = {
    id: String(currentPool),
    name,
    websiteUrl: poolMeta.info?.homepage,
    ticker: poolMeta.info?.ticker,
    ...poolInfo,
  };

  return {
    ...delegatedPool,
    ...poolMeta,
  };
};

const getTotalAmount = (walletAmount: any, rewards: any) => {
  return maybe(walletAmount, (w: any) => rewards.joinAddCopy(w));
};

const getAssetWalletAssetList = (stores: any) => {
  const spendableBalance = stores.transactions.balance;
  const getTokenInfo = genLookupOrFail(stores.tokenInfoStore.tokenInfo);
  if (spendableBalance == null) return [];
  return [spendableBalance.getDefaultEntry(), ...spendableBalance.nonDefaultEntries()]
    .map((entry: any) => ({
      entry,
      info: getTokenInfo(entry),
    }))
    .filter((item: any) => item.info.IsNFT === false)
    .map((token: any) => {
      const numberOfDecimals = token.info?.Metadata.numberOfDecimals ?? 0;
      const shiftedAmount = token.entry.amount.shiftedBy(-numberOfDecimals);
      const [beforeDecimal, afterDecimal] = splitAmount(shiftedAmount, numberOfDecimals);
      const tokenName = truncateToken(getTokenStrictName(token.info).name ?? '-');
      const tokenId = getTokenIdentifierIfExists(token.info) ?? '-';
      const tokenLogo = `data:image/png;base64,${token.info.Metadata.policyId === '' ? cardanoAdaBase64Logo : token.info.Metadata.logo
        }`;

      const getFiatCurrentPrice = stores.coinPriceStore.getCurrentPrice;
      const { currency } = stores.profile.unitOfAccount;

      const fiatPrice = getFiatCurrentPrice(tokenName, currency === null ? 'USD' : currency);
      const fiatDisplay = calculateAndFormatValue(shiftedAmount, fiatPrice);
      return {
        name: tokenName,
        id: tokenId,
        totalAmount: [beforeDecimal, afterDecimal].join(''),
        amountForSorting: shiftedAmount,
        quantity: asQuantity(token.entry.amount),
        tokenLogo: tokenLogo,
        ...token.info.Metadata,
        totalAmountFiat: fiatDisplay,
        price: fiatPrice,
        portfolioPercents: Math.round(100 * Math.random()), // MOCKED
        overview: {
          description:
            "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, ",
          website: 'https://www.cardano.org',
          detailOn: 'https://www.yoroiwallet.com',
          policyId: '2aa9c1557fcf8e7caa049fa0911a8724a1cdaf8037fe0b431c6ac664',
          fingerprint:
            'asset311q8dhlxmgagkx0ldt4xc7wzdv2wza8gu2utxw294sr23zuc8dhlxmgagkx0ldt4xc7wzk8213yjnad98h1n1j99naskajsj6789',
        },
      };
    });
};

export const asQuantity = (value: BigNumber | number | string) => {
  const bn = new BigNumber(value);
  if (bn.isNaN() || !bn.isFinite()) {
    throw new Error('Invalid quantity');
  }
  return bn;
};
