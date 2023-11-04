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
import LoadingPage from './containers/LoadingPage';
import StakingPage, { StakingPageContentPromise } from './containers/wallet/staking/StakingPage';
import Wallet from './containers/wallet/Wallet';
import Settings from './containers/settings/Settings';
import Transfer, { WalletTransferPagePromise } from './containers/transfer/Transfer';
import VotingPage, { VotingPageContentPromise } from './containers/wallet/voting/VotingPage';
import ConnectedWebsitesPage, {
  ConnectedWebsitesPagePromise,
} from './containers/dapp-connector/ConnectedWebsitesContainer';
import AddWalletPage, { AddAnotherWalletPromise } from './containers/wallet/AddWalletPage';
import AssetsWrapper from './containers/wallet/AssetsWrapper';
import NFTsWrapper from './containers/wallet/NFTsWrapper';
// Todo: Add lazy loading
import RestoreWalletPage, {
  RestoreWalletPagePromise,
} from './containers/wallet/restore/RestoreWalletPage';
import CreateWalletPage, {
  CreateWalletPagePromise,
} from './containers/wallet/CreateWalletPageContainer';

// PAGES
const LanguageSelectionPagePromise = () => import('./containers/profile/LanguageSelectionPage');
const LanguageSelectionPage = React.lazy(LanguageSelectionPagePromise);
const TermsOfUsePagePromise = () => import('./containers/profile/TermsOfUsePage');
const TermsOfUsePage = React.lazy(TermsOfUsePagePromise);
const UriPromptPagePromise = () => import('./containers/profile/UriPromptPage');
const UriPromptPage = React.lazy(UriPromptPagePromise);

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

const NoticeBoardPagePromise = () => import('./containers/notice-board/NoticeBoardPage');
const NoticeBoardPage = React.lazy(NoticeBoardPagePromise);

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
  NoticeBoardPagePromise,
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
];

// populated by ConfigWebpackPlugin
declare var CONFIG: ConfigType;

/* eslint-disable max-len */
export function Routes(stores: StoresMap, actions: ActionsMap): Node {
  const wrapper = storesActionsWrapper(stores, actions);
  return <Suspense fallback={null}>
    <Switch>
      <Route
        exact
        path={ROUTES.ROOT}
        component={wrapper(LoadingPage)}
      />
      <Route
        exact
        path={ROUTES.NIGHTLY_INFO}
        component={wrapper(NightlyPage)}
      />
      <Route
        exact
        path={ROUTES.PROFILE.LANGUAGE_SELECTION}
        component={wrapper(LanguageSelectionPage)}
      />
      <Route
        exact
        path={ROUTES.PROFILE.COMPLEXITY_LEVEL}
        component={wrapper(ComplexityLevelPage)}
      />
      <Route
        exact
        path={ROUTES.PROFILE.TERMS_OF_USE}
        component={wrapper(TermsOfUsePage)}
      />
      <Route
        exact
        path={ROUTES.PROFILE.URI_PROMPT}
        component={wrapper(UriPromptPage)}
      />
      <Route
        exact
        path={ROUTES.MY_WALLETS}
        component={wrapper(MyWalletsPage)}
      />
      <Route
        exact
        path={ROUTES.STAKING}
        component={wrapper(StakingPage)}
      />
      <Route
        path={ROUTES.ASSETS.ROOT}
        component={props =>
          wrapAssets({ ...props, stores, actions }, AssetsSubpages(wrapper))
        }
      />
      <Route
        path={ROUTES.NFTS.ROOT}
        component={props => wrapNFTs({ ...props, stores, actions }, NFTsSubPages(wrapper))}
      />
      <Route
        exact
        path={ROUTES.WALLETS.ADD}
        component={wrapper(AddWalletPage)}
      />
      <Route
        exact
        path={ROUTES.WALLETS.RESTORE_WALLET}
        component={wrapper(RestoreWalletPage)}
      />
      <Route
        exact
        path={ROUTES.WALLETS.CREATE_NEW_WALLET}
        component={wrapper(CreateWalletPage)}
      />
      <Route
        exact
        path={ROUTES.DAPP_CONNECTOR.CONNECTED_WEBSITES}
        component={wrapper(ConnectedWebsitesPage)}
      />
      <Route
        exact
        path={ROUTES.EXPERIMENTAL.YOROI_PALETTE}
        component={wrapper(YoroiPalettePage)}
      />
      <Route
        exact
        path={ROUTES.EXPERIMENTAL.THEMES}
        component={wrapper(YoroiThemesPage)}
      />
      <Route
        path={ROUTES.WALLETS.ROOT}
        component={props =>
          wrapWallet({ ...props, stores, actions }, WalletsSubpages(wrapper, stores, actions))
        }
      />
      <Route
        path={ROUTES.SETTINGS.ROOT}
        component={props =>
          wrapSettings({ ...props, stores, actions }, SettingsSubpages(wrapper))
        }
      />
      <Route
        path={ROUTES.TRANSFER.ROOT}
        component={wrapper(Transfer)}
      />
      <Route
        exact
        path={ROUTES.SEND_FROM_URI.ROOT}
        component={wrapper(URILandingPage)}
      />
      <Route
        exact
        path={ROUTES.OAUTH_FROM_EXTERNAL.DROPBOX}
        component={wrapper(OAuthDropboxPage)}
      />
      <Route
        exact
        path={ROUTES.NOTICE_BOARD.ROOT}
        component={wrapper(NoticeBoardPage)}
      />
      <Route
        exact
        path={ROUTES.SWITCH}
        component={wrapper(WalletSwitch)}
      />
      <Route
        exact
        path={ROUTES.REVAMP.CATALYST_VOTING}
        component={wrapper(VotingPage)}
      />
      <Redirect to={ROUTES.MY_WALLETS} />
    </Switch>
  </Suspense>
}

function WalletsSubpages(wrapper: Function => Function, stores, actions) {
  return <Switch>
    <Route
      exact
      path={ROUTES.WALLETS.TRANSACTIONS}
      component={wrapper(WalletSummaryPage)}
    />
    <Route
      exact
      path={ROUTES.WALLETS.SEND}
      component={wrapper(WalletSendPage)}
    />
    <Route
      path={ROUTES.WALLETS.ASSETS}
      component={wrapper(WalletAssetsPage)}
    />
    <Route
      path={ROUTES.WALLETS.RECEIVE.ROOT}
      component={props =>
        wrapReceive(
          { ...props, stores, actions },
          wrapper(WalletReceivePage)
        )
      }
    />
    <Route
      exact
      path={ROUTES.WALLETS.DELEGATION_DASHBOARD}
      component={wrapper(StakingDashboardPage)}
    />
    <Route
      exact
      path={ROUTES.WALLETS.ADAPOOL_DELEGATION_SIMPLE}
      // <TODO:CHECK_LINT>
      // eslint-disable-next-line react/no-unstable-nested-components
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
      component={wrapper(CardanoStakingPage)}
    />
    <Route
      exact
      path={ROUTES.WALLETS.CATALYST_VOTING}
      component={wrapper(VotingPage)}
    />
  </Switch>
}

function SettingsSubpages(wrapper: Function => Function) {
  return <Switch>
    <Route
      exact
      path={ROUTES.SETTINGS.GENERAL}
      component={wrapper(GeneralSettingsPage)}
    />
    <Route
      exact
      path={ROUTES.SETTINGS.BLOCKCHAIN}
      component={wrapper(BlockchainSettingsPage)}
    />
    <Route
      exact
      path={ROUTES.SETTINGS.TERMS_OF_USE}
      component={wrapper(TermsOfUseSettingsPage)}
    />
    <Route
      exact
      path={ROUTES.SETTINGS.WALLET}
      component={wrapper(WalletSettingsPage)}
    />
    <Route
      exact
      path={ROUTES.SETTINGS.EXTERNAL_STORAGE}
      component={wrapper(ExternalStorageSettingsPage)}
    />
    <Route
      exact
      path={ROUTES.SETTINGS.SUPPORT}
      component={wrapper(SupportSettingsPage)}
    />
    <Route
      exact
      path={ROUTES.SETTINGS.LEVEL_OF_COMPLEXITY}
      component={wrapper(ComplexityLevelSettingsPage)}
    />
    <Redirect to={ROUTES.SETTINGS.GENERAL} />
  </Switch>
}

function AssetsSubpages(wrapper: (Function => Function)) {
  return <Switch>
    <Route
      exact
      path={ROUTES.ASSETS.ROOT}
      component={wrapper(TokensPageRevamp)}
    />
    <Route
      exact
      path={ROUTES.ASSETS.DETAILS}
      component={wrapper(TokensDetailPageRevamp)}
    />
  </Switch>
}

function storesActionsWrapper(stores, actions): Function => Function {
  return Component => function(props) {
    return <Component {...props} stores={stores} actions={actions} />
  }
}

function NFTsSubPages(wrapper: Function => Function) {
  return <Switch>
    <Route
      exact
      path={ROUTES.NFTS.ROOT}
      component={wrapper(NFTsPageRevamp)}
    />
    <Route
      exact
      path={ROUTES.NFTS.DETAILS}
      component={wrapper(NFTDetailPageRevamp)}
    />
  </Switch>
}

export function wrapSettings(
  settingsProps: InjectedOrGenerated<SettingsData>,
  children: Node
): Node {
  return (
    <Settings {...settingsProps}>
      <Suspense fallback={null}>{children}</Suspense>
    </Settings>
  );
}

export function wrapAssets(assetsProps: InjectedOrGenerated<AssetsData>, children: Node): Node {
  return (
    <AssetsWrapper {...assetsProps}>
      <Suspense fallback={null}>{children}</Suspense>
    </AssetsWrapper>
  );
}

export function wrapNFTs(assetsProps: InjectedOrGenerated<AssetsData>, children: Node): Node {
  return (
    <NFTsWrapper {...assetsProps}>
      <Suspense fallback={null}>{children}</Suspense>
    </NFTsWrapper>
  );
}

export function wrapWallet(walletProps: InjectedOrGenerated<WalletData>, children: Node): Node {
  return (
    <Wallet {...walletProps}>
      <Suspense fallback={null}>{children}</Suspense>
    </Wallet>
  );
}

export function wrapReceive(receiveProps: InjectedOrGenerated<ReceiveData>, children: Node): Node {
  return <Receive {...receiveProps}>{children}</Receive>;
}
