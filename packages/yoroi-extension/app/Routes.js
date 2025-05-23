// @flow

import type { Node } from 'react';
import React, { Suspense } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
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

const WalletSwitchPromise = () => import('./containers/WalletSwitch');
const WalletSwitch = React.lazy(WalletSwitchPromise);

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
  WalletSwitchPromise,
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

export const Routes = (stores: StoresMap): Node => {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={null}>
        <Switch>
          <Route exact path={ROUTES.ROOT} component={props => <LoadingPage {...props} stores={stores} />} />
          <Route exact path={ROUTES.NIGHTLY_INFO} component={props => <NightlyPage {...props} stores={stores} />} />
          <Route
            exact
            path={ROUTES.PROFILE.LANGUAGE_SELECTION}
            component={props => <LanguageSelectionPage {...props} stores={stores} />}
          />
          <Route
            exact
            path={ROUTES.PROFILE.COMPLEXITY_LEVEL}
            component={props => <ComplexityLevelPage {...props} stores={stores} />}
          />
          <Route exact path={ROUTES.PROFILE.TERMS_OF_USE} component={props => <TermsOfUsePage {...props} stores={stores} />} />
          <Route exact path={ROUTES.PROFILE.URI_PROMPT} component={props => <UriPromptPage {...props} stores={stores} />} />
          <Route
            exact
            path={ROUTES.PROFILE.OPT_FOR_ANALYTICS}
            component={props => <OptForAnalyticsPage {...props} stores={stores} />}
          />
          <Route exact path={ROUTES.STAKING} component={props => <StakingPage {...props} stores={stores} />} />
          <Route path={ROUTES.ASSETS.ROOT} component={props => wrapAssets({ ...props, stores }, AssetsSubpages(stores))} />
          <Route path={ROUTES.NFTS.ROOT} component={props => wrapNFTs({ ...props, stores }, NFTsSubPages(stores))} />
          <Route
            path={ROUTES.NFT_GALLERY.ROOT}
            component={props => wrapNftGallery({ ...props, stores }, NftGallerySubPages(stores))}
          />
          <Route path={ROUTES.CASHBACK.ROOT} component={props => <CashbackPage {...props} stores={stores} />} />
          <Route exact path={ROUTES.WALLETS.ADD} component={props => <AddWalletPage {...props} stores={stores} />} />
          <Route
            exact
            path={ROUTES.WALLETS.RESTORE_WALLET}
            component={props => <RestoreWalletPage {...props} stores={stores} />}
          />
          <Route
            exact
            path={ROUTES.WALLETS.CREATE_NEW_WALLET}
            component={props => <CreateWalletPage {...props} stores={stores} />}
          />
          <Route
            exact
            path={ROUTES.DAPP_CONNECTOR.CONNECTED_WEBSITES}
            component={props => <ConnectedWebsitesPage {...props} stores={stores} />}
          />
          <Route path={ROUTES.WALLETS.ROOT} component={props => wrapWallet({ ...props, stores }, WalletsSubpages(stores))} />
          <Route path={ROUTES.SETTINGS.ROOT} component={props => wrapSettings({ ...props, stores }, SettingsSubpages(stores))} />
          <Route path={ROUTES.SWAP.ROOT} component={props => wrapSwap({ ...props, stores }, SwapSubpages(stores))} />
          <Route path={ROUTES.TRANSFER.ROOT} component={props => <Transfer {...props} stores={stores} />} />
          <Route exact path={ROUTES.SEND_FROM_URI.ROOT} component={props => <URILandingPage {...props} stores={stores} />} />
          <Route exact path={ROUTES.SWITCH} component={props => <WalletSwitch {...props} stores={stores} />} />
          <Route exact path={ROUTES.REVAMP.CATALYST_VOTING} component={props => <VotingPage {...props} stores={stores} />} />
          <Route exact path={ROUTES.EXCHANGE_END} component={props => <ExchangeEndPage {...props} stores={stores} />} />

          {/* NEW UI Routes */}
          <Route
            path={ROUTES.SWAP_REVAMP.ASSET_SWAP}
            component={props => wrapSwapRevamp({ ...props, stores }, SwapRevampSubpages(stores))}
          />

          <Route
            path={ROUTES.Governance.ROOT}
            component={props => wrapGovernance({ ...props, stores }, GovernanceSubpages(stores))}
          />
          <Route path={ROUTES.PORTFOLIO.ROOT} component={() => PortfolioSubpages(stores)} />
          <Route
            exact
            path={ROUTES.TX_REVIEW.FAIL}
            component={props => <TransactionReviewFailedPage {...props} stores={stores} />}
          />
          <Route
            exact
            path={ROUTES.TX_REVIEW.FAIL}
            component={props => <TransactionReviewFailedPage {...props} stores={stores} />}
          />

          <Redirect to={ROUTES.WALLETS.ROOT} />
        </Switch>
      </Suspense>
    </QueryClientProvider>
  );
};

const WalletsSubpages = stores => (
  <Switch>
    <Route exact path={ROUTES.WALLETS.TRANSACTIONS} component={props => <WalletSummaryPage {...props} stores={stores} />} />
    <Route exact path={ROUTES.WALLETS.SEND} component={props => <WalletSendPage {...props} stores={stores} />} />
    <Route
      path={ROUTES.WALLETS.RECEIVE.ROOT}
      component={props => wrapReceive({ ...props, stores }, <WalletReceivePage {...props} stores={stores} />)}
    />
  </Switch>
);

const SwapSubpages = stores => (
  <Switch>
    <Route exact path={ROUTES.SWAP.ROOT} component={props => <SwapPage {...props} stores={stores} />} />
    <Route exact path={ROUTES.SWAP.ORDERS} component={props => <SwapOrdersPage {...props} stores={stores} />} />
    <Route exact path={ROUTES.SWAP.ERROR} component={props => <PagePreparation {...props} stores={stores} />} />
    <Redirect to={ROUTES.SWAP.ROOT} />
  </Switch>
);

const SettingsSubpages = stores => (
  <Switch>
    <Route exact path={ROUTES.SETTINGS.GENERAL} component={props => <GeneralSettingsPage {...props} stores={stores} />} />
    <Route exact path={ROUTES.SETTINGS.BLOCKCHAIN} component={props => <BlockchainSettingsPage {...props} stores={stores} />} />
    <Route exact path={ROUTES.SETTINGS.TERMS_OF_USE} component={props => <TermsOfUseSettingsPage {...props} stores={stores} />} />
    <Route exact path={ROUTES.SETTINGS.WALLET} component={props => <WalletSettingsPage {...props} stores={stores} />} />
    <Route
      exact
      path={ROUTES.SETTINGS.EXTERNAL_STORAGE}
      component={props => <ExternalStorageSettingsPage {...props} stores={stores} />}
    />
    <Route exact path={ROUTES.SETTINGS.SUPPORT} component={props => <SupportSettingsPage {...props} stores={stores} />} />
    <Route
      exact
      path={ROUTES.SETTINGS.LEVEL_OF_COMPLEXITY}
      component={props => <ComplexityLevelSettingsPage {...props} stores={stores} />}
    />
    <Route exact path={ROUTES.SETTINGS.ANALYTICS} component={props => <AnalyticsSettingsPage {...props} stores={stores} />} />
    <Redirect to={ROUTES.SETTINGS.GENERAL} />
  </Switch>
);

const PortfolioSubpages = stores =>
  WrapPortfolio(
    { stores },
    <Switch>
      <Route exact path={ROUTES.PORTFOLIO.ROOT} component={props => <PortfolioPage {...props} stores={stores} />} />
      <Route exact path={ROUTES.PORTFOLIO.DAPPS} component={props => <PortfolioDappsPage {...props} stores={stores} />} />
      <Route exact path={ROUTES.PORTFOLIO.DETAILS} component={props => <PortfolioDetailPage {...props} stores={stores} />} />
    </Switch>
  );

const NFTsSubPages = stores => (
  <Switch>
    <Route exact path={ROUTES.NFTS.ROOT} component={props => <NFTsPageRevamp {...props} stores={stores} />} />
    <Route exact path={ROUTES.NFTS.DETAILS} component={props => <NFTDetailPageRevamp {...props} stores={stores} />} />
  </Switch>
);

const NftGallerySubPages = stores => (
  <Switch>
    <Route exact path={ROUTES.NFT_GALLERY.ROOT} component={props => <NftsPage {...props} stores={stores} />} />
    <Route exact path={ROUTES.NFT_GALLERY.DETAILS} component={props => <NftDetailsPage {...props} stores={stores} />} />
  </Switch>
);

const AssetsSubpages = stores => (
  <Switch>
    <Route exact path={ROUTES.ASSETS.ROOT} component={props => <TokensPageRevamp {...props} stores={stores} />} />
    <Route exact path={ROUTES.ASSETS.DETAILS} component={props => <TokensDetailPageRevamp {...props} stores={stores} />} />
  </Switch>
);

const GovernanceSubpages = stores => (
  <Switch>
    <Route exact path={ROUTES.Governance.ROOT} component={props => <GovernanceStatusPage {...props} stores={stores} />} />
    <Route
      exact
      path={ROUTES.Governance.DELEGATE}
      component={props => <GovernanceDelegationFormPage {...props} stores={stores} />}
    />
    <Route
      exact
      path={ROUTES.Governance.SUBMITTED}
      component={props => <GovernanceTransactionSubmittedPage {...props} stores={stores} />}
    />
    <Route
      exact
      path={ROUTES.Governance.FAIL}
      component={props => <GovernanceTransactionFailedPage {...props} stores={stores} />}
    />
  </Switch>
);

const SwapRevampSubpages = stores => (
  <Switch>
    <Route exact path={ROUTES.SWAP_REVAMP.ASSET_SWAP} component={props => <AssetSwapRevampPage {...props} stores={stores} />} />
    <Route exact path={ROUTES.SWAP_REVAMP.ORDERS} component={props => <SwapOrdersRevampPage {...props} stores={stores} />} />
    <Redirect to={ROUTES.SWAP_REVAMP.ASSET_SWAP} />
  </Switch>
);

export function wrapSwap(swapProps: StoresProps, children: Node): Node {
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
    <SwapProvider publicDeriver={swapProps.stores.wallets.selected}>
      <SwapPageContainer {...swapProps}>
        <Suspense fallback={loader}>{children}</Suspense>
      </SwapPageContainer>
    </SwapProvider>
    // </QueryClientProvider>
  );
}

export function wrapSettings(settingsProps: StoresProps, children: Node): Node {
  return (
    <Settings {...settingsProps}>
      <Suspense fallback={null}>{children}</Suspense>
    </Settings>
  );
}

export function wrapAssets(assetsProps: StoresProps, children: Node): Node {
  return (
    <AssetsWrapper {...assetsProps}>
      <Suspense fallback={null}>{children}</Suspense>
    </AssetsWrapper>
  );
}

export function wrapNFTs(assetsProps: StoresProps, children: Node): Node {
  return (
    <NFTsWrapper {...assetsProps}>
      <Suspense fallback={null}>{children}</Suspense>
    </NFTsWrapper>
  );
}

export function wrapWallet(walletProps: StoresProps, children: Node): Node {
  return (
    <Wallet {...walletProps}>
      <Suspense fallback={null}>{children}</Suspense>
    </Wallet>
  );
}

export function wrapReceive(receiveProps: StoresProps, children: Node): Node {
  return <Receive {...receiveProps}>{children}</Receive>;
}

// NEW UI - TODO: to be refactred
export function wrapGovernance(governanceProps: StoresProps, children: Node): Node {
  const { stores } = governanceProps;
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
        getCurrentPrice={governanceProps.stores.coinPriceStore.getCurrentPrice}
        ampli={ampli}
      >
        <Suspense fallback={null}>{children}</Suspense>;
      </GovernanceContextProvider>
    </CurrencyProvider>
  );
}

export function WrapPortfolio(portfolioProps: StoresProps, children: Node): Node {
  const { stores } = portfolioProps;
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
        <Suspense fallback={null}>{children}</Suspense>
      </PortfolioContextProvider>
    </CurrencyProvider>
  );
}

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

export function wrapSwapRevamp(swapProps: StoresProps, children: Node): Node {
  const currentWalletInfo = createCurrrentWalletInfo(swapProps.stores);
  const { unitOfAccount } = swapProps.stores.profile;

  return (
    <CurrencyProvider currency={unitOfAccount.currency || 'USD'}>
      <SwapContextProvider currentWallet={currentWalletInfo}>
        <Suspense fallback={null}>{children}</Suspense>
      </SwapContextProvider>
    </CurrencyProvider>
  );
}

export function wrapNftGallery(nftGalleryProps: StoresProps, children: Node): Node {
  return (
    <NftGalleryContextProvider stores={nftGalleryProps.stores}>
      <Suspense fallback={null}>{children}</Suspense>
    </NftGalleryContextProvider>
  );
}
