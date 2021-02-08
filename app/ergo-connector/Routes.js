// @flow
import React from 'react';
import type { Node } from 'react';
import { Route, Redirect, Switch } from 'react-router-dom';
import type { StoresMap } from '../stores/index';
import type { ActionsMap } from '../actions/index';
import { ROUTES } from './routes-config';

// PAGES
import ConnectContainer from './containers/ConnectContainer';
import ConnectWebsitesContainer from './containers/ConnectWebsitesContainer';
import Layout from './components/layout/Layout';
import SignTxContainer from './containers/SignTxContainer';
import SettingsContainer from './containers/SettingsContainer';
import type { InjectedOrGenerated } from '../types/injectedPropsType';
import type { GeneratedData as SettingsData } from '../containers/settings/Settings';

export const Routes = (stores: StoresMap, actions: ActionsMap): Node => (
  <Switch>
    <Route
      exact
      path={ROUTES.SETTINGS}
      component={props => <SettingsContainer {...props} stores={stores} actions={actions} />}
    />
    <Route
      path={ROUTES.ROOT}
      component={props =>
        wrapGeneralPages({ ...props, stores, actions }, GeneralSubpages(stores, actions))
      }
    />
    <Redirect to={ROUTES.SETTINGS} />
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
    <Redirect to={ROUTES.SETTINGS} />
  </Switch>
);

export function wrapGeneralPages(
  generalProps: InjectedOrGenerated<SettingsData>,
  children: Node
): Node {
  return <Layout {...generalProps}>{children}</Layout>;
}
