// @flow

import type { Node } from 'react';
import React, { Suspense } from 'react';
import { Navigate, Route, Routes, Outlet } from 'react-router';
import ConnectedWebsitesPage, { ConnectedWebsitesPagePromise } from './containers/dapp-connector/ConnectedWebsitesContainer';
import Transfer, { WalletTransferPagePromise } from './containers/transfer/Transfer';
import AddWalletPage from './containers/wallet/AddWalletPage';
import StakingPage, { StakingPageContentPromise } from './containers/wallet/staking/StakingPage';
import VotingPage, { VotingPageContentPromise } from './containers/wallet/voting/VotingPage';
import { ROUTES } from './routes-config';
import type { StoresMap, StoresProps } from './stores/index';
// Todo: Add lazy loading
import { Stack } from '@mui/material';
import { QueryClient, QueryClientProvider } from 'react-query';
import FullscreenLayout from './components/layout/FullscreenLayout';
import LoadingSpinner from './components/widgets/LoadingSpinner';
import LoadingPage from './containers/LoadingPage';
import Settings from './containers/settings/Settings';
import SwapPageContainer from './containers/swap/SwapPageContainer';
import SwapProvider from './containers/swap/SwapProvider';
import AssetsWrapper from './containers/wallet/AssetsWrapper';
import CreateWalletPage, { CreateWalletPagePromise } from './containers/wallet/CreateWalletPageContainer';
import NFTsWrapper from './containers/wallet/NFTsWrapper';
import Wallet from './containers/wallet/Wallet';
import RestoreWalletPage, { RestoreWalletPagePromise } from './containers/wallet/restore/RestoreWalletPage';

// GOLABL Context
// $FlowIgnore: suppressing this error
import { CurrencyProvider } from './UI/context/CurrencyContext';

import PagePreparation from './components/page-preparation/PagePreparation';
// New UI pages
// $FlowIgnore: suppressing this error
import { createCurrrentWalletInfo } from './UI/utils/createCurrentWalletInfo';
// $FlowIgnore: suppressing this error
import { GovernanceContextProvider } from './UI/features/governace/module/GovernanceContextProvider';
// $FlowIgnore: suppressing this error
import { SwapContextProvider } from './UI/features/swap-new/module/SwapContextProvider';
// $FlowIgnore: suppressing this error
import { PortfolioContextProvider } from './UI/features/portfolio/module/PortfolioContextProvider';
// $FlowIgnore: suppressing this error
import { NftGalleryContextProvider } from './UI/features/nfts/module/NftGalleryContextProvider';
// $FlowIgnore: suppressing this error
import { DappCenterContextProvider } from './UI/features/dapp-center/module/DappCenterContextProvider';
// $FlowIgnore: suppressing this error
import GovernanceDelegationFormPage from './UI/pages/Governance/GovernanceDelegationFormPage';
// $FlowIgnore: suppressing this error
import GovernanceStatusPage from './UI/pages/Governance/GovernanceStatusPage';
// $FlowIgnore: suppressing this error
import GovernanceTransactionFailedPage from './UI/pages/Governance/GovernanceTransactionFailedPage';
// $FlowIgnore: suppressing this error
import GovernanceTransactionSubmittedPage from './UI/pages/Governance/GovernanceTransactionSubmittedPage';
// $FlowIgnore: suppressing this error
import PortfolioDappsPage from './UI/pages/portfolio/PortfolioDappsPage';
// $FlowIgnore: suppressing this error
import NftsPage from './UI/pages/nfts/NftsPage';
// $FlowIgnore: suppressing this error
import NftDetailsPage from './UI/pages/nfts/NftsDetailPage';
// $FlowIgnore: suppressing this error
import PortfolioDetailPage from './UI/pages/portfolio/PortfolioDetailPage';
// $FlowIgnore: suppressing this error
import { ampli } from '../ampli/index';
// $FlowIgnore: suppressing this error
import PortfolioPage from './UI/pages/portfolio/PortfolioPage';
// $FlowIgnore: suppressing this error
import AssetSwapRevampPage from './UI/pages/Swap-New/AssetSwapPage';
// $FlowIgnore: suppressing this error
import SwapOrdersRevampPage from './UI/pages/Swap-New/SwapOrdersPage';

// $FlowIgnore: suppressing this error
// import DappCenterPage from './UI/pages/dapp-center/DappCenterPage';
import BuySellDialog from './components/buySell/BuySellDialog';
// $FlowIgnore: suppressing this error
import TransactionReviewFailedPage from './UI/pages/TransactionReview/TransactionReviewFailedPage';

// PAGES
const LanguageSelectionPagePromise = () => import('./containers/profile/LanguageSelectionPage');
const LanguageSelectionPage = React.lazy(LanguageSelectionPagePromise);
const TermsOfUsePagePromise = () => import('./containers/profile/TermsOfUsePage');
const TermsOfUsePage = React.lazy(TermsOfUsePagePromise);
const UriPromptPagePromise = () => import('./containers/profile/UriPromptPage');
const UriPromptPage = React.lazy(UriPromptPagePromise);
const OptForAnalyticsPagePromise = () => import('./containers/profile/OptForAnalyticsPage');
const OptForAnalyticsPage = React.lazy(OptForAnalyticsPagePromise);

// SETTINGS
const GeneralSettingsPagePromise = () => import('./containers/settings/categories/GeneralSettingsPage');
const GeneralSettingsPage = React.lazy(GeneralSettingsPagePromise);
const WalletSettingsPagePromise = () => import('./containers/settings/categories/WalletSettingsPage');
const WalletSettingsPage = React.lazy(WalletSettingsPagePromise);
const ExternalStorageSettingsPagePromise = () => import('./containers/settings/categories/ExternalStorageSettingsPage');
const ExternalStorageSettingsPage = React.lazy(ExternalStorageSettingsPagePromise);
const TermsOfUseSettingsPagePromise = () => import('./containers/settings/categories/TermsOfUseSettingsPage');
const TermsOfUseSettingsPage = React.lazy(TermsOfUseSettingsPagePromise);
const SupportSettingsPagePromise = () => import('./containers/settings/categories/SupportSettingsPage');
const SupportSettingsPage = React.lazy(SupportSettingsPagePromise);
const AnalyticsSettingsPagePromise = () => import('./containers/settings/categories/AnalyticsSettingsPage');
const AnalyticsSettingsPage = React.lazy(AnalyticsSettingsPagePromise);

const NightlyPagePromise = () => import('./containers/profile/NightlyPage');
const NightlyPage = React.lazy(NightlyPagePromise);

const WalletSummaryPagePromise = () => import('./containers/wallet/WalletSummaryPage');
const WalletSummaryPage = React.lazy(WalletSummaryPagePromise);

const WalletSendPagePromise = () => import('./containers/wallet/WalletSendPage');
const WalletSendPage = React.lazy(WalletSendPagePromise);

const WalletReceivePagePromise = () => import('./containers/wallet/WalletReceivePage');
const WalletReceivePage = React.lazy(WalletReceivePagePromise);

const URILandingPagePromise = () => import('./containers/uri/URILandingPage');
const URILandingPage = React.lazy(URILandingPagePromise);

const ReceivePromise = () => import('./containers/wallet/Receive');
const Receive = React.lazy(ReceivePromise);

const ComplexityLevelSettingsPagePromise = () => import('./containers/settings/categories/ComplexityLevelSettingsPage');
const ComplexityLevelSettingsPage = React.lazy(ComplexityLevelSettingsPagePromise);

const ComplexityLevelPagePromise = () => import('./containers/profile/ComplexityLevelPage');
const ComplexityLevelPage = React.lazy(ComplexityLevelPagePromise);

const BlockchainSettingsPagePromise = () => import('./containers/settings/categories/BlockchainSettingsPage');
const BlockchainSettingsPage = React.lazy(BlockchainSettingsPagePromise);

const TokensPageRevampPromise = () => import('./containers/wallet/TokensPageRevamp');
const TokensPageRevamp = React.lazy(TokensPageRevampPromise);

const TokensDetailPageRevampPromise = () => import('./containers/wallet/TokenDetailPageRevamp');
const TokensDetailPageRevamp = React.lazy(TokensDetailPageRevampPromise);

const CashbackPagePromise = () => import('./containers/cashback/CashbackPage');
const CashbackPage = React.lazy(CashbackPagePromise);

const NFTsPageRevampPromise = () => import('./containers/wallet/NFTsPageRevamp');
const NFTsPageRevamp = React.lazy(NFTsPageRevampPromise);

const NFTDetailPageRevampPromise = () => import('./containers/wallet/NFTDetailPageRevamp');
const NFTDetailPageRevamp = React.lazy(NFTDetailPageRevampPromise);

// SWAP
const SwapPagePromise = () => import('./containers/swap/asset-swap/SwapPage');
const SwapPage = React.lazy(SwapPagePromise);
const SwapOrdersPagePromise = () => import('./containers/swap/orders/OrdersPage');
const SwapOrdersPage = React.lazy(SwapOrdersPagePromise);

const ExchangeEndPagePromise = () => import('./containers/ExchangeEndPage');
const ExchangeEndPage = React.lazy(ExchangeEndPagePromise);

export const LazyLoadPromises: Array<() => any> = [
  StakingPageContentPromise,
  CreateWalletPagePromise,
  RestoreWalletPagePromise,
  LanguageSelectionPagePromise,
  TermsOfUsePagePromise,
  UriPromptPagePromise,
  GeneralSettingsPagePromise,
  WalletSettingsPagePromise,
  ExternalStorageSettingsPagePromise,
  TermsOfUseSettingsPagePromise,
  SupportSettingsPagePromise,
  NightlyPagePromise,
  WalletSummaryPagePromise,
  WalletSendPagePromise,
  WalletReceivePagePromise,
  URILandingPagePromise,
  WalletTransferPagePromise,
  ReceivePromise,
  VotingPageContentPromise,
  ComplexityLevelSettingsPagePromise,
  ComplexityLevelPagePromise,
  BlockchainSettingsPagePromise,
  TokensPageRevampPromise,
  TokensDetailPageRevampPromise,
  NFTsPageRevampPromise,
  NFTDetailPageRevampPromise,
  ConnectedWebsitesPagePromise,
  SwapPagePromise,
  SwapOrdersPagePromise,
  OptForAnalyticsPagePromise,
  AnalyticsSettingsPagePromise,
  ExchangeEndPagePromise,
];

export const YoroiRoutes = (stores: StoresMap): Node => {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={null}>
        <Routes>
          <Route path={ROUTES.ROOT} element={<LoadingPage stores={stores} />} />
          <Route path={ROUTES.NIGHTLY_INFO} element={<NightlyPage stores={stores} />} />
          <Route
            path={ROUTES.PROFILE.LANGUAGE_SELECTION}
            element={<LanguageSelectionPage stores={stores} />}
          />
          <Route
            path={ROUTES.PROFILE.COMPLEXITY_LEVEL}
            element={<ComplexityLevelPage stores={stores} />}
          />
          <Route path={ROUTES.PROFILE.TERMS_OF_USE} element={<TermsOfUsePage stores={stores} />} />
          <Route path={ROUTES.PROFILE.URI_PROMPT} element={<UriPromptPage stores={stores} />} />
          <Route
            path={ROUTES.PROFILE.OPT_FOR_ANALYTICS}
            element={<OptForAnalyticsPage stores={stores} />}
          />
          <Route path={ROUTES.STAKING} element={<StakingPage stores={stores} />} />
          <Route element={<AssetsSubpages stores={stores} />}>
            <Route path={ROUTES.ASSETS.ROOT} element={<TokensPageRevamp stores={stores} />} />
            <Route path={ROUTES.ASSETS.DETAILS} element={<TokensDetailPageRevamp stores={stores} />} />
          </Route>
          <Route element={<NFTsSubPages stores={stores} />}>
            <Route path={ROUTES.NFTS.ROOT} element={<NFTsPageRevamp stores={stores} />} />
            <Route path={ROUTES.NFTS.DETAILS} element={<NFTDetailPageRevamp stores={stores} />} />
          </Route>
          <Route element={<NftGallerySubPages stores={stores} />}>
            <Route exact path={ROUTES.NFT_GALLERY.ROOT} element={<NftsPage stores={stores} />} />
            <Route exact path={ROUTES.NFT_GALLERY.DETAILS} element={<NftDetailsPage tores={stores} />} />
          </Route>
          <Route path={ROUTES.CASHBACK.ROOT} element={<CashbackPage stores={stores} />} />
          <Route path={ROUTES.WALLETS.ADD} element={<AddWalletPage stores={stores} />} />
          <Route
            path={ROUTES.WALLETS.RESTORE_WALLET}
            element={<RestoreWalletPage stores={stores} />}
          />
          <Route
            path={ROUTES.WALLETS.CREATE_NEW_WALLET}
            element={<CreateWalletPage stores={stores} />}
          />
          <Route
            path={ROUTES.DAPP_CONNECTOR.CONNECTED_WEBSITES}
            element={<ConnectedWebsitesPage stores={stores} />}
          />
          <Route element={<WalletsSubpages stores={stores} />}>
            <Route path={ROUTES.WALLETS.TRANSACTIONS} element={<WalletSummaryPage stores={stores} />} />
            <Route path={ROUTES.WALLETS.SEND} element={<WalletSendPage stores={stores} />} />
            <Route
              path={ROUTES.WALLETS.RECEIVE.ROOT + '/*'}
              element={
                <Receive stores={stores}>
                  <WalletReceivePage stores={stores} />
                </Receive>
              }
            />

            <Route path={ROUTES.WALLETS.ROOT} element={<Navigate to={ROUTES.WALLETS.TRANSACTIONS} />} />
          </Route>
          <Route element={<SettingsSubpages stores={stores} />}>
            <Route path={ROUTES.SETTINGS.GENERAL} element={<GeneralSettingsPage stores={stores} />} />
            <Route path={ROUTES.SETTINGS.BLOCKCHAIN} element={<BlockchainSettingsPage stores={stores} />} />
            <Route path={ROUTES.SETTINGS.TERMS_OF_USE} element={<TermsOfUseSettingsPage stores={stores} />} />
            <Route path={ROUTES.SETTINGS.WALLET} element={<WalletSettingsPage stores={stores} />} />
            <Route
              path={ROUTES.SETTINGS.EXTERNAL_STORAGE}
              element={<ExternalStorageSettingsPage stores={stores} />}
            />
            <Route path={ROUTES.SETTINGS.SUPPORT} element={<SupportSettingsPage stores={stores} />} />
            <Route
              path={ROUTES.SETTINGS.LEVEL_OF_COMPLEXITY}
              element={<ComplexityLevelSettingsPage stores={stores} />}
            />
            <Route path={ROUTES.SETTINGS.ANALYTICS} element={<AnalyticsSettingsPage stores={stores} />} />

            <Route path={ROUTES.SETTINGS.ROOT} element={<Navigate to={ROUTES.SETTINGS.GENERAL} />} />
          </Route>
          <Route element={<SwapSubpages stores={stores}/>}>
            <Route path={ROUTES.SWAP.ROOT} element={<SwapPage stores={stores} />} />
            <Route path={ROUTES.SWAP.ORDERS} element={<SwapOrdersPage stores={stores} />} />
            <Route path={ROUTES.SWAP.ERROR} element={<PagePreparation stores={stores} />} />
          </Route>
          <Route path={ROUTES.TRANSFER.ROOT} element={<Transfer stores={stores} />} />
          <Route path={ROUTES.SEND_FROM_URI.ROOT} element={<URILandingPage stores={stores} />} />
          <Route path={ROUTES.REVAMP.CATALYST_VOTING} element={<VotingPage stores={stores} />} />
          <Route path={ROUTES.EXCHANGE_END} element={<ExchangeEndPage stores={stores} />} />

          {/* NEW UI Routes */}
          <Route
            path={ROUTES.SWAP_REVAMP.ASSET_SWAP}
            component={props => wrapSwapRevamp({ ...props, stores }, SwapRevampSubpages(stores))}
          />

          <Route element={<GovernanceSubpages stores={stores}/>}>
            <Route path={ROUTES.Governance.ROOT} element={<GovernanceStatusPage stores={stores} />} />
            <Route
              path={ROUTES.Governance.DELEGATE}
              element={<GovernanceDelegationFormPage stores={stores} />}
            />
            <Route
              path={ROUTES.Governance.SUBMITTED}
              element={<GovernanceTransactionSubmittedPage stores={stores} />}
            />
            <Route
              path={ROUTES.Governance.FAIL}
              element={<GovernanceTransactionFailedPage stores={stores} />}
            />
          </Route>
          <Route element={<PortfolioSubpages stores={stores} />}>
            <Route path={ROUTES.PORTFOLIO.ROOT} element={<PortfolioPage stores={stores} />} />
            <Route path={ROUTES.PORTFOLIO.DAPPS} element={<PortfolioDappsPage stores={stores} />} />
            <Route path={ROUTES.PORTFOLIO.DETAILS} element={<PortfolioDetailPage stores={stores} />} />
          </Route>
          <Route
            path={ROUTES.TX_REVIEW.FAIL}
            element={<TransactionReviewFailedPage stores={stores} />}
          />
          <Route
            path={ROUTES.TX_REVIEW.FAIL}
            element={<TransactionReviewFailedPage stores={stores} />}
          />
        </Routes>

      </Suspense>
    </QueryClientProvider>
  );
};

const WalletsSubpages = ({ stores }) => (
  <Wallet stores={stores}>
    <Outlet />
  </Wallet>
);

const NftGallerySubPages = ({ stores }) => (
  <NftGalleryContextProvider stores={stores}>
    <Outlet />
  </NftGalleryContextProvider>
);

const SwapRevampSubpages = stores => (
  <Routes>
    <Route exact path={ROUTES.SWAP_REVAMP.ASSET_SWAP} component={props => <AssetSwapRevampPage {...props} stores={stores} />} />
    <Route exact path={ROUTES.SWAP_REVAMP.ORDERS} component={props => <SwapOrdersRevampPage {...props} stores={stores} />} />
    <Redirect to={ROUTES.SWAP_REVAMP.ASSET_SWAP} />
  </Routes>
);

const SwapSubpages = ({ stores }) => {
  // const queryClient = new QueryClient();

  const loader = (
    <FullscreenLayout bottomPadding={0}>
      <Stack alignItems="center" justifyContent="center" height="50vh">
        <LoadingSpinner />
      </Stack>
    </FullscreenLayout>
  );
  return (
    // <QueryClientProvider client={queryClient}>
    <SwapProvider publicDeriver={stores.wallets.selected}>
      <SwapPageContainer stores={stores}>
        <Suspense fallback={loader}><Outlet /></Suspense>
      </SwapPageContainer>
    </SwapProvider>
    // </QueryClientProvider>
  );
};

const SettingsSubpages = ({ stores }) => (
  <Settings stores={stores}>
    <Suspense fallback={null}><Outlet /></Suspense>
  </Settings>
);

const PortfolioSubpages = ({ stores }) => {
  const { shouldHideBalance, unitOfAccount } = stores.profile;

  const currentWalletInfo = createCurrrentWalletInfo(stores);

  const openDialogWrapper = dialog => {
    stores.uiDialogs.open({ dialog });
  };

  return (
    <CurrencyProvider currency={unitOfAccount.currency || 'USD'}>
      <PortfolioContextProvider
        settingFiatPairUnit={unitOfAccount}
        currentWallet={currentWalletInfo}
        openDialogWrapper={openDialogWrapper}
        shouldHideBalance={shouldHideBalance}
      >
        <Suspense fallback={null}><Outlet /></Suspense>
      </PortfolioContextProvider>
    </CurrencyProvider>
  );
};

const NFTsSubPages = ({ stores })=> (
  <NFTsWrapper stores={stores}>
    <Suspense fallback={null}><Outlet /></Suspense>
  </NFTsWrapper>
);

const AssetsSubpages = ({ stores }) => (
  <AssetsWrapper stores={stores}>
    <Suspense fallback={null}><Outlet /></Suspense>
  </AssetsWrapper>
);

// NEW UI - TODO: to be refactred
const GovernanceSubpages = ({ stores }) => {
  const { unitOfAccount } = stores.profile;
  const currentWalletInfo = createCurrrentWalletInfo(stores);
  const { delegationTransaction } = stores.substores.ada;
  const delegationTxResult = delegationTransaction.createDelegationTx.result;
  const delegationTxError = delegationTransaction.createDelegationTx.error;

  return (
    <CurrencyProvider currency={unitOfAccount.currency || 'USD'}>
      <GovernanceContextProvider
        currentWallet={currentWalletInfo}
        createDrepDelegationTransaction={request => stores.delegation.createDrepDelegationTransaction(request)}
        signDelegationTransaction={request => stores.substores.ada.delegationTransaction.signTransaction(request)}
        txDelegationResult={delegationTxResult}
        txDelegationError={delegationTxError}
        tokenInfo={stores.tokenInfoStore.tokenInfo}
        triggerBuySellAdaDialog={() => stores.uiDialogs.open({ dialog: BuySellDialog })}
        getCurrentPrice={stores.coinPriceStore.getCurrentPrice}
        ampli={ampli}
      >
        <Suspense fallback={null}><Outlet /></Suspense>;
      </GovernanceContextProvider>
    </CurrencyProvider>
  );
};

export function wrapDappCenter(dappCenterProps: StoresProps, children: Node): Node {
  const currentWalletInfo = createCurrrentWalletInfo(dappCenterProps.stores);

  const openDialogWrapper = (dialog): void => {
    dappCenterProps.stores.uiDialogs.open({ dialog });
  };

  return (
    <DappCenterContextProvider currentWallet={currentWalletInfo} openDialogWrapper={openDialogWrapper}>
      <Suspense fallback={null}>{children}</Suspense>
    </DappCenterContextProvider>
  );
}

export function wrapNftGallery(nftGalleryProps: StoresProps, children: Node): Node {
  return (
    <NftGalleryContextProvider stores={nftGalleryProps.stores}>
      <Suspense fallback={null}>{children}</Suspense>
    </NftGalleryContextProvider>
  );
}

export function wrapSwapRevamp(dappCenterProps: StoresProps, children: Node): Node {
  const currentWalletInfo = createCurrrentWalletInfo(dappCenterProps.stores);

  return (
    <SwapContextProvider currentWallet={currentWalletInfo}>
      <Suspense fallback={null}>{children}</Suspense>
    </SwapContextProvider>
  );
}
