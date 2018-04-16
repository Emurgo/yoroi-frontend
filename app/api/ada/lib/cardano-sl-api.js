import { request } from './request';

const BackendApiRoute = 'localhost';
const BackendApiPort = 8080;

export const syncStatus = () =>
  request({
    hostname: BackendApiRoute,
    method: 'GET',
    path: '/api/settings/sync/progress',
    port: BackendApiPort
  });

export const getUTXOsOfAddress = address =>
  request({
    hostname: BackendApiRoute,
    method: 'GET',
    path: `/api/txs/utxoForAddress/${address}`,
    port: BackendApiPort
  });

export const sendTx = signedTx =>
  request(
    {
      hostname: BackendApiRoute,
      method: 'POST',
      path: '/api/txs/signed',
      port: BackendApiPort
    },
    undefined,
    signedTx
  );
