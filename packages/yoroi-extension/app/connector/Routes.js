// @flow
import { Route, Routes, useLocation } from 'react-router';
import type { StoresMap } from './stores/index';
import type { $npm$ReactIntl$IntlShape } from 'react-intl';
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
        <ConnectorLayout
          networkId={stores.profile.getCurrentNetworkId()}
          intl={intl}
        >
          {getContent(stores)}
        </ConnectorLayout>
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
