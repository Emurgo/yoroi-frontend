// @flow
import React from 'react';
import { Route, IndexRedirect } from 'react-router';
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
import WalletSettingsPage from './containers/settings/categories/WalletSettingsPage';

// Dynamic container loading - resolver loads file relative to '/app/' directory
const LoadingPage = resolver('containers/LoadingPage');
const Wallet = resolver('containers/wallet/Wallet');
const WalletSummaryPage = resolver('containers/wallet/WalletSummaryPage');
const WalletSendPage = resolver('containers/wallet/WalletSendPage');
const WalletReceivePage = resolver('containers/wallet/WalletReceivePage');
const DaedalusTransferPage = resolver('containers/transfer/DaedalusTransferPage');

/* eslint-disable max-len */
export const Routes = (
  stores: StoresMap,
  actions: ActionsMap
): Node => (
  <div>
    <Route
      path={ROUTES.ROOT}
      component={(props) => <LoadingPage {...props} stores={stores} actions={actions} />}
    />
    <Route
      path={ROUTES.PROFILE.LANGUAGE_SELECTION}
      component={(props) => <LanguageSelectionPage {...props} stores={stores} actions={actions} />}
    />
    <Route
      path={ROUTES.PROFILE.TERMS_OF_USE}
      component={(props) => <TermsOfUsePage {...props} stores={stores} actions={actions} />}
    />
    <Route
      path={ROUTES.NO_WALLETS}
      component={(props) => <NoWalletsPage {...props} stores={stores} actions={actions} />}
    />
    <Route
      path={ROUTES.WALLETS.ADD}
      component={(props) => <WalletAddPage {...props} stores={stores} actions={actions} />}
    />
    <Route
      path={ROUTES.WALLETS.ROOT}
      component={(props) => <Wallet {...props} stores={stores} actions={actions} />}
    >
      <Route
        path={ROUTES.WALLETS.TRANSACTIONS}
        component={(props) => <WalletSummaryPage {...props} stores={stores} actions={actions} />}
      />
      <Route
        path={ROUTES.WALLETS.SEND}
        component={(props) => <WalletSendPage {...props} stores={stores} actions={actions} />}
      />
      <Route
        path={ROUTES.WALLETS.RECEIVE}
        component={(props) => <WalletReceivePage {...props} stores={stores} actions={actions} />}
      />
    </Route>
    <Route
      path="/settings"
      component={(props) => <Settings {...props} stores={stores} actions={actions} />}
    >
      <IndexRedirect to="general" />
      <Route
        path="general"
        component={(props) => <GeneralSettingsPage {...props} stores={stores} actions={actions} />}
      />
      <Route
        path="terms-of-use"
        component={(props) => <TermsOfUseSettingsPage {...props} stores={stores} actions={actions} />}
      />
      <Route
        path={ROUTES.SETTINGS.WALLET}
        component={(props) => <WalletSettingsPage {...props} stores={stores} actions={actions} />}
      />
      <Route
        path="support"
        component={(props) => <SupportSettingsPage {...props} stores={stores} actions={actions} />}
      />
    </Route>
    <Route
      path={ROUTES.DAEDALUS_TRANFER.ROOT}
      component={(props) => <DaedalusTransferPage {...props} stores={stores} actions={actions} />}
    />
  </div>
);
/* eslint-enable max-len */
