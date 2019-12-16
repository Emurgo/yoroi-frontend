// @flow
import React from 'react';
import type { Node } from 'react';
import { Route, Redirect, Switch } from 'react-router-dom';
import environment from './environment';
import { ROUTES } from './routes-config';
import type { StoresMap } from './stores/index';
import type { ActionsMap } from './actions/index';

// PAGES
import NoWalletsPage from './containers/wallet/NoWalletsPage';
import WalletAddPage from './containers/wallet/WalletAddPage';
import LanguageSelectionPage from './containers/profile/LanguageSelectionPage';
import TermsOfUsePage from './containers/profile/TermsOfUsePage';
import UriPromptPage from './containers/profile/UriPromptPage';

// SETTINGS
import Settings from './containers/settings/Settings';
import GeneralSettingsPage from './containers/settings/categories/GeneralSettingsPage';
import PaperWalletPage from './containers/settings/categories/PaperWalletPage';
import WalletSettingsPage from './containers/settings/categories/WalletSettingsPage';
import TermsOfUseSettingsPage from './containers/settings/categories/TermsOfUseSettingsPage';
import SupportSettingsPage from './containers/settings/categories/SupportSettingsPage';

// Dynamic container loading - resolver loads file relative to '/app/' directory
import LoadingPage from './containers/LoadingPage';
import Wallet from './containers/wallet/Wallet';
import WalletSummaryPage from './containers/wallet/WalletSummaryPage';
import WalletSendPage from './containers/wallet/WalletSendPage';
import WalletReceivePage from './containers/wallet/WalletReceivePage';
import DaedalusTransferPage from './containers/transfer/DaedalusTransferPage';
import YoroiTransferPage from './containers/transfer/YoroiTransferPage';
import URILandingPage from './containers/uri/URILandingPage';
import Transfer from './containers/transfer/Transfer';
import StakingDashboardPage from './containers/wallet/staking/StakingDashboardPage';
import StakingPage from './containers/wallet/staking/StakingPage';

import type { ConfigType } from '../config/config-types';

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
        path={ROUTES.PROFILE.LANGUAGE_SELECTION}
        component={(props) => <LanguageSelectionPage {...props} stores={stores} actions={actions} />}
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
        path={ROUTES.NO_WALLETS}
        component={(props) => <NoWalletsPage {...props} stores={stores} actions={actions} />}
      />
      <Route
        exact
        path={ROUTES.WALLETS.ADD}
        component={(props) => <WalletAddPage {...props} stores={stores} actions={actions} />}
      />
      <Route
        path={ROUTES.WALLETS.ROOT}
        component={(props) => (
          <Wallet {...props} stores={stores} actions={actions}>
            {WalletsSubpages(stores, actions)}
          </Wallet>
        )}
      />
      <Route
        path={ROUTES.SETTINGS.ROOT}
        component={(props) => (
          <Settings {...props} stores={stores} actions={actions}>
            {SettingsSubpages(stores, actions)}
          </Settings>
        )}
      />
      <Route
        path={ROUTES.TRANSFER.ROOT}
        component={(props) => (
          <Transfer {...props} stores={stores} actions={actions}>
            {TransferSubpages(stores, actions)}
          </Transfer>
        )}
      />
      <Route
        exact
        path={ROUTES.SEND_FROM_URI.ROOT}
        component={(props) => <URILandingPage {...props} stores={stores} actions={actions} />}
      />
      <Redirect to={ROUTES.WALLETS.ADD} />
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
      exact
      path={ROUTES.WALLETS.RECEIVE}
      component={(props) => <WalletReceivePage {...props} stores={stores} actions={actions} />}
    />
    {environment.isShelley() && (
      <>
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
      </>)
    }
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
      path={ROUTES.SETTINGS.PAPER_WALLET}
      component={(props) => <PaperWalletPage {...props} stores={stores} actions={actions} />}
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
      path={ROUTES.SETTINGS.SUPPORT}
      component={(props) => <SupportSettingsPage {...props} stores={stores} actions={actions} />}
    />
    <Redirect to={ROUTES.SETTINGS.GENERAL} />
  </Switch>
);

const TransferSubpages = (stores, actions) => (
  <Switch>
    <Route
      exact
      path={ROUTES.TRANSFER.YOROI}
      component={(props) => <YoroiTransferPage {...props} stores={stores} actions={actions} />}
    />
    <Route
      exact
      path={ROUTES.TRANSFER.DAEDALUS}
      component={(props) => <DaedalusTransferPage {...props} stores={stores} actions={actions} />}
    />
    <Redirect to={ROUTES.TRANSFER.DAEDALUS} />
  </Switch>
);

/* eslint-enable max-len */
