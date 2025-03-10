import type { StoresMap } from '../stores/index';
import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { ROUTES } from '../routes-config';
import { Layout } from '../../UI/features/connector/components/layout';
// import { SignTxPage } from './SignTxPage';
import { ConnectPage } from './ConnectPage';
import LoadingPage from '../../containers/LoadingPage';
// import { useObserver } from 'mobx-react';

export const Routes = (stores: StoresMap): React.ReactElement => {
  if (stores.loading.isLoading) {
    return <LoadingPage stores={stores} />;
  }
  return wrapPages(getContent(stores));
};

const getContent = (stores: StoresMap): React.ReactElement => {
  return (
    <Switch>
      <Route exact path={ROUTES.ROOT} render={props => <ConnectPage {...props} stores={stores} />} />
      {/* <Route exact path={ROUTES.SIGNIN_TRANSACTION} render={props => <SignTxPage {...props} stores={stores} />} /> */}
    </Switch>
  );
};

const wrapPages = (children: React.ReactNode): React.ReactElement => {
  return <Layout>{children}</Layout>;
};
