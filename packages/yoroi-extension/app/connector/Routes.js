// @flow
import type { Node } from 'react';
import { Route, Switch } from 'react-router-dom';
import type { StoresMap } from './stores/index';
import { ROUTES } from './routes-config';

// PAGES
import ConnectContainer from './containers/ConnectContainer';
import Layout from './components/layout/Layout';
import SignTxContainer from './containers/SignTxContainer';
import LoadingPage from '../containers/LoadingPage';

export const Routes = (stores: StoresMap): Node => {
  if (stores.loading.isLoading) {
    return <LoadingPage stores={stores} />;
  }
  return wrapPages(getContent(stores));
};

const getContent = (stores) => (
  <Switch>
    <Route
      exact
      path={ROUTES.ROOT}
      component={props => <ConnectContainer {...props} stores={stores} />}
    />
    <Route
      exact
      path={ROUTES.SIGNIN_TRANSACTION}
      component={props => <SignTxContainer {...props} stores={stores} />}
    />
  </Switch>
);

export function wrapPages(children: Node): Node {
  return <Layout>{children}</Layout>;
}
