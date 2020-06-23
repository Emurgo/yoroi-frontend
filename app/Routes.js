// @flow
import React from 'react';
import type { Node } from 'react';
import { Route, Redirect, Switch } from 'react-router-dom';
import { ROUTES } from './routes-config';
import type { StoresMap } from './stores/index';
import type { ActionsMap } from './actions/index';
import type { InjectedOrGenerated } from './types/injectedPropsType';

// PAGES
import WalletAddPage from './containers/wallet/WalletAddPage';
import LanguageSelectionPage from './containers/profile/LanguageSelectionPage';
import TermsOfUsePage from './containers/profile/TermsOfUsePage';
import UriPromptPage from './containers/profile/UriPromptPage';

// SETTINGS
import Settings from './containers/settings/Settings';
import type { GeneratedData as SettingsData } from './containers/settings/Settings';
import GeneralSettingsPage from './containers/settings/categories/GeneralSettingsPage';
import WalletSettingsPage from './containers/settings/categories/WalletSettingsPage';
import ExternalStorageSettingsPage from './containers/settings/categories/ExternalStorageSettingsPage';
import OAuthDropboxPage from './containers/settings/categories/OAuthDropboxPage';
import TermsOfUseSettingsPage from './containers/settings/categories/TermsOfUseSettingsPage';
import SupportSettingsPage from './containers/settings/categories/SupportSettingsPage';

// Dynamic container loading - resolver loads file relative to '/app/' directory
import LoadingPage from './containers/LoadingPage';
import NightlyPage from './containers/profile/NightlyPage';
import Wallet from './containers/wallet/Wallet';
import type { GeneratedData as WalletData } from './containers/wallet/Wallet';
import MyWalletsPage from './containers/wallet/MyWalletsPage';
import WalletSummaryPage from './containers/wallet/WalletSummaryPage';
import WalletSendPage from './containers/wallet/WalletSendPage';
import WalletReceivePage from './containers/wallet/WalletReceivePage';
import URILandingPage from './containers/uri/URILandingPage';
import Transfer from './containers/transfer/Transfer';
import Receive from './containers/wallet/Receive';
import type { GeneratedData as ReceiveData } from './containers/wallet/Receive';
import StakingDashboardPage from './containers/wallet/staking/StakingDashboardPage';
import StakingPage from './containers/wallet/staking/StakingPage';
import NoticeBoardPage from './containers/notice-board/NoticeBoardPage';

import type { ConfigType } from '../config/config-types';
import ComplexityLevelSettingsPage from './containers/settings/categories/ComplexityLevelSettingsPage';
import ComplexityLevelPage from './containers/profile/ComplexityLevelPage';
import BlockchainSettingsPage from './containers/settings/categories/BlockchainSettingsPage';
import WalletSwitch from './containers/WalletSwitch';

declare var CONFIG: ConfigType;

/* eslint-disable max-len */
export const Routes = (
  stores: StoresMap,
  actions: ActionsMap
): Node => (
  <div style={{ height: '100%' }}>
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
        path={ROUTES.WALLETS.ADD}
        component={(props) => <WalletAddPage {...props} stores={stores} actions={actions} />}
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
  </div>
);

const WalletsSubpages = (stores, actions) => (
  <Switch>
    <Route
      exact
      path={ROUTES.WALLETS.TRANSACTIONS}
      component={(props) => <WalletSummaryPage {...props} stores={stores} actions={actions} />}
    />
    <Route
      exact
      path={ROUTES.WALLETS.SEND}
      component={(props) => <WalletSendPage {...props} stores={stores} actions={actions} />}
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
      path={ROUTES.WALLETS.DELEGATION_SIMPLE}
      component={(props) => <StakingPage {...props} stores={stores} actions={actions} urlTemplate={CONFIG.seiza.simpleTemplate} />}
    />
    <Route
      exact
      path={ROUTES.WALLETS.DELEGATION_ADVANCE}
      component={(props) => <StakingPage {...props} stores={stores} actions={actions} urlTemplate={CONFIG.seiza.advanceTemplate} />}
    />
    <Redirect to={ROUTES.WALLETS.TRANSACTIONS} />
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
