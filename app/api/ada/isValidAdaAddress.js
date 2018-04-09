// @flow
import { request } from './lib/request';

export type IsValidAdaAddressParams = {
  /*ca: string,*/
  address: string,
};

export const isValidAdaAddress = (
  { /*ca, */ address }: IsValidAdaAddressParams
): Promise<boolean> => {
  // FIXME: Do this method
  //const encodedAddress = encodeURIComponent(address);
  /*return request({
    hostname: 'localhost',
    method: 'GET',
    path: `/api/addresses/${encodedAddress}`,
    port: 8090,
    ca,
  });*/
  return Promise.resolve(true);
};
