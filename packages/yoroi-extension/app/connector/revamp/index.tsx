import React from 'react';
import { HashRouter as Router } from 'react-router-dom';
import { Routes } from './Routes';
import type { ConnectorStoresProps } from '../stores';
import ErrorBlock from '../../components/widgets/ErrorBlock';
import { Layout } from '../../UI/features/connector/components/layout';

type Props = ConnectorStoresProps;

export const RevampConnector: React.FC<Props> = ({ stores }) => {
  if (!stores) {
    return (
      <Layout>
        <ErrorBlock error="Store initialization failed" />
      </Layout>
    );
  }

  return (
    <Router>
      <Routes stores={stores} />
    </Router>
  );
}; 