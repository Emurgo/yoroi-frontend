// @flow
import React from 'react';
import type { Node } from 'react';
import { Route, Redirect, Switch } from 'react-router-dom';
import type { StoresMap } from '../stores/index';
import type { ActionsMap } from '../actions/index';
import { ROUTES } from './routes-config';

// PAGES
import ConnectContainer from './containers/connect/ConnectContainer';
import Layout from './components/layout/Layout';

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
        component={props => <h1>List of connected website</h1>}
      />
      <Redirect to={ROUTES.ROOT} />
    </Switch>
  </Layout>
);
