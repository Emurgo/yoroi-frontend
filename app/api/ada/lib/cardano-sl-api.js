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
