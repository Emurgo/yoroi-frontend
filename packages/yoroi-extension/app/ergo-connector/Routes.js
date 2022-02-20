// @flow
import type { Node } from 'react';
import { Route, Switch } from 'react-router-dom';
import type { StoresMap } from './stores/index';
import type { ActionsMap } from './actions/index';
import { ROUTES } from './routes-config';

// PAGES
import ConnectContainer from './containers/ConnectContainer';
import Layout from './components/layout/Layout';
import SignTxContainer from './containers/SignTxContainer';
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
      path={ROUTES.ROOT}
      component={_props =>
        wrapGeneralPages(GeneralSubpages(stores, actions))
      }
    />
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
      path={ROUTES.SIGNIN_TRANSACTION}
      component={props => <SignTxContainer {...props} stores={stores} actions={actions} />}
    />
  </Switch>
);

export function wrapGeneralPages(children: Node): Node {
  return <Layout>{children}</Layout>;
}
