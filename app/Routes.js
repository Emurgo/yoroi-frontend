// @flow
import React from 'react';
import { Route, Redirect, Switch } from 'react-router-dom';
import { ROUTES } from './routes-config';
import resolver from './utils/imports';
import type { StoresMap } from './stores/index';
import type { ActionsMap } from './actions/index';
import type { Node } from 'react';

// PAGES
import NoWalletsPage from './containers/wallet/NoWalletsPage';
import WalletAddPage from './containers/wallet/WalletAddPage';
import LanguageSelectionPage from './containers/profile/LanguageSelectionPage';
import Settings from './containers/settings/Settings';
import GeneralSettingsPage from './containers/settings/categories/GeneralSettingsPage';
import SupportSettingsPage from './containers/settings/categories/SupportSettingsPage';
import TermsOfUseSettingsPage from './containers/settings/categories/TermsOfUseSettingsPage';
import TermsOfUsePage from './containers/profile/TermsOfUsePage';
import DisplaySettingsPage from './containers/settings/categories/DisplaySettingsPage';
import WalletSettingsPage from './containers/settings/categories/WalletSettingsPage';
import AboutYoroiSettings from './components/settings/categories/AboutYoroiSettings';
import PaperWalletPage from './containers/settings/categories/PaperWalletPage';

// Dynamic container loading - resolver loads file relative to '/app/' directory
const LoadingPage = resolver('containers/LoadingPage');
const Wallet = resolver('containers/wallet/Wallet');
const WalletSummaryPage = resolver('containers/wallet/WalletSummaryPage');
const WalletSendPage = resolver('containers/wallet/WalletSendPage');
const WalletReceivePage = resolver('containers/wallet/WalletReceivePage');
const DaedalusTransferPage = resolver('containers/transfer/DaedalusTransferPage');
const AdaRedemptionPage = resolver('containers/wallet/AdaRedemptionPage');

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
        exact
        path={ROUTES.DAEDALUS_TRANFER.ROOT}
        component={(props) => <DaedalusTransferPage {...props} stores={stores} actions={actions} />}
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
    <Route
      path={ROUTES.SETTINGS.DISPLAY}
      component={(props) => <DisplaySettingsPage {...props} stores={stores} actions={actions} />}
      exact
    />
    <Route
      path={ROUTES.SETTINGS.ABOUT_YOROI}
      component={(props) => <AboutYoroiSettings {...props} stores={stores} actions={actions} />}
      exact
    />
    <Route
      exact
      path={ROUTES.SETTINGS.ADA_REDEMPTION}
      component={(props) => <AdaRedemptionPage {...props} stores={stores} actions={actions} />}
    />
    <Redirect to={ROUTES.SETTINGS.GENERAL} />
  </Switch>
);

/* eslint-enable max-len */
