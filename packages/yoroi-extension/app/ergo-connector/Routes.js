// @flow
import React from 'react';
import type { Node } from 'react';
import { Route, Redirect, Switch } from 'react-router-dom';
import type { StoresMap } from './stores/index';
import type { ActionsMap } from './actions/index';
import { ROUTES } from './routes-config';

// PAGES
import ConnectContainer from './containers/ConnectContainer';
import ConnectWebsitesContainer from './containers/ConnectWebsitesContainer';
import Layout from './components/layout/Layout';
import SignTxContainer from './containers/SignTxContainer';
import SettingsContainer from './containers/SettingsContainer';
import TermsOfUseContainer from './containers/TermsOfUseContainer';
import SupportContainer from './containers/SupportContainer';
import AboutContainer from './containers/AboutContainer';
import LoadingPage from '../containers/LoadingPage';

export const Routes = (stores: StoresMap, actions: ActionsMap): Node => {
  if (stores.loading.isLoading) {
    return <LoadingPage stores={stores} actions={actions} />;
  }
  return ToplevelPages(stores, actions);
};

const ToplevelPages = (stores: StoresMap, actions: ActionsMap): Node => (
  <Switch>
    <Route
      exact
      path={ROUTES.SETTINGS.GENERAL}
      component={props => <SettingsContainer {...props} stores={stores} actions={actions} />}
    />
    <Route
      exact
      path={ROUTES.SETTINGS.TERMS_OF_USE}
      component={props => <TermsOfUseContainer {...props} stores={stores} actions={actions} />}
    />
    <Route
      exact
      path={ROUTES.SETTINGS.SUPPORT}
      component={props => <SupportContainer {...props} stores={stores} actions={actions} />}
    />
    <Route
      exact
      path={ROUTES.SETTINGS.ABOUT}
      component={props => <AboutContainer {...props} stores={stores} actions={actions} />}
    />
    <Route
      path={ROUTES.ROOT}
      component={_props =>
        wrapGeneralPages(GeneralSubpages(stores, actions))
      }
    />
    <Redirect to={ROUTES.SETTINGS.GENERAL} />
  </Switch>
);

const GeneralSubpages = (stores, actions) => (
  <Switch>
    <Route
      exact
      path={ROUTES.ROOT}
      component={props => <ConnectContainer {...props} stores={stores} actions={actions} />}
    />
    <Route
      exact
      path={ROUTES.CONNECTED_WEBSITES}
      component={props => <ConnectWebsitesContainer {...props} stores={stores} actions={actions} />}
    />
    <Route
      exact
      path={ROUTES.SIGNIN_TRANSACTION}
      component={props => <SignTxContainer {...props} stores={stores} actions={actions} />}
    />
    <Redirect to={ROUTES.SETTINGS.GENERAL} />
  </Switch>
);

export function wrapGeneralPages(children: Node): Node {
  return <Layout>{children}</Layout>;
}
