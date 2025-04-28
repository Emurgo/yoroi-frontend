// @flow
import type { Node } from 'react';
import { Route, Routes, useLocation } from 'react-router';
import type { StoresMap } from './stores/index';
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

type Props = {| stores: StoresMap |};
type Intl = {| intl: $npm$ReactIntl$IntlShape |};
export const YoroiRoutes: React$ComponentType<Props>  = injectIntl(observer((props: Props & Intl) => {
  const { stores, intl } = props;
  const title = intl.formatMessage(
    useLocation().pathname === ROUTES.SELECT_CASHBACK_WALLET ?
      messages.yoroiConnector : messages.yoroiDappConnector
  );

  return (
    <>
      <Helmet><title>{title}</title></Helmet>
      {stores.loading.isLoading ? (
        <LoadingPage stores={(stores: StoresMap)} />
      ) : (
        <Layout
          networkId={stores.profile.getCurrentNetworkId()}
          intl={intl}
        >
          {getContent(stores)}
        </Layout>
      )}
    </>
  );
}));

const getContent = (stores) => (
  <Routes>
    <Route
      path={ROUTES.ROOT}
      element={<ConnectContainer stores={stores} />}
    />
    <Route
      path={ROUTES.SIGNIN_TRANSACTION}
      element={<SignTxContainer stores={stores} />}
    />
    <Route
      path={ROUTES.SELECT_CASHBACK_WALLET}
      element={<SelectCashbackWalletContainer stores={stores} />}
    />
  </Routes>
);
