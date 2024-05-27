// @flow
import type { Node } from 'react';
import type { StoresMap } from './stores/index';
import type { ActionsMap } from './actions/index';
import type { StoresAndActionsProps } from './types/injectedProps.types';
import type { ConfigType } from '../config/config-types';
import { Route, Redirect, Switch } from 'react-router-dom';
import { ROUTES } from './routes-config';
import React, { Suspense } from 'react';
import StakingPage, { StakingPageContentPromise } from './containers/wallet/staking/StakingPage';
import Transfer, { WalletTransferPagePromise } from './containers/transfer/Transfer';
import VotingPage, { VotingPageContentPromise } from './containers/wallet/voting/VotingPage';
import ConnectedWebsitesPage, {
  ConnectedWebsitesPagePromise,
} from './containers/dapp-connector/ConnectedWebsitesContainer';
import AddWalletPage, { AddAnotherWalletPromise } from './containers/wallet/AddWalletPage';
// Todo: Add lazy loading
import RestoreWalletPage, {
  RestoreWalletPagePromise,
} from './containers/wallet/restore/RestoreWalletPage';
import CreateWalletPage, {
  CreateWalletPagePromise,
} from './containers/wallet/CreateWalletPageContainer';
import { QueryClient, QueryClientProvider } from 'react-query';
import LoadingPage from './containers/LoadingPage';
import Wallet from './containers/wallet/Wallet';
import Settings from './containers/settings/Settings';
import SwapPageContainer from './containers/swap/SwapPageContainer';
import AssetsWrapper from './containers/wallet/AssetsWrapper';
import NFTsWrapper from './containers/wallet/NFTsWrapper';
import SwapProvider from './containers/swap/SwapProvider';
import { Stack } from '@mui/material';
import LoadingSpinner from './components/widgets/LoadingSpinner';
import FullscreenLayout from './components/layout/FullscreenLayout';

// New UI pages
import GouvernanceStatusPage from './UI/pages/Gouvernance/GouvernanceStatusPage';
import GouvernanceDelegationFormPage from './UI/pages/Gouvernance/GouvernanceDelegationFormPage';
import GouvernanceTransactionSubmittedPage from './UI/pages/Gouvernance/GouvernanceTransactionSubmittedPage';
import GouvernanceTransactionFailedPage from './UI/pages/Gouvernance/GouvernanceTransactionFailedPage';

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
const GeneralSettingsPagePromise = () =>
  import('./containers/settings/categories/GeneralSettingsPage');
const GeneralSettingsPage = React.lazy(GeneralSettingsPagePromise);
const WalletSettingsPagePromise = () =>
  import('./containers/settings/categories/WalletSettingsPage');
const WalletSettingsPage = React.lazy(WalletSettingsPagePromise);
const ExternalStorageSettingsPagePromise = () =>
  import('./containers/settings/categories/ExternalStorageSettingsPage');
const ExternalStorageSettingsPage = React.lazy(ExternalStorageSettingsPagePromise);
const OAuthDropboxPagePromise = () => import('./containers/settings/categories/OAuthDropboxPage');
const OAuthDropboxPage = React.lazy(OAuthDropboxPagePromise);
const TermsOfUseSettingsPagePromise = () =>
  import('./containers/settings/categories/TermsOfUseSettingsPage');
const TermsOfUseSettingsPage = React.lazy(TermsOfUseSettingsPagePromise);
const SupportSettingsPagePromise = () =>
  import('./containers/settings/categories/SupportSettingsPage');
const SupportSettingsPage = React.lazy(SupportSettingsPagePromise);
const AnalyticsSettingsPagePromise = () =>
  import('./containers/settings/categories/AnalyticsSettingsPage');
const AnalyticsSettingsPage = React.lazy(AnalyticsSettingsPagePromise);

const NightlyPagePromise = () => import('./containers/profile/NightlyPage');
const NightlyPage = React.lazy(NightlyPagePromise);

const MyWalletsPagePromise = () => import('./containers/wallet/MyWalletsPage');
const MyWalletsPage = React.lazy(MyWalletsPagePromise);

const WalletSummaryPagePromise = () => import('./containers/wallet/WalletSummaryPage');
const WalletSummaryPage = React.lazy(WalletSummaryPagePromise);

const WalletSendPagePromise = () => import('./containers/wallet/WalletSendPage');
const WalletSendPage = React.lazy(WalletSendPagePromise);

const WalletAssetsPagePromise = () => import('./containers/wallet/WalletAssetsPage');
const WalletAssetsPage = React.lazy(WalletAssetsPagePromise);

const WalletReceivePagePromise = () => import('./containers/wallet/WalletReceivePage');
const WalletReceivePage = React.lazy(WalletReceivePagePromise);

const URILandingPagePromise = () => import('./containers/uri/URILandingPage');
const URILandingPage = React.lazy(URILandingPagePromise);

const ReceivePromise = () => import('./containers/wallet/Receive');
const Receive = React.lazy(ReceivePromise);

const StakingDashboardPagePromise = () =>
  import('./containers/wallet/staking/StakingDashboardPage');
const StakingDashboardPage = React.lazy(StakingDashboardPagePromise);

const CardanoStakingPagePromise = () => import('./containers/wallet/staking/CardanoStakingPage');
const CardanoStakingPage = React.lazy(CardanoStakingPagePromise);

const ComplexityLevelSettingsPagePromise = () =>
  import('./containers/settings/categories/ComplexityLevelSettingsPage');
const ComplexityLevelSettingsPage = React.lazy(ComplexityLevelSettingsPagePromise);

const ComplexityLevelPagePromise = () => import('./containers/profile/ComplexityLevelPage');
const ComplexityLevelPage = React.lazy(ComplexityLevelPagePromise);

const BlockchainSettingsPagePromise = () =>
  import('./containers/settings/categories/BlockchainSettingsPage');
const BlockchainSettingsPage = React.lazy(BlockchainSettingsPagePromise);

const WalletSwitchPromise = () => import('./containers/WalletSwitch');
const WalletSwitch = React.lazy(WalletSwitchPromise);

const TokensPageRevampPromise = () => import('./containers/wallet/TokensPageRevamp');
const TokensPageRevamp = React.lazy(TokensPageRevampPromise);

const TokensDetailPageRevampPromise = () => import('./containers/wallet/TokenDetailPageRevamp');
const TokensDetailPageRevamp = React.lazy(TokensDetailPageRevampPromise);

const NFTsPageRevampPromise = () => import('./containers/wallet/NFTsPageRevamp');
const NFTsPageRevamp = React.lazy(NFTsPageRevampPromise);

const NFTDetailPageRevampPromise = () => import('./containers/wallet/NFTDetailPageRevamp');
const NFTDetailPageRevamp = React.lazy(NFTDetailPageRevampPromise);

const YoroiPalettePagePromise = () => import('./containers/experimental/YoroiPalette');
const YoroiPalettePage = React.lazy(YoroiPalettePagePromise);

const YoroiThemesPagePromise = () => import('./containers/experimental/yoroiThemes');
const YoroiThemesPage = React.lazy(YoroiThemesPagePromise);

// SWAP
const SwapPagePromise = () => import('./containers/swap/asset-swap/SwapPage');
const SwapPage = React.lazy(SwapPagePromise);
const SwapOrdersPagePromise = () => import('./containers/swap/orders/OrdersPage');
const SwapOrdersPage = React.lazy(SwapOrdersPagePromise);

const ExchangeEndPagePromise = () => import('./containers/ExchangeEndPage');
const ExchangeEndPage = React.lazy(ExchangeEndPagePromise);

export const LazyLoadPromises: Array<() => any> = [
  AddAnotherWalletPromise,
  StakingPageContentPromise,
  CreateWalletPagePromise,
  RestoreWalletPagePromise,
  LanguageSelectionPagePromise,
  TermsOfUsePagePromise,
  UriPromptPagePromise,
  GeneralSettingsPagePromise,
  WalletSettingsPagePromise,
  ExternalStorageSettingsPagePromise,
  OAuthDropboxPagePromise,
  TermsOfUseSettingsPagePromise,
  SupportSettingsPagePromise,
  NightlyPagePromise,
  MyWalletsPagePromise,
  WalletSummaryPagePromise,
  WalletSendPagePromise,
  WalletAssetsPagePromise,
  WalletReceivePagePromise,
  URILandingPagePromise,
  WalletTransferPagePromise,
  ReceivePromise,
  StakingDashboardPagePromise,
  CardanoStakingPagePromise,
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
  YoroiPalettePagePromise,
  YoroiThemesPagePromise,
  SwapPagePromise,
  SwapOrdersPagePromise,
  OptForAnalyticsPagePromise,
  AnalyticsSettingsPagePromise,
  ExchangeEndPagePromise,
];

// populated by ConfigWebpackPlugin
declare var CONFIG: ConfigType;

export const Routes = (stores: StoresMap, actions: ActionsMap): Node => {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={null}>
        <Switch>
          <Route
            exact
            path={ROUTES.ROOT}
            component={props => <LoadingPage {...props} stores={stores} actions={actions} />}
          />
          <Route
            exact
            path={ROUTES.NIGHTLY_INFO}
            component={props => <NightlyPage {...props} stores={stores} actions={actions} />}
          />
          <Route
            exact
            path={ROUTES.PROFILE.LANGUAGE_SELECTION}
            component={props => (
              <LanguageSelectionPage {...props} stores={stores} actions={actions} />
            )}
          />
          <Route
            exact
            path={ROUTES.PROFILE.COMPLEXITY_LEVEL}
            component={props => (
              <ComplexityLevelPage {...props} stores={stores} actions={actions} />
            )}
          />
          <Route
            exact
            path={ROUTES.PROFILE.TERMS_OF_USE}
            component={props => <TermsOfUsePage {...props} stores={stores} actions={actions} />}
          />
          <Route
            exact
            path={ROUTES.PROFILE.URI_PROMPT}
            component={props => <UriPromptPage {...props} stores={stores} actions={actions} />}
          />
          <Route
            exact
            path={ROUTES.PROFILE.OPT_FOR_ANALYTICS}
            component={props => (
              <OptForAnalyticsPage {...props} stores={stores} actions={actions} />
            )}
          />
          <Route
            exact
            path={ROUTES.MY_WALLETS}
            component={props => <MyWalletsPage {...props} stores={stores} actions={actions} />}
          />
          <Route
            exact
            path={ROUTES.STAKING}
            component={props => <StakingPage {...props} stores={stores} actions={actions} />}
          />
          <Route
            path={ROUTES.ASSETS.ROOT}
            component={props =>
              wrapAssets({ ...props, stores, actions }, AssetsSubpages(stores, actions))
            }
          />
          <Route
            path={ROUTES.NFTS.ROOT}
            component={props =>
              wrapNFTs({ ...props, stores, actions }, NFTsSubPages(stores, actions))
            }
          />
          <Route
            exact
            path={ROUTES.WALLETS.ADD}
            component={props => <AddWalletPage {...props} stores={stores} actions={actions} />}
          />
          <Route
            exact
            path={ROUTES.WALLETS.RESTORE_WALLET}
            component={props => <RestoreWalletPage {...props} stores={stores} actions={actions} />}
          />
          <Route
            exact
            path={ROUTES.WALLETS.CREATE_NEW_WALLET}
            component={props => <CreateWalletPage {...props} stores={stores} actions={actions} />}
          />
          <Route
            exact
            path={ROUTES.DAPP_CONNECTOR.CONNECTED_WEBSITES}
            component={props => (
              <ConnectedWebsitesPage {...props} stores={stores} actions={actions} />
            )}
          />
          <Route
            exact
            path={ROUTES.EXPERIMENTAL.YOROI_PALETTE}
            component={props => <YoroiPalettePage {...props} stores={stores} actions={actions} />}
          />
          <Route
            exact
            path={ROUTES.EXPERIMENTAL.THEMES}
            component={props => <YoroiThemesPage {...props} stores={stores} actions={actions} />}
          />
          <Route
            path={ROUTES.WALLETS.ROOT}
            component={props =>
              wrapWallet({ ...props, stores, actions }, WalletsSubpages(stores, actions))
            }
          />
          <Route
            path={ROUTES.SETTINGS.ROOT}
            component={props =>
              wrapSettings({ ...props, stores, actions }, SettingsSubpages(stores, actions))
            }
          />
          <Route
            path={ROUTES.SWAP.ROOT}
            component={props =>
              wrapSwap({ ...props, stores, actions }, SwapSubpages(stores, actions))
            }
          />
          <Route
            path={ROUTES.TRANSFER.ROOT}
            component={props => <Transfer {...props} stores={stores} actions={actions} />}
          />
          <Route
            exact
            path={ROUTES.SEND_FROM_URI.ROOT}
            component={props => <URILandingPage {...props} stores={stores} actions={actions} />}
          />
          <Route
            exact
            path={ROUTES.OAUTH_FROM_EXTERNAL.DROPBOX}
            component={props => <OAuthDropboxPage {...props} stores={stores} actions={actions} />}
          />
          <Route
            exact
            path={ROUTES.SWITCH}
            component={props => <WalletSwitch {...props} stores={stores} actions={actions} />}
          />
          <Route
            exact
            path={ROUTES.REVAMP.CATALYST_VOTING}
            component={props => <VotingPage {...props} stores={stores} actions={actions} />}
          />
          <Route
            exact
            path={ROUTES.EXCHANGE_END}
            component={props => <ExchangeEndPage {...props} stores={stores} actions={actions} />}
          />

          {/* NEW UI Routes */}
          <Route
            path={ROUTES.Gouvernance.ROOT}
            component={props =>
              wrapGouvernance({ ...props, stores, actions }, GouvernanceSubpages(stores, actions))
            }
          />
          <Redirect to={ROUTES.MY_WALLETS} />
        </Switch>
      </Suspense>
    </QueryClientProvider>
  );
};

const WalletsSubpages = (stores, actions) => (
  <Switch>
    <Route
      exact
      path={ROUTES.WALLETS.TRANSACTIONS}
      component={props => <WalletSummaryPage {...props} stores={stores} actions={actions} />}
    />
    <Route
      exact
      path={ROUTES.WALLETS.SEND}
      component={props => <WalletSendPage {...props} stores={stores} actions={actions} />}
    />
    <Route
      path={ROUTES.WALLETS.ASSETS}
      component={props => <WalletAssetsPage {...props} stores={stores} actions={actions} />}
    />
    <Route
      path={ROUTES.WALLETS.RECEIVE.ROOT}
      component={props =>
        wrapReceive(
          { ...props, stores, actions },
          <WalletReceivePage {...props} stores={stores} actions={actions} />
        )
      }
    />
    <Route
      exact
      path={ROUTES.WALLETS.DELEGATION_DASHBOARD}
      component={props => <StakingDashboardPage {...props} stores={stores} actions={actions} />}
    />
    <Route
      exact
      path={ROUTES.WALLETS.ADAPOOL_DELEGATION_SIMPLE}
      component={props => (
        <CardanoStakingPage
          {...props}
          stores={stores}
          actions={actions}
          urlTemplate={CONFIG.poolExplorer.simpleTemplate}
        />
      )}
    />
    <Route
      exact
      path={ROUTES.WALLETS.CARDANO_DELEGATION}
      component={props => <CardanoStakingPage {...props} stores={stores} actions={actions} />}
    />
    <Route
      exact
      path={ROUTES.WALLETS.CATALYST_VOTING}
      component={props => <VotingPage {...props} stores={stores} actions={actions} />}
    />
  </Switch>
);

const SwapSubpages = (stores, actions) => (
  <Switch>
    <Route
      exact
      path={ROUTES.SWAP.ROOT}
      component={props => <SwapPage {...props} stores={stores} actions={actions} />}
    />
    <Route
      exact
      path={ROUTES.SWAP.ORDERS}
      component={props => <SwapOrdersPage {...props} stores={stores} actions={actions} />}
    />
    <Redirect to={ROUTES.SWAP.ROOT} />
  </Switch>
);

const SettingsSubpages = (stores, actions) => (
  <Switch>
    <Route
      exact
      path={ROUTES.SETTINGS.GENERAL}
      component={props => <GeneralSettingsPage {...props} stores={stores} actions={actions} />}
    />
    <Route
      exact
      path={ROUTES.SETTINGS.BLOCKCHAIN}
      component={props => <BlockchainSettingsPage {...props} stores={stores} actions={actions} />}
    />
    <Route
      exact
      path={ROUTES.SETTINGS.TERMS_OF_USE}
      component={props => <TermsOfUseSettingsPage {...props} stores={stores} actions={actions} />}
    />
    <Route
      exact
      path={ROUTES.SETTINGS.WALLET}
      component={props => <WalletSettingsPage {...props} stores={stores} actions={actions} />}
    />
    <Route
      exact
      path={ROUTES.SETTINGS.EXTERNAL_STORAGE}
      component={props => (
        <ExternalStorageSettingsPage {...props} stores={stores} actions={actions} />
      )}
    />
    <Route
      exact
      path={ROUTES.SETTINGS.SUPPORT}
      component={props => <SupportSettingsPage {...props} stores={stores} actions={actions} />}
    />
    <Route
      exact
      path={ROUTES.SETTINGS.LEVEL_OF_COMPLEXITY}
      component={props => (
        <ComplexityLevelSettingsPage {...props} stores={stores} actions={actions} />
      )}
    />
    <Route
      exact
      path={ROUTES.SETTINGS.ANALYTICS}
      component={props => <AnalyticsSettingsPage {...props} stores={stores} actions={actions} />}
    />
    <Redirect to={ROUTES.SETTINGS.GENERAL} />
  </Switch>
);

const AssetsSubpages = (stores, actions) => (
  <Switch>
    <Route
      exact
      path={ROUTES.ASSETS.ROOT}
      component={props => <TokensPageRevamp {...props} stores={stores} actions={actions} />}
    />
    <Route
      exact
      path={ROUTES.ASSETS.DETAILS}
      component={props => <TokensDetailPageRevamp {...props} stores={stores} actions={actions} />}
    />
  </Switch>
);

const NFTsSubPages = (stores, actions) => (
  <Switch>
    <Route
      exact
      path={ROUTES.NFTS.ROOT}
      component={props => <NFTsPageRevamp {...props} stores={stores} actions={actions} />}
    />
    <Route
      exact
      path={ROUTES.NFTS.DETAILS}
      component={props => <NFTDetailPageRevamp {...props} stores={stores} actions={actions} />}
    />
  </Switch>
);

const GouvernanceSubpages = (stores, actions) => (
  <Switch>
    <Route
      exact
      path={ROUTES.Gouvernance.ROOT}
      component={props => <GouvernanceStatusPage {...props} stores={stores} actions={actions} />}
    />
    <Route
      exact
      path={ROUTES.Gouvernance.DELEGATE}
      component={props => (
        <GouvernanceDelegationFormPage {...props} stores={stores} actions={actions} />
      )}
    />
    <Route
      exact
      path={ROUTES.Gouvernance.SUBMITTED}
      component={props => (
        <GouvernanceTransactionSubmittedPage {...props} stores={stores} actions={actions} />
      )}
    />
    <Route
      exact
      path={ROUTES.Gouvernance.FAIL}
      component={props => (
        <GouvernanceTransactionFailedPage {...props} stores={stores} actions={actions} />
      )}
    />
  </Switch>
);

export function wrapSwap(swapProps: StoresAndActionsProps, children: Node): Node {
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

export function wrapSettings(settingsProps: StoresAndActionsProps, children: Node): Node {
  return (
    <Settings {...settingsProps}>
      <Suspense fallback={null}>{children}</Suspense>
    </Settings>
  );
}

export function wrapAssets(assetsProps: StoresAndActionsProps, children: Node): Node {
  return (
    <AssetsWrapper {...assetsProps}>
      <Suspense fallback={null}>{children}</Suspense>
    </AssetsWrapper>
  );
}

export function wrapNFTs(assetsProps: StoresAndActionsProps, children: Node): Node {
  return (
    <NFTsWrapper {...assetsProps}>
      <Suspense fallback={null}>{children}</Suspense>
    </NFTsWrapper>
  );
}

export function wrapWallet(walletProps: StoresAndActionsProps, children: Node): Node {
  return (
    <Wallet {...walletProps}>
      <Suspense fallback={null}>{children}</Suspense>
    </Wallet>
  );
}

export function wrapReceive(receiveProps: StoresAndActionsProps, children: Node): Node {
  return <Receive {...receiveProps}>{children}</Receive>;
}

// NEW UI - TODO: to be refactred
export function wrapGouvernance(gouvernanceProps: StoresAndActionsProps, children: Node): Node {
  return <Suspense fallback={null}>{children}</Suspense>;
}
