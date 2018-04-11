import { request } from './request';

const ExplorerApiRoute = 'explorer.iohkdev.io';

export const getInfo = address =>
  request({
    hostname: ExplorerApiRoute,
    method: 'GET',
    path: `/api/addresses/summary/${address}`,
    port: 443
  });
