import { request } from './request';

const ExplorerApiRoute = 'explorer.iohkdev.io';
const ExplorerApiPort = 443;

export const getInfo = address =>
  request({
    hostname: ExplorerApiRoute,
    method: 'GET',
    path: `/api/addresses/summary/${address}`,
    port: ExplorerApiPort
  });
