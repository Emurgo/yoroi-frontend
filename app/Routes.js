// @flow
import React from 'react';
import { Route, IndexRedirect } from 'react-router';
import { ROUTES } from './routes-config';
import resolver from './utils/imports';

// PAGES
import NoWalletsPage from './containers/wallet/NoWalletsPage';
import WalletAddPage from './containers/wallet/WalletAddPage';
import LanguageSelectionPage from './containers/profile/LanguageSelectionPage';
import Settings from './containers/settings/Settings';
import GeneralSettingsPage from './containers/settings/categories/GeneralSettingsPage';
import TermsOfUseSettingsPage from './containers/settings/categories/TermsOfUseSettingsPage';
import TermsOfUsePage from './containers/profile/TermsOfUsePage';

// Dynamic container loading - resolver loads file relative to '/app/' directory
const LoadingPage = resolver('containers/LoadingPage');
const Wallet = resolver('containers/wallet/Wallet');
const WalletSummaryPage = resolver('containers/wallet/WalletSummaryPage');
const WalletSendPage = resolver('containers/wallet/WalletSendPage');
const WalletReceivePage = resolver('containers/wallet/WalletReceivePage');
const WalletSettingsPage = resolver('containers/wallet/WalletSettingsPage');
const DaedalusTransferPage = resolver('containers/daedalusTransfer/DaedalusTransferPage');

export const Routes = (
  <div>
    <Route path={ROUTES.ROOT} component={LoadingPage} />
    <Route path={ROUTES.PROFILE.LANGUAGE_SELECTION} component={LanguageSelectionPage} />
    <Route path={ROUTES.PROFILE.TERMS_OF_USE} component={TermsOfUsePage} />
    <Route path={ROUTES.NO_WALLETS} component={NoWalletsPage} />
    <Route path={ROUTES.WALLETS.ADD} component={WalletAddPage} />
    <Route path={ROUTES.WALLETS.ROOT} component={Wallet}>
      <Route path={ROUTES.WALLETS.SUMMARY} component={WalletSummaryPage} />
      <Route path={ROUTES.WALLETS.SEND} component={WalletSendPage} />
      <Route path={ROUTES.WALLETS.RECEIVE} component={WalletReceivePage} />
      <Route path={ROUTES.WALLETS.SETTINGS} component={WalletSettingsPage} />
    </Route>
    <Route path="/settings" component={Settings}>
      <IndexRedirect to="general" />
      <Route path="general" component={GeneralSettingsPage} />
      <Route path="terms-of-use" component={TermsOfUseSettingsPage} />
    </Route>
    <Route path={ROUTES.DAEDALUS_TRANFER.ROOT} component={DaedalusTransferPage} />
  </div>
);
