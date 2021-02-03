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

export const Routes = (stores: StoresMap, actions: ActionsMap): Node => (
  <Layout>
    <Switch>
      <Route
        exact
        path={ROUTES.ROOT}
        component={props => <ConnectContainer {...props} stores={stores} actions={actions} />}
      />
      <Route
        exact
        path={ROUTES.CONNECTED_WEBSITES}
        component={props => (
          <ConnectWebsitesContainer {...props} stores={stores} actions={actions} />
        )}
      />
      <Route
        exact
        path={ROUTES.SIGNIN_TRANSACTION}
        component={props => <SignTxContainer {...props} stores={stores} actions={actions} />}
      />
      <Route exact path={ROUTES.DETAILS} component={() => <h1>Welcome to details page</h1>} />
      <Route exact path={ROUTES.SETTINGS} component={() => <h1>Welcome to settings page</h1>} />
      <Redirect to={ROUTES.ROOT} />
    </Switch>
  </Layout>
);
