
import { parseResponse, handleErrors } from './apiUtils';

const ExplorerApi = {};

ExplorerApi.config = {
  serverRoute: 'https://explorer.iohkdev.io/api'
};

ExplorerApi.wallet = {};

ExplorerApi.wallet.getInfo = function (walletId) {
  return fetch(`${ExplorerApi.config.serverRoute}/addresses/summary/${walletId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
  })
  .then(parseResponse)
  .then(handleErrors);
};

export default ExplorerApi;
