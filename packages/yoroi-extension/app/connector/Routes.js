// @flow
import type { Node } from 'react';
import type { StoresMap } from './stores/index';
import type { $npm$ReactIntl$IntlShape } from 'react-intl';
import { Route, Switch, useLocation } from 'react-router-dom';
import { ROUTES } from './routes-config';
import Helmet from 'react-helmet';
import { injectIntl } from 'react-intl';
import { observer } from 'mobx-react';

// $FlowIgnore: suppressing this error
import ConnectorLayout, { messages } from '../UI/layout/ConnectorLayout';
// PAGES
import ConnectContainer from './containers/ConnectContainer';
import SignTxContainer from './containers/SignTxContainer';
import LoadingPage from '../containers/LoadingPage';
import SelectCashbackWalletContainer from './containers/SelectCashbackWalletContainer';

type Props = {| stores: StoresMap |};

type Intl = {| intl: $npm$ReactIntl$IntlShape |};

export const Routes: React$ComponentType<Props> = injectIntl(
  observer((props: Props & Intl) => {
    const { stores, intl } = props;
    const title = intl.formatMessage(
      useLocation().pathname === ROUTES.SELECT_CASHBACK_WALLET ? messages.yoroiConnector : messages.yoroiDappConnector
    );

    return (
      <>
        <Helmet>
          <title>{title}</title>
        </Helmet>
        {stores.loading.isLoading ? <LoadingPage stores={stores} /> : wrapPages(getContent(stores), stores)}
      </>
    );
  })
);

const getContent = stores => (
  <Switch>
    <Route exact path={ROUTES.ROOT} component={props => <ConnectContainer {...props} stores={stores} />} />
    <Route exact path={ROUTES.SIGNIN_TRANSACTION} component={props => <SignTxContainer {...props} stores={stores} />} />
    <Route
      exact
      path={ROUTES.SELECT_CASHBACK_WALLET}
      component={props => <SelectCashbackWalletContainer {...props} stores={stores} />}
    />
  </Switch>
);

function wrapPages(children: Node, stores: StoresMap): Node {
  return <ConnectorLayout networkId={stores.profile.getCurrentNetworkId()}>{children}</ConnectorLayout>;
}
