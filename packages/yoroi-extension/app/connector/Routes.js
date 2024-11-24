// @flow
import type { Node } from 'react';
import { Route, Switch, useLocation } from 'react-router-dom';
import type { StoresMap } from './stores/index';
import type { ActionsMap } from './actions/index';
import { ROUTES } from './routes-config';
import Helmet from 'react-helmet';
import { injectIntl } from 'react-intl';
import type { $npm$ReactIntl$IntlShape } from 'react-intl';
import { observer } from 'mobx-react';

// PAGES
import ConnectContainer from './containers/ConnectContainer';
import Layout, { messages } from './components/layout/Layout';
import SignTxContainer from './containers/SignTxContainer';
import LoadingPage from '../containers/LoadingPage';
import SelectCashbackWalletContainer from './containers/SelectCashbackWalletContainer';

type Props = {| stores: StoresMap, actions: ActionsMap, |};
type Intl = {| intl: $npm$ReactIntl$IntlShape |};
export const Routes: React$ComponentType<Props>  = injectIntl(observer((props: Props & Intl) => {
  const { stores, actions, intl } = props;
  const title = intl.formatMessage(
    useLocation().pathname === ROUTES.SELECT_CASHBACK_WALLET ?
      messages.yoroiConnector : messages.yoroiDappConnector
  );

  return (
    <>
      <Helmet><title>Yoroi Connector</title></Helmet>
      {stores.loading.isLoading ? (
        <LoadingPage stores={stores} actions={actions} />
      ) : (
        wrapPages(getContent(stores, actions))
      )}
    </>
  );
}));

const getContent = (stores, actions) => (
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
    <Route
      exact
      path={ROUTES.SELECT_CASHBACK_WALLET}
      component={props => <SelectCashbackWalletContainer {...props} stores={stores} actions={actions} />}
    />
  </Switch>
);

export function wrapPages(children: Node): Node {
  return <Layout>{children}</Layout>;
}
