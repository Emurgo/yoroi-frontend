// @flow
import React, { Suspense } from 'react';
import type { Node } from 'react';
import { Route, Redirect, Switch } from 'react-router-dom';
import { ROUTES } from './routes-config';
import type { StoresMap } from './stores/index';
import type { ActionsMap } from './actions/index';
import type { InjectedOrGenerated } from './types/injectedPropsType';
import type { GeneratedData as SettingsData } from './containers/settings/Settings';
import type { GeneratedData as WalletData } from './containers/wallet/Wallet';
import type { GeneratedData as ReceiveData } from './containers/wallet/Receive';
import type { ConfigType } from '../config/config-types';
import type { GeneratedData as AssetsData } from './containers/wallet/AssetsWrapper';
import Support from './components/widgets/Support';

// PAGES
const WalletAddPagePromise = () => import('./containers/wallet/WalletAddPage');
const WalletAddPage = React.lazy(WalletAddPagePromise);
const LanguageSelectionPagePromise = () => import('./containers/profile/LanguageSelectionPage');
const LanguageSelectionPage = React.lazy(LanguageSelectionPagePromise);
const TermsOfUsePagePromise = () => import('./containers/profile/TermsOfUsePage');
const TermsOfUsePage = React.lazy(TermsOfUsePagePromise);
const UriPromptPagePromise = () => import('./containers/profile/UriPromptPage');
const UriPromptPage = React.lazy(UriPromptPagePromise);

// SETTINGS
const SettingsPromise = () => import('./containers/settings/Settings');
const Settings = React.lazy(SettingsPromise);
const GeneralSettingsPagePromise = () => import('./containers/settings/categories/GeneralSettingsPage');
const GeneralSettingsPage = React.lazy(GeneralSettingsPagePromise);
const WalletSettingsPagePromise = () => import('./containers/settings/categories/WalletSettingsPage');
const WalletSettingsPage = React.lazy(WalletSettingsPagePromise);
const ExternalStorageSettingsPagePromise = () => import('./containers/settings/categories/ExternalStorageSettingsPage');
const ExternalStorageSettingsPage = React.lazy(ExternalStorageSettingsPagePromise);
const OAuthDropboxPagePromise = () => import('./containers/settings/categories/OAuthDropboxPage');
const OAuthDropboxPage = React.lazy(OAuthDropboxPagePromise);
const TermsOfUseSettingsPagePromise = () => import('./containers/settings/categories/TermsOfUseSettingsPage');
const TermsOfUseSettingsPage = React.lazy(TermsOfUseSettingsPagePromise);
const SupportSettingsPagePromise = () => import('./containers/settings/categories/SupportSettingsPage');
const SupportSettingsPage = React.lazy(SupportSettingsPagePromise);

// Dynamic container loading - resolver loads file relative to '/app/' directory
const LoadingPagePromise = () => import('./containers/LoadingPage');
const LoadingPage = React.lazy(LoadingPagePromise);
const NightlyPagePromise = () => import('./containers/profile/NightlyPage');
const NightlyPage = React.lazy(NightlyPagePromise);
const WalletPromise = () => import('./containers/wallet/Wallet');
const Wallet = React.lazy(WalletPromise);
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
const TransferPromise = () => import('./containers/transfer/Transfer');
const Transfer = React.lazy(TransferPromise);
const ReceivePromise = () => import('./containers/wallet/Receive');
const Receive = React.lazy(ReceivePromise);
const StakingDashboardPagePromise = () => import('./containers/wallet/staking/StakingDashboardPage');
const StakingDashboardPage = React.lazy(StakingDashboardPagePromise);
const CardanoStakingPagePromise = () => import('./containers/wallet/staking/CardanoStakingPage');
const CardanoStakingPage = React.lazy(CardanoStakingPagePromise);
const NoticeBoardPagePromise = () => import('./containers/notice-board/NoticeBoardPage');
const NoticeBoardPage = React.lazy(NoticeBoardPagePromise);
const VotingPagePromise = () => import('./containers/wallet/voting/VotingPage');
const VotingPage = React.lazy(VotingPagePromise);

const ComplexityLevelSettingsPagePromise = () => import('./containers/settings/categories/ComplexityLevelSettingsPage');
const ComplexityLevelSettingsPage = React.lazy(ComplexityLevelSettingsPagePromise);
const ComplexityLevelPagePromise = () => import('./containers/profile/ComplexityLevelPage');
const ComplexityLevelPage = React.lazy(ComplexityLevelPagePromise);
const BlockchainSettingsPagePromise = () => import('./containers/settings/categories/BlockchainSettingsPage');
const BlockchainSettingsPage = React.lazy(BlockchainSettingsPagePromise);
const WalletSwitchPromise = () => import('./containers/WalletSwitch');
const WalletSwitch = React.lazy(WalletSwitchPromise);
const StakingPagePromise = () => import('./containers/wallet/staking/StakingPage');
const StakingPage = React.lazy(StakingPagePromise);
const AssetsWrapperPromise = () => import('./containers/wallet/AssetsWrapper');
const AssetsWrapper = React.lazy(AssetsWrapperPromise);
const TokensPageRevampPromise = () => import('./containers/wallet/TokensPageRevamp');
const TokensPageRevamp = React.lazy(TokensPageRevampPromise);
const TokensDetailPageRevampPromise = () => import('./containers/wallet/TokenDetailPageRevamp');
const TokensDetailPageRevamp = React.lazy(TokensDetailPageRevampPromise);
const NFTsPageRevampPromise = () => import('./containers/wallet/NFTsPageRevamp');
const NFTsPageRevamp = React.lazy(NFTsPageRevampPromise);
const NFTDetailPageRevampPromise = () => import('./containers/wallet/NFTDetailPageRevamp');
const NFTDetailPageRevamp = React.lazy(NFTDetailPageRevampPromise);
const ConnectedWebsitesPagePromise = () => import('./containers/dapp-connector/ConnectedWebsitesContainer');
const ConnectedWebsitesPage = React.lazy(ConnectedWebsitesPagePromise);
const YoroiPalettePagePromise = () => import('./containers/experimental/YoroiPalette');
const YoroiPalettePage = React.lazy(YoroiPalettePagePromise);
const YoroiThemesPagePromise = () => import('./containers/experimental/yoroiThemes');
const YoroiThemesPage = React.lazy(YoroiThemesPagePromise);

export const LazyLoadPromises: Array<() => any> = [
  WalletAddPagePromise,
  LanguageSelectionPagePromise,
  TermsOfUsePagePromise,
  UriPromptPagePromise,
  SettingsPromise,
  GeneralSettingsPagePromise,
  WalletSettingsPagePromise,
  ExternalStorageSettingsPagePromise,
  OAuthDropboxPagePromise,
  TermsOfUseSettingsPagePromise,
  SupportSettingsPagePromise,
  LoadingPagePromise,
  NightlyPagePromise,
  WalletPromise,
  MyWalletsPagePromise,
  WalletSummaryPagePromise,
  WalletSendPagePromise,
  WalletAssetsPagePromise,
  WalletReceivePagePromise,
  URILandingPagePromise,
  TransferPromise,
  ReceivePromise,
  StakingDashboardPagePromise,
  CardanoStakingPagePromise,
  NoticeBoardPagePromise,
  VotingPagePromise,
  ComplexityLevelSettingsPagePromise,
  ComplexityLevelPagePromise,
  BlockchainSettingsPagePromise,
  WalletSwitchPromise,
  StakingPagePromise,
  AssetsWrapperPromise,
  TokensPageRevampPromise,
  TokensDetailPageRevampPromise,
  NFTsPageRevampPromise,
  NFTDetailPageRevampPromise,
  ConnectedWebsitesPagePromise,
  YoroiPalettePagePromise,
  YoroiThemesPagePromise,
];

// populated by ConfigWebpackPlugin
declare var CONFIG: ConfigType;

/* eslint-disable max-len */
export const Routes = (
  stores: StoresMap,
  actions: ActionsMap
): Node => (
  <div style={{ height: '100%' }}>
    <Support />
    <Suspense fallback={null}>
      <Switch>
        <Route
          exact
          path={ROUTES.ROOT}
          component={(props) => <LoadingPage {...props} stores={stores} actions={actions} />}
        />
        <Route
          exact
          path={ROUTES.NIGHTLY_INFO}
          component={(props) => <NightlyPage {...props} stores={stores} actions={actions} />}
        />
        <Route
          exact
          path={ROUTES.PROFILE.LANGUAGE_SELECTION}
          component={(props) => <LanguageSelectionPage {...props} stores={stores} actions={actions} />}
        />
        <Route
          exact
          path={ROUTES.PROFILE.COMPLEXITY_LEVEL}
          component={(props) => <ComplexityLevelPage {...props} stores={stores} actions={actions} />}
        />
        <Route
          exact
          path={ROUTES.PROFILE.TERMS_OF_USE}
          component={(props) => <TermsOfUsePage {...props} stores={stores} actions={actions} />}
        />
        <Route
          exact
          path={ROUTES.PROFILE.URI_PROMPT}
          component={(props) => <UriPromptPage {...props} stores={stores} actions={actions} />}
        />
        <Route
          exact
          path={ROUTES.MY_WALLETS}
          component={(props) => <MyWalletsPage {...props} stores={stores} actions={actions} />}
        />
        <Route
          exact
          path={ROUTES.STAKING}
          component={(props) => <StakingPage {...props} stores={stores} actions={actions} />}
        />
        <Route
          path={ROUTES.ASSETS.ROOT}
          component={(props) => (
            wrapAssets(
              { ...props, stores, actions },
              AssetsSubpages(stores, actions)
            )
          )}
        />
        <Route
          exact
          path={ROUTES.WALLETS.ADD}
          component={(props) => <WalletAddPage {...props} stores={stores} actions={actions} />}
        />
        <Route
          exact
          path={ROUTES.DAPP_CONNECTOR.CONNECTED_WEBSITES}
          component={(props) => <ConnectedWebsitesPage {...props} stores={stores} actions={actions} />}
        />
        <Route
          exact
          path={ROUTES.EXPERIMENTAL.YOROI_PALETTE}
          component={(props) => <YoroiPalettePage {...props} stores={stores} actions={actions} />}
        />
        <Route
          exact
          path={ROUTES.EXPERIMENTAL.THEMES}
          component={(props) => <YoroiThemesPage {...props} stores={stores} actions={actions} />}
        />
        <Route
          path={ROUTES.WALLETS.ROOT}
          component={(props) => (
            wrapWallet(
              { ...props, stores, actions },
              WalletsSubpages(stores, actions)
            )
          )}
        />
        <Route
          path={ROUTES.SETTINGS.ROOT}
          component={(props) => (
            wrapSettings(
              { ...props, stores, actions },
              SettingsSubpages(stores, actions)
            )
          )}
        />
        <Route
          path={ROUTES.TRANSFER.ROOT}
          component={(props) => <Transfer {...props} stores={stores} actions={actions} />}
        />
        <Route
          exact
          path={ROUTES.SEND_FROM_URI.ROOT}
          component={(props) => <URILandingPage {...props} stores={stores} actions={actions} />}
        />
        <Route
          exact
          path={ROUTES.OAUTH_FROM_EXTERNAL.DROPBOX}
          component={(props) => <OAuthDropboxPage {...props} stores={stores} actions={actions} />}
        />
        <Route
          exact
          path={ROUTES.NOTICE_BOARD.ROOT}
          component={(props) => <NoticeBoardPage {...props} stores={stores} actions={actions} />}
        />
        <Route
          exact
          path={ROUTES.SWITCH}
          component={(props) => <WalletSwitch {...props} stores={stores} actions={actions} />}
        />
        <Redirect to={ROUTES.MY_WALLETS} />
      </Switch>
    </Suspense>
  </div>
);

const WalletsSubpages = (stores, actions) => (
  <Switch>
    <Route
      exact
      path={ROUTES.WALLETS.TRANSACTIONS}
      component={(props) => {
        return <WalletSummaryPage {...props} stores={stores} actions={actions} />
      }}
    />
    <Route
      exact
      path={ROUTES.WALLETS.SEND}
      component={(props) => <WalletSendPage {...props} stores={stores} actions={actions} />}
    />
    <Route
      path={ROUTES.WALLETS.ASSETS}
      component={(props) => <WalletAssetsPage {...props} stores={stores} actions={actions} />}
    />
    <Route
      path={ROUTES.WALLETS.RECEIVE.ROOT}
      component={(props) => (
        wrapReceive(
          { ...props, stores, actions },
          (<WalletReceivePage {...props} stores={stores} actions={actions} />)
        )
      )}
    />
    <Route
      exact
      path={ROUTES.WALLETS.DELEGATION_DASHBOARD}
      component={(props) => <StakingDashboardPage {...props} stores={stores} actions={actions} />}
    />
    <Route
      exact
      path={ROUTES.WALLETS.ADAPOOL_DELEGATION_SIMPLE}
      component={(props) => <CardanoStakingPage {...props} stores={stores} actions={actions} urlTemplate={CONFIG.seiza.simpleTemplate} />}
    />
    <Route
      exact
      path={ROUTES.WALLETS.CARDANO_DELEGATION}
      component={(props) => <CardanoStakingPage {...props} stores={stores} actions={actions} />}
    />
    <Route
      exact
      path={ROUTES.WALLETS.CATALYST_VOTING}
      component={(props) => <VotingPage {...props} stores={stores} actions={actions} />}
    />
  </Switch>
);

const SettingsSubpages = (stores, actions) => (
  <Switch>
    <Route
      exact
      path={ROUTES.SETTINGS.GENERAL}
      component={(props) => <GeneralSettingsPage {...props} stores={stores} actions={actions} />}
    />
    <Route
      exact
      path={ROUTES.SETTINGS.BLOCKCHAIN}
      component={(props) => <BlockchainSettingsPage {...props} stores={stores} actions={actions} />}
    />
    <Route
      exact
      path={ROUTES.SETTINGS.TERMS_OF_USE}
      component={(props) => <TermsOfUseSettingsPage {...props} stores={stores} actions={actions} />}
    />
    <Route
      exact
      path={ROUTES.SETTINGS.WALLET}
      component={(props) => <WalletSettingsPage {...props} stores={stores} actions={actions} />}
    />
    <Route
      exact
      path={ROUTES.SETTINGS.EXTERNAL_STORAGE}
      component={(props) => <ExternalStorageSettingsPage {...props} stores={stores} actions={actions} />}
    />
    <Route
      exact
      path={ROUTES.SETTINGS.SUPPORT}
      component={(props) => <SupportSettingsPage {...props} stores={stores} actions={actions} />}
    />
    <Route
      exact
      path={ROUTES.SETTINGS.LEVEL_OF_COMPLEXITY}
      component={(props) => <ComplexityLevelSettingsPage {...props} stores={stores} actions={actions} />}
    />
    <Redirect to={ROUTES.SETTINGS.GENERAL} />
  </Switch>
);

const AssetsSubpages = (stores, actions) => (
  <Switch>
    <Route
      exact
      path={ROUTES.ASSETS.TOKENS}
      component={(props) => <TokensPageRevamp {...props} stores={stores} actions={actions} />}
    />
    <Route
      exact
      path={ROUTES.ASSETS.TOKEN_DETAILS}
      component={(props) => <TokensDetailPageRevamp {...props} stores={stores} actions={actions} />}
    />
    <Route
      exact
      path={ROUTES.ASSETS.NFTS}
      component={(props) => <NFTsPageRevamp {...props} stores={stores} actions={actions} />}
    />
    <Route
      exact
      path={ROUTES.ASSETS.NFT_DETAILS}
      component={(props) => <NFTDetailPageRevamp {...props} stores={stores} actions={actions} />}
    />
    <Redirect to={ROUTES.ASSETS.TOKENS} />
  </Switch>
);
/* eslint-enable max-len */

export function wrapSettings(
  settingsProps: InjectedOrGenerated<SettingsData>,
  children: Node,
): Node {
  return (
    <Settings
      {...settingsProps}
    >
      {children}
    </Settings>
  );
}

export function wrapAssets(
  assetsProps: InjectedOrGenerated<AssetsData>,
  children: Node,
): Node {
  return (
    <AssetsWrapper
      {...assetsProps}
    >
      {children}
    </AssetsWrapper>
  );
}

export function wrapWallet(
  walletProps: InjectedOrGenerated<WalletData>,
  children: Node,
): Node {
  return (
    <Wallet
      {...walletProps}
    >
      {children}
    </Wallet>
  );
}

export function wrapReceive(
  receiveProps: InjectedOrGenerated<ReceiveData>,
  children: Node,
): Node {
  return (
    <Receive
      {...receiveProps}
    >
      {children}
    </Receive>
  );
}
